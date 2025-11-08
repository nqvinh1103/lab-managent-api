import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import {
    CreateInstrumentReagentInput,
    IInstrumentReagent,
    InstrumentReagentDocument,
    UpdateInstrumentReagentInput
} from '../models/InstrumentReagent';
import { toObjectId } from '../utils/database.helper';
import { logEvent } from '../utils/eventLog.helper';
import { withTransaction } from '../utils/transaction.helper';
import { ReagentService } from './reagent.service';
import { ReagentInventoryService } from './reagentInventory.service';

const COLLECTION = 'instrument_reagents';

// Create - Install reagent with validation (3.6.2.1)
export const createInstrumentReagent = async (data: CreateInstrumentReagentInput, userId: string | ObjectId): Promise<InstrumentReagentDocument> => {
  const collection = getCollection<IInstrumentReagent>(COLLECTION);
  const now = new Date();

  // Validate and convert userId to ObjectId
  const userObjectId = toObjectId(userId);
  if (!userObjectId) {
    throw new Error('Invalid user ID');
  }

  // Validate and convert instrument_id to ObjectId
  const instrumentObjectId = toObjectId(data.instrument_id);
  if (!instrumentObjectId) {
    throw new Error('Invalid instrument ID');
  }

  // Validate and convert reagent_inventory_id to ObjectId
  if (!data.reagent_inventory_id) {
    throw new Error('reagent_inventory_id is required');
  }
  const reagentInventoryObjectId = toObjectId(data.reagent_inventory_id);
  if (!reagentInventoryObjectId) {
    throw new Error('Invalid reagent inventory ID');
  }

  // Validate quantity must be greater than 0
  if (data.quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  // Get inventory and validate (outside transaction for initial checks)
  const inventoryService = new ReagentInventoryService();
  const inventoryResult = await inventoryService.findById(reagentInventoryObjectId);
  
  if (!inventoryResult.success || !inventoryResult.data) {
    throw new Error('Reagent inventory not found');
  }

  const inventory = inventoryResult.data;

  // Get reagent master data (outside transaction for initial checks)
  const reagentService = new ReagentService();
  const reagentResult = await reagentService.findById(inventory.reagent_id.toString());
  
  if (!reagentResult.success || !reagentResult.data) {
    throw new Error('Reagent master not found');
  }

  const reagent = reagentResult.data;

  // Execute within transaction: check existing reagents + insert/update InstrumentReagent + atomic stock deduction
  // Transaction ensures all operations succeed or fail together
  const result = await withTransaction(async (session) => {
    // Check if reagent with same reagent_inventory_id AND instrument_id AND status 'in_use' exists
    const existingSameInventory = await collection.findOne({
      instrument_id: instrumentObjectId,
      reagent_inventory_id: reagentInventoryObjectId,
      status: 'in_use'
    }, { session });

    if (existingSameInventory) {
      // REFILL: Update quantity_remaining and total quantity
      // First, deduct stock from inventory
      const updatedInventory = await inventoryService.atomicDeductStock(
        reagentInventoryObjectId,
        data.quantity,
        session
      );

      if (!updatedInventory) {
        throw new Error(`Insufficient stock. Available stock is less than requested quantity (${data.quantity})`);
      }

      // Update expiration_date if new one is later (fresher batch)
      const updateData: any = {
        quantity_remaining: existingSameInventory.quantity_remaining + data.quantity,
        quantity: existingSameInventory.quantity + data.quantity,
        updated_at: now
      };

      if (inventory.expiration_date) {
        const existingExpDate = existingSameInventory.expiration_date 
          ? new Date(existingSameInventory.expiration_date).getTime() 
          : 0;
        const newExpDate = new Date(inventory.expiration_date).getTime();
        
        if (newExpDate > existingExpDate) {
          updateData.expiration_date = inventory.expiration_date;
        }
      }

      const updatedReagent = await collection.findOneAndUpdate(
        { _id: existingSameInventory._id },
        { $set: updateData },
        { returnDocument: 'after', session }
      );

      if (!updatedReagent) {
        throw new Error('Failed to update reagent');
      }

      return { doc: updatedReagent as InstrumentReagentDocument, isRefill: true };
    }

    // Check if reagent with same reagent_name but different reagent_inventory_id exists
    const existingDifferentInventory = await collection.findOne({
      instrument_id: instrumentObjectId,
      reagent_name: reagent.reagent_name,
      status: 'in_use',
      reagent_inventory_id: { $ne: reagentInventoryObjectId }
    }, { session });

    if (existingDifferentInventory) {
      throw new Error(
        `Reagent "${reagent.reagent_name}" from different inventory (lot: ${existingDifferentInventory.reagent_lot_number}) is already installed. ` +
        `Please remove the existing reagent before installing a new one with lot number ${inventory.lot_number}.`
      );
    }

    // No existing reagent - create new one
    // Atomic stock deduction - prevents race conditions
    const updatedInventory = await inventoryService.atomicDeductStock(
      reagentInventoryObjectId,
      data.quantity,
      session
    );

    if (!updatedInventory) {
      throw new Error(`Insufficient stock. Available stock is less than requested quantity (${data.quantity})`);
    }

    // quantity_remaining always equals quantity when first installed
    const quantity_remaining = data.quantity;

    // Populate master data and inventory data
    const docToInsert: IInstrumentReagent = {
      instrument_id: instrumentObjectId, // Ensure it's ObjectId
      reagent_inventory_id: reagentInventoryObjectId, // Ensure it's ObjectId
      reagent_id: inventory.reagent_id,
      // Master data from Reagent
      reagent_name: reagent.reagent_name,
      description: reagent.description,
      usage_per_run_min: reagent.usage_per_run_min,
      usage_per_run_max: reagent.usage_per_run_max,
      usage_unit: reagent.usage_unit,
      // Batch info from Inventory
      reagent_lot_number: inventory.lot_number,
      expiration_date: inventory.expiration_date,
      // Installation info
      quantity: data.quantity,
      quantity_remaining,
      installed_at: data.installed_at || now,
      installed_by: data.installed_by || userObjectId,
      status: 'in_use', // Default status when installing
      created_by: userObjectId,
      _id: new ObjectId(),
      created_at: now
    };

    // Insert InstrumentReagent within transaction
    await collection.insertOne(docToInsert, { session });

    return { doc: docToInsert as InstrumentReagentDocument, isRefill: false };
  });

  const newDoc = result.doc;
  const isRefill = result.isRefill;

  // Log event for audit trail (SRS 3.6.2.1) - outside transaction
  // Event logging failure should not fail the installation
  try {
    // Handle expiration_date: could be Date object or string from MongoDB
    const expirationDate = inventory.expiration_date instanceof Date 
      ? inventory.expiration_date.toISOString()
      : typeof inventory.expiration_date === 'string'
        ? inventory.expiration_date
        : new Date(inventory.expiration_date).toISOString();

    const eventAction = isRefill ? 'UPDATE' : 'CREATE';
    const eventMessage = isRefill 
      ? `Refilled reagent: ${reagent.reagent_name} (Lot: ${inventory.lot_number}) on instrument ${data.instrument_id}`
      : `Installed reagent: ${reagent.reagent_name} (Lot: ${inventory.lot_number}) on instrument ${data.instrument_id}`;

    await logEvent(
      eventAction,
      'InstrumentReagent',
      newDoc._id!,
      userObjectId,
      eventMessage,
      {
        reagent_name: reagent.reagent_name,
        reagent_id: inventory.reagent_id.toString(),
        reagent_inventory_id: data.reagent_inventory_id.toString(),
        reagent_lot_number: inventory.lot_number,
        expiration_date: expirationDate,
        quantity: data.quantity,
        quantity_remaining: newDoc.quantity_remaining,
        is_refill: isRefill,
        instrument_id: data.instrument_id.toString()
      }
    );
  } catch (logError) {
    // Log error but don't fail the reagent installation
    console.warn('⚠️ Failed to create event log:', logError);
    // Continue without throwing error
  }

  return newDoc as InstrumentReagentDocument;
};

// Read all
export const getAllInstrumentReagents = async (): Promise<InstrumentReagentDocument[]> => {
  const collection = getCollection<IInstrumentReagent>(COLLECTION);
  return await collection.find({}).toArray() as InstrumentReagentDocument[];
};

// Read by id
export const getInstrumentReagentById = async (id: string): Promise<InstrumentReagentDocument> => {
  if (!ObjectId.isValid(id)) throw new Error('Invalid ObjectId');

  const collection = getCollection<IInstrumentReagent>(COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error('Document not found');

  return doc as InstrumentReagentDocument;
};

export const updateInstrumentReagent = async (
  id: string,
  data: UpdateInstrumentReagentInput
): Promise<InstrumentReagentDocument> => {
  if (!ObjectId.isValid(id)) throw new Error('Invalid ObjectId');

  const collection = getCollection<IInstrumentReagent>(COLLECTION);

  const allowedFields: (keyof UpdateInstrumentReagentInput)[] = [
    'instrument_id',
    'reagent_lot_number',
    'quantity',
    'quantity_remaining',
    'expiration_date',
    'installed_at',
    'installed_by',
    'removed_at',
    'removed_by',
    'status',
    'created_by'
  ];

  const updateData: Partial<IInstrumentReagent> = {};
  allowedFields.forEach((key) => {
    if (key in data) (updateData as any)[key] = data[key];
  });

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) throw new Error('Document not found');

  return result as InstrumentReagentDocument;
};

// Update status with validation (3.6.2.2)
export const updateReagentStatus = async (
  id: string,
  newStatus: 'in_use' | 'not_in_use' | 'expired'
): Promise<InstrumentReagentDocument> => {
  if (!ObjectId.isValid(id)) throw new Error('Invalid ObjectId');

  const collection = getCollection<IInstrumentReagent>(COLLECTION);

  // Get current reagent
  const reagent = await collection.findOne({ _id: new ObjectId(id) });
  if (!reagent) throw new Error('Reagent not found');

  // Validation: cannot change to same status
  if (reagent.status === newStatus) {
    throw new Error(`Reagent is already marked as "${newStatus}"`);
  }

  // Update status
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status: newStatus } },
    { returnDocument: 'after' }
  );

  if (!result) throw new Error('Failed to update reagent status');

  return result as InstrumentReagentDocument;
};

// Delete
export const deleteInstrumentReagent = async (id: string): Promise<void> => {
  if (!ObjectId.isValid(id)) throw new Error('Invalid ObjectId');

  const collection = getCollection<IInstrumentReagent>(COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) throw new Error('Document not found');
};
