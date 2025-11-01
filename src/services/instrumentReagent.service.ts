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

  // Validate reagent_inventory_id exists
  if (!data.reagent_inventory_id) {
    throw new Error('reagent_inventory_id is required');
  }

  // Validate quantity must be greater than 0
  if (data.quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  // Get inventory and validate
  const inventoryService = new ReagentInventoryService();
  const inventoryResult = await inventoryService.findById(data.reagent_inventory_id);
  
  if (!inventoryResult.success || !inventoryResult.data) {
    throw new Error('Reagent inventory not found');
  }

  const inventory = inventoryResult.data;

  // Validate inventory status and stock
  const validationResult = await inventoryService.validateForInstallation(data.reagent_inventory_id, data.quantity);
  if (!validationResult.success) {
    throw new Error(validationResult.error || 'Inventory validation failed');
  }

  // Get reagent master data
  const reagentService = new ReagentService();
  const reagentResult = await reagentService.findById(inventory.reagent_id.toString());
  
  if (!reagentResult.success || !reagentResult.data) {
    throw new Error('Reagent master not found');
  }

  const reagent = reagentResult.data;

  // quantity_remaining always equals quantity when first installed
  const quantity_remaining = data.quantity;

  // Populate master data and inventory data
  const newDoc: IInstrumentReagent = {
    instrument_id: data.instrument_id,
    reagent_inventory_id: data.reagent_inventory_id,
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

  // Insert InstrumentReagent first
  await collection.insertOne(newDoc);

  // Update inventory stock: quantity_in_stock -= quantity_installed
  // If this fails, rollback by deleting the InstrumentReagent record to maintain consistency
  try {
    const newStock = inventory.quantity_in_stock - data.quantity;
    const updateStockResult = await inventoryService.updateStock(data.reagent_inventory_id, { quantity_in_stock: newStock });
    
    if (!updateStockResult.success) {
      // Rollback: Delete the InstrumentReagent record that was just created
      await collection.deleteOne({ _id: newDoc._id });
      throw new Error(`Failed to update inventory stock: ${updateStockResult.error || 'Unknown error'}`);
    }
  } catch (stockError) {
    // Rollback: Delete the InstrumentReagent record if it exists
    try {
      await collection.deleteOne({ _id: newDoc._id });
    } catch (deleteError) {
      // Log but continue with original error
      console.error('⚠️ Failed to rollback InstrumentReagent after stock update failure:', deleteError);
    }
    // Re-throw the original error to fail the installation
    throw stockError instanceof Error ? stockError : new Error('Failed to update inventory stock');
  }

  // Log event for audit trail (SRS 3.6.2.1)
  try {
    // Handle expiration_date: could be Date object or string from MongoDB
    const expirationDate = inventory.expiration_date instanceof Date 
      ? inventory.expiration_date.toISOString()
      : typeof inventory.expiration_date === 'string'
        ? inventory.expiration_date
        : new Date(inventory.expiration_date).toISOString();

    await logEvent(
      'CREATE',
      'InstrumentReagent',
      newDoc._id!,
      userObjectId,
      `Installed reagent: ${reagent.reagent_name} (Lot: ${inventory.lot_number}) on instrument ${data.instrument_id}`,
      {
        reagent_name: reagent.reagent_name,
        reagent_id: inventory.reagent_id.toString(),
        reagent_inventory_id: data.reagent_inventory_id.toString(),
        reagent_lot_number: inventory.lot_number,
        expiration_date: expirationDate,
        quantity: data.quantity,
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
