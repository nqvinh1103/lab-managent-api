import { ObjectId, Sort } from 'mongodb';
import { getCollection } from '../config/database';
import { MESSAGES } from '../constants/messages';
import {
  CreateReagentVendorSupplyHistoryInput,
  ReagentVendorSupplyHistoryDocument
} from '../models/ReagentVendorSupplyHistory';
import { createPaginationOptions, createSortOptions, QueryResult, toObjectId } from '../utils/database.helper';

export class ReagentVendorSupplyService {
  private getCollection() {
    return getCollection<ReagentVendorSupplyHistoryDocument>('reagent_vendor_supply_history');
  }

  async create(data: CreateReagentVendorSupplyHistoryInput): Promise<QueryResult<ReagentVendorSupplyHistoryDocument>> {
    try {
      const docToInsert: Omit<ReagentVendorSupplyHistoryDocument, '_id'> = {
        ...data,
        created_at: new Date()
      };

      const result = await this.getCollection().insertOne(docToInsert as ReagentVendorSupplyHistoryDocument);
      
      if (result.insertedId) {
        const created = await this.getCollection().findOne({ _id: result.insertedId });
        return {
          success: true,
          data: created!
        };
      }

      return {
        success: false,
        error: 'Failed to create reagent vendor supply history'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_SAVE_ERROR
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<ReagentVendorSupplyHistoryDocument>> {
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
          error: 'Reagent vendor supply history not found'
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
    reagent_name?: string;
    vendor_name?: string;
    lot_number?: string;
    start_date?: Date;
    end_date?: Date;
  } = {}): Promise<QueryResult<{ 
    history: ReagentVendorSupplyHistoryDocument[]; 
    total: number; 
    page: number; 
    limit: number 
  }>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const { skip, limit: pageLimit } = createPaginationOptions(page, limit);
      const sortOptions = createSortOptions('receipt_date', -1) as Sort;

      // Build query with filters
      const query: any = {};

      if (options.reagent_name) {
        query.reagent_name = { $regex: options.reagent_name, $options: 'i' };
      }

      if (options.vendor_name) {
        query.vendor_name = { $regex: options.vendor_name, $options: 'i' };
      }

      if (options.lot_number) {
        query.lot_number = { $regex: options.lot_number, $options: 'i' };
      }

      if (options.start_date || options.end_date) {
        query.receipt_date = {};
        if (options.start_date) {
          query.receipt_date.$gte = options.start_date;
        }
        if (options.end_date) {
          query.receipt_date.$lte = options.end_date;
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

