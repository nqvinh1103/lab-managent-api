import { ObjectId, Sort } from 'mongodb';
import { getCollection } from '../config/database';
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
        error: 'Failed to create reagent usage history'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_SAVE_ERROR
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<ReagentUsageHistoryDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid ID'
        };
      }

      const doc = await this.getCollection().findOne({ _id: objectId });
      
      if (!doc) {
        return {
          success: false,
          error: 'Reagent usage history not found'
        };
      }

      return {
        success: true,
        data: doc
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
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
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
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
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
      };
    }
  }
}

