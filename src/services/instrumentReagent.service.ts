import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import {
  IInstrumentReagent,
  InstrumentReagentDocument,
  CreateInstrumentReagentInput,
  UpdateInstrumentReagentInput
} from '../models/InstrumentReagent';
import { ReagentVendorSupplyService } from './reagentVendorSupply.service';
import { toObjectId } from '../utils/database.helper';

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

  // Validation: expiration_date must be in the future
  if (data.expiration_date <= now) {
    throw new Error('Expiration date must be set to a future date');
  }

  // Validation: quantity must be greater than 0
  if (data.quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  // Validation: all required fields must be present
  if (!data.reagent_name || !data.reagent_lot_number || !data.vendor_name) {
    throw new Error('Missing required fields: reagent_name, reagent_lot_number, and vendor_name are required');
  }

  // Set quantity_remaining to quantity if not provided
  const quantity_remaining = data.quantity_remaining !== undefined ? data.quantity_remaining : data.quantity;

  const newDoc: IInstrumentReagent = {
    ...data,
    created_by: userObjectId,
    quantity_remaining,
    _id: new ObjectId(),
    created_at: now,
    status: 'in_use' // Default status when installing
  };

  await collection.insertOne(newDoc);

  // Auto-create VendorSupplyHistory record (3.3.2.1)
  try {
    const vendorSupplyService = new ReagentVendorSupplyService();
    await vendorSupplyService.create({
      reagent_name: data.reagent_name,
      vendor_name: data.vendor_name,
      receipt_date: data.installed_at, // Use installed_at as receipt_date
      quantity_received: data.quantity,
      lot_number: data.reagent_lot_number,
      expiration_date: data.expiration_date,
      received_by: data.installed_by
    });
    console.log('✅ Vendor supply history created automatically');
  } catch (vendorError) {
    // Log error but don't fail the reagent installation
    console.warn('⚠️ Failed to create vendor supply history:', vendorError);
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
    'reagent_name',
    'reagent_lot_number',
    'quantity',
    'quantity_remaining',
    'expiration_date',
    'vendor_name',
    'vendor_id',
    'vendor_contact',
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
