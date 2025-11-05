import { ObjectId, Sort } from 'mongodb';
import { getCollection } from '../config/database';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ConfigurationDocument, CreateConfigurationInput, UpdateConfigurationInput } from '../models/Configuration';
import { createPaginationOptions, createSortOptions, OperationResult, QueryResult, toObjectId } from '../utils/database.helper';

export class ConfigurationService {
  private getCollection() {
    return getCollection<ConfigurationDocument>('configurations');
  }

  async create(configData: CreateConfigurationInput): Promise<QueryResult<ConfigurationDocument>> {
    try {
      const collection = this.getCollection();
      // Check if config_key already exists (unique validation)
      const existingConfig = await collection.findOne({
        config_key: configData.config_key
      });

      if (existingConfig) {
        return {
          success: false,
          error: 'Configuration with this config_key already exists',
          statusCode: HTTP_STATUS.CONFLICT
        };
      }

      const configToInsert: Omit<ConfigurationDocument, '_id'> = {
        ...configData,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await collection.insertOne(configToInsert as ConfigurationDocument);

      if (result.insertedId) {
        const createdConfig = await collection.findOne({ _id: result.insertedId });
        return {
          success: true,
          data: createdConfig!
        };
      }

      return {
        success: false,
        error: 'Failed to create configuration',
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

  async findById(id: string | ObjectId): Promise<QueryResult<ConfigurationDocument>> {
    try {
      const collection = this.getCollection();
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid configuration ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const config = await collection.findOne({ _id: objectId });
      
      if (!config) {
        return {
          success: false,
          error: 'Configuration not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: config
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
      };
    }
  }

  async findAll(
    page: number = 1, 
    limit: number = 10,
    category?: string,
    instrument_type?: string
  ): Promise<QueryResult<{ configurations: ConfigurationDocument[]; total: number; page: number; limit: number }>> {
    try {
      const collection = this.getCollection();
      const { skip, limit: pageLimit } = createPaginationOptions(page, limit);
      const sortOptions = createSortOptions('created_at', -1) as Sort;

      // Build query with optional filters
      const query: any = {};
      if (category) {
        query.category = category;
      }
      if (instrument_type) {
        query.instrument_type = instrument_type;
      }

      // Get total count
      const total = await collection.countDocuments(query);

      // Get configurations
      const configurations = await collection
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit)
        .toArray();

      return {
        success: true,
        data: {
          configurations,
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

  async findByIdAndUpdate(
    id: string | ObjectId, 
    updateData: UpdateConfigurationInput
  ): Promise<QueryResult<ConfigurationDocument>> {
    try {
      const collection = this.getCollection();
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid configuration ID'
        };
      }

      // Check if config_key is being updated and if it already exists
      if (updateData.config_key) {
        const existingConfig = await collection.findOne({
          config_key: updateData.config_key,
          _id: { $ne: objectId }
        });

        if (existingConfig) {
          return {
            success: false,
            error: 'Configuration with this config_key already exists',
            statusCode: HTTP_STATUS.CONFLICT
          };
        }
      }

      const updateDoc = {
        ...updateData,
        updated_at: new Date()
      };

      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Configuration not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_UPDATE_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async deleteById(id: string | ObjectId): Promise<OperationResult> {
    try {
      const collection = this.getCollection();
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid configuration ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      // Check if configuration exists
      const config = await collection.findOne({ _id: objectId });
      if (!config) {
        return {
          success: false,
          error: 'Configuration not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      const result = await collection.deleteOne({ _id: objectId });

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_DELETE_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async count(): Promise<QueryResult<number>> {
    try {
      const collection = this.getCollection();
      const count = await collection.countDocuments();
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

