import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import {
  IReagentUsageHistory,
  ReagentUsageHistoryDocument,
  CreateReagentUsageHistoryInput,
} from '../models/ReagentUsageHistory';

const COLLECTION = 'reagent_usage_history';

export const createReagentUsageHistory = async (
  input: CreateReagentUsageHistoryInput,
  createdBy: string | ObjectId
): Promise<ReagentUsageHistoryDocument> => {
  const collection = getCollection<IReagentUsageHistory>(COLLECTION);
  const now = new Date();

  const createdById = createdBy instanceof ObjectId ? createdBy : new ObjectId(String(createdBy));

  // Resolve instrument_id: prefer provided id, otherwise resolve by instrument_barcode (or serial_number),
  // fallback to instrument_name if provided. This lets frontend submit a barcode and we store the instrument _id.
  const instrumentCollection = getCollection<any>('instruments');
  let instrumentId: ObjectId | undefined;
  if (input.instrument_id) {
    instrumentId = input.instrument_id instanceof ObjectId ? input.instrument_id : new ObjectId(String(input.instrument_id));
  } else if (input.instrument_barcode) {
    // Try lookup by barcode field first, then serial_number as fallback
    let inst = await instrumentCollection.findOne({ barcode: input.instrument_barcode });
    if (!inst) {
      inst = await instrumentCollection.findOne({ serial_number: input.instrument_barcode });
    }
    if (!inst) throw new Error(`Instrument with barcode/serial "${input.instrument_barcode}" not found`);
    instrumentId = inst._id instanceof ObjectId ? inst._id : new ObjectId(String(inst._id));
  } else if ((input as any).instrument_name) {
    const inst = await instrumentCollection.findOne({ instrument_name: (input as any).instrument_name });
    if (!inst) throw new Error(`Instrument with name "${(input as any).instrument_name}" not found`);
    instrumentId = inst._id instanceof ObjectId ? inst._id : new ObjectId(String(inst._id));
  } else {
    throw new Error('instrument_id or instrument_barcode (or instrument_name) is required');
  }

  // Resolve test order: allow frontend to submit either test_order_id or test_order_barcode.
  // If barcode is provided, lookup the test order and store its _id. If id is provided, try to resolve its barcode.
  let testOrderBarcode: string | undefined = undefined;
  let testOrderId: ObjectId | undefined = undefined;
  if ((input as any).test_order_barcode) {
    const testOrders = getCollection<any>('test_orders');
    const to = await testOrders.findOne({ barcode: (input as any).test_order_barcode });
    if (!to) throw new Error(`Test order with barcode "${(input as any).test_order_barcode}" not found`);
    testOrderId = to._id instanceof ObjectId ? to._id : new ObjectId(String(to._id));
    if (to.barcode) testOrderBarcode = to.barcode;
  } else if (input.test_order_id) {
    try {
      const testOrders = getCollection<any>('test_orders');
      const to = await testOrders.findOne({ _id: input.test_order_id instanceof ObjectId ? input.test_order_id : new ObjectId(String(input.test_order_id)) });
      if (to && to.barcode) testOrderBarcode = to.barcode;
      testOrderId = input.test_order_id instanceof ObjectId ? input.test_order_id : new ObjectId(String(input.test_order_id));
    } catch (err) {
      // ignore lookup errors, not critical
    }
  }

  const newDoc: IReagentUsageHistory = {
    reagent_lot_number: input.reagent_lot_number,
    instrument_id: instrumentId!,
  test_order_id: testOrderId as any,
  test_order_barcode: testOrderBarcode,
    quantity_used: input.quantity_used,
    used_by: input.used_by ? (input.used_by instanceof ObjectId ? input.used_by : new ObjectId(String(input.used_by))) : createdById,
    used_at: input.used_at || now,
    created_at: now,
    created_by: createdById,
  };

  const result = await collection.insertOne(newDoc as ReagentUsageHistoryDocument);
  const inserted = await collection.findOne({ _id: result.insertedId });
  if (!inserted) throw new Error('Failed to create reagent usage history');
  return inserted as ReagentUsageHistoryDocument;
};

export const getAllReagentUsageHistory = async (): Promise<ReagentUsageHistoryDocument[]> => {
  const collection = getCollection<ReagentUsageHistoryDocument>(COLLECTION);
  return collection.find().toArray() as Promise<ReagentUsageHistoryDocument[]>;
};

export const getReagentUsageHistoryById = async (id: string): Promise<ReagentUsageHistoryDocument | null> => {
  const collection = getCollection<ReagentUsageHistoryDocument>(COLLECTION);
  try {
    const _id = new ObjectId(id);
    const doc = await collection.findOne({ _id });
    return doc as ReagentUsageHistoryDocument | null;
  } catch (err) {
    return null;
  }
};

export const updateReagentUsageHistory = async (id: string, data: Partial<IReagentUsageHistory>): Promise<ReagentUsageHistoryDocument | null> => {
  const collection = getCollection<ReagentUsageHistoryDocument>(COLLECTION);
  try {
    const _id = new ObjectId(id);
    await collection.updateOne({ _id }, { $set: { ...data } });
    const updated = await collection.findOne({ _id });
    return updated as ReagentUsageHistoryDocument | null;
  } catch (err) {
    return null;
  }
};

export const deleteReagentUsageHistory = async (id: string): Promise<boolean> => {
  const collection = getCollection<ReagentUsageHistoryDocument>(COLLECTION);
  try {
    const _id = new ObjectId(id);
    const r = await collection.deleteOne({ _id });
    return r.deletedCount === 1;
  } catch (err) {
    return false;
  }
};
