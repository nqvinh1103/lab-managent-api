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
import { ObjectId, Sort } from 'mongodb';
import { getCollection } from '../config/database';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import {
  CreateReagentUsageHistoryInput,
  ReagentUsageHistoryDocument
} from '../models/ReagentUsageHistory';
import { createPaginationOptions, createSortOptions, QueryResult, toObjectId } from '../utils/database.helper';

export class ReagentUsageHistoryService {
  private getCollection() {
    return getCollection<ReagentUsageHistoryDocument>('reagent_usage_history');
  }

  async create(data: CreateReagentUsageHistoryInput): Promise<QueryResult<ReagentUsageHistoryDocument>> {
    try {
      const docToInsert: Omit<ReagentUsageHistoryDocument, '_id'> = {
        ...data,
        created_at: new Date()
      };

      const result = await this.getCollection().insertOne(docToInsert as ReagentUsageHistoryDocument);
      
      if (result.insertedId) {
        const created = await this.getCollection().findOne({ _id: result.insertedId });
        return {
          success: true,
          data: created!
        };
      }

      return {
        success: false,
        error: 'Failed to create reagent usage history',
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_SAVE_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<ReagentUsageHistoryDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const doc = await this.getCollection().findOne({ _id: objectId });
      
      if (!doc) {
        return {
          success: false,
          error: 'Reagent usage history not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: doc
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    reagent_lot_number?: string;
    instrument_id?: string;
    test_order_id?: string;
    start_date?: Date;
    end_date?: Date;
  } = {}): Promise<QueryResult<{ 
    history: ReagentUsageHistoryDocument[]; 
    total: number; 
    page: number; 
    limit: number 
  }>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const { skip, limit: pageLimit } = createPaginationOptions(page, limit);
      const sortOptions = createSortOptions('used_at', -1) as Sort;

      // Build query with filters
      const query: any = {};

      if (options.reagent_lot_number) {
        query.reagent_lot_number = { $regex: options.reagent_lot_number, $options: 'i' };
      }

      if (options.instrument_id) {
        const instrumentObjectId = toObjectId(options.instrument_id);
        if (instrumentObjectId) {
          query.instrument_id = instrumentObjectId;
        }
      }

      if (options.test_order_id) {
        const testOrderObjectId = toObjectId(options.test_order_id);
        if (testOrderObjectId) {
          query.test_order_id = testOrderObjectId;
        }
      }

      if (options.start_date || options.end_date) {
        query.used_at = {};
        if (options.start_date) {
          query.used_at.$gte = options.start_date;
        }
        if (options.end_date) {
          query.used_at.$lte = options.end_date;
        }
      }

      // Get total count
      const total = await this.getCollection().countDocuments(query);

      // Get history
      const history = await this.getCollection()
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit)
        .toArray();

      return {
        success: true,
        data: {
          history,
          total,
          page,
          limit: pageLimit
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async count(): Promise<QueryResult<number>> {
    try {
      const count = await this.getCollection().countDocuments();
      return {
        success: true,
        data: count
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }
}

