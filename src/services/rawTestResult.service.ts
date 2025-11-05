import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { CreateRawTestResultInput, RawTestResultDocument } from '../models/RawTestResult';
import { QueryResult, toObjectId } from '../utils/database.helper';

const COLLECTION = 'raw_test_results';

export class RawTestResultService {
  async create(data: CreateRawTestResultInput): Promise<QueryResult<RawTestResultDocument>> {
    try {
      const collection = getCollection<RawTestResultDocument>(COLLECTION);
      
      const newDoc: Omit<RawTestResultDocument, '_id'> = {
        ...data,
        created_at: new Date(),
        can_delete: false // Default: cannot delete until synced
      };

      const result = await collection.insertOne(newDoc as RawTestResultDocument);

      if (result.insertedId) {
        const created = await collection.findOne({ _id: result.insertedId });
        return { success: true, data: created! };
      }
      return { 
        success: false, 
        error: 'Failed to create raw test result',
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

  async findAll(filters: { barcode?: string; instrument_id?: string; status?: string } = {}): Promise<QueryResult<RawTestResultDocument[]>> {
    try {
      const collection = getCollection<RawTestResultDocument>(COLLECTION);
      const query: any = {};
      
      if (filters.barcode) query.barcode = filters.barcode;
      if (filters.instrument_id) query.instrument_id = toObjectId(filters.instrument_id);
      if (filters.status) query.status = filters.status;

      const results = await collection.find(query).sort({ created_at: -1 }).toArray();
      return { success: true, data: results as RawTestResultDocument[] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async findById(id: string): Promise<QueryResult<RawTestResultDocument>> {
    try {
      const collection = getCollection<RawTestResultDocument>(COLLECTION);
      const objectId = toObjectId(id);
      if (!objectId) {
        return { 
          success: false, 
          error: 'Invalid raw test result ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const result = await collection.findOne({ _id: objectId });
      if (!result) {
        return { 
          success: false, 
          error: 'Raw test result not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }
      return { success: true, data: result as RawTestResultDocument };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async manualDelete(id: string): Promise<QueryResult<boolean>> {
    try {
      const collection = getCollection<RawTestResultDocument>(COLLECTION);
      const objectId = toObjectId(id);
      if (!objectId) {
        return { 
          success: false, 
          error: 'Invalid raw test result ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      // Check if can_delete is true
      const doc = await collection.findOne({ _id: objectId });
      if (!doc) {
        return { 
          success: false, 
          error: 'Raw test result not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      if (!doc.can_delete) {
        return { 
          success: false, 
          error: 'Cannot delete: result must be synced/backed up first',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const result = await collection.deleteOne({ _id: objectId });
      return { success: true, data: result.deletedCount > 0 };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : MESSAGES.DB_DELETE_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  // For auto-delete job
  async autoDelete(daysOld: number = 30): Promise<QueryResult<number>> {
    try {
      const collection = getCollection<RawTestResultDocument>(COLLECTION);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await collection.deleteMany({
        can_delete: true,
        created_at: { $lt: cutoffDate }
      });

      return { success: true, data: result.deletedCount };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : MESSAGES.DB_DELETE_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }
}

