import { ObjectId, Sort } from 'mongodb';
import { getCollection } from '../config/database';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ParameterDocument } from '../models/Parameter';
import { createPaginationOptions, createSortOptions, QueryResult, toObjectId } from '../utils/database.helper';

export class ParameterService {
  private getCollection() {
    return getCollection<ParameterDocument>('parameters');
  }

  async findById(id: string | ObjectId): Promise<QueryResult<ParameterDocument>> {
    try {
      const collection = this.getCollection();
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid parameter ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const parameter = await collection.findOne({ _id: objectId });
      
      if (!parameter) {
        return {
          success: false,
          error: 'Parameter not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: parameter
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async findAll(
    page: number = 1, 
    limit: number = 10,
    search?: string
  ): Promise<QueryResult<{ parameters: ParameterDocument[]; total: number; page: number; limit: number }>> {
    try {
      const collection = this.getCollection();
      const { skip, limit: pageLimit } = createPaginationOptions(page, limit);
      const sortOptions = createSortOptions('parameter_code', 1) as Sort;

      // Build query with optional search
      const query: any = { is_active: true };
      if (search) {
        query.$or = [
          { parameter_name: { $regex: search, $options: 'i' } },
          { parameter_code: { $regex: search, $options: 'i' } },
          { abbreviation: { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await collection.countDocuments(query);

      // Get parameters
      const parameters = await collection
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit)
        .toArray();

      return {
        success: true,
        data: {
          parameters,
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
      const collection = this.getCollection();
      const count = await collection.countDocuments({ is_active: true });
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

