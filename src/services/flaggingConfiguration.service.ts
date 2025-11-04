import { ObjectId, Sort } from 'mongodb';
import { getCollection } from '../config/database';
import { MESSAGES } from '../constants/messages';
import { 
  FlaggingConfigurationDocument, 
  CreateFlaggingConfigurationInput, 
  UpdateFlaggingConfigurationInput 
} from '../models/FlaggingConfiguration';
import { createPaginationOptions, createSortOptions, OperationResult, QueryResult, toObjectId } from '../utils/database.helper';

export class FlaggingConfigurationService {
  private getCollection() {
    return getCollection<FlaggingConfigurationDocument>('flagging_configurations');
  }

  async create(configData: CreateFlaggingConfigurationInput): Promise<QueryResult<FlaggingConfigurationDocument>> {
    try {
      const collection = this.getCollection();
      const parameterCollection = getCollection<any>('parameters');

      // Validate parameter_id exists
      const parameterObjectId = toObjectId(configData.parameter_id);
      if (!parameterObjectId) {
        return {
          success: false,
          error: 'Invalid parameter_id'
        };
      }

      const parameter = await parameterCollection.findOne({ _id: parameterObjectId });
      if (!parameter) {
        return {
          success: false,
          error: 'Parameter not found'
        };
      }

      // Validate reference_range_min < reference_range_max
      if (configData.reference_range_min !== undefined && configData.reference_range_max !== undefined) {
        if (configData.reference_range_min >= configData.reference_range_max) {
          return {
            success: false,
            error: 'reference_range_min must be less than reference_range_max'
          };
        }
      }

      const configToInsert: Omit<FlaggingConfigurationDocument, '_id'> = {
        ...configData,
        parameter_id: parameterObjectId,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await collection.insertOne(configToInsert as FlaggingConfigurationDocument);

      if (result.insertedId) {
        const createdConfig = await collection.findOne({ _id: result.insertedId });
        return {
          success: true,
          data: createdConfig!
        };
      }

      return {
        success: false,
        error: 'Failed to create flagging configuration'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_SAVE_ERROR
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<FlaggingConfigurationDocument>> {
    try {
      const collection = this.getCollection();
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid flagging configuration ID'
        };
      }

      const config = await collection.findOne({ _id: objectId });
      
      if (!config) {
        return {
          success: false,
          error: 'Flagging configuration not found'
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
    parameter_id?: string,
    gender?: 'male' | 'female',
    age_group?: string,
    is_active?: boolean
  ): Promise<QueryResult<{ flagging_configurations: FlaggingConfigurationDocument[]; total: number; page: number; limit: number }>> {
    try {
      const collection = this.getCollection();
      const { skip, limit: pageLimit } = createPaginationOptions(page, limit);
      const sortOptions = createSortOptions('created_at', -1) as Sort;

      // Build query with optional filters
      const query: any = {};
      if (parameter_id) {
        const parameterObjectId = toObjectId(parameter_id);
        if (parameterObjectId) {
          query.parameter_id = parameterObjectId;
        }
      }
      if (gender !== undefined) {
        query.gender = gender;
      }
      if (age_group !== undefined) {
        query.age_group = age_group;
      }
      if (is_active !== undefined) {
        query.is_active = is_active;
      }

      // Get total count
      const total = await collection.countDocuments(query);

      // Get configurations
      const flagging_configurations = await collection
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit)
        .toArray();

      return {
        success: true,
        data: {
          flagging_configurations,
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

  async findByIdAndUpdate(
    id: string | ObjectId, 
    updateData: UpdateFlaggingConfigurationInput
  ): Promise<QueryResult<FlaggingConfigurationDocument>> {
    try {
      const collection = this.getCollection();
      const parameterCollection = getCollection<any>('parameters');
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid flagging configuration ID'
        };
      }

      // Validate parameter_id if being updated
      if (updateData.parameter_id) {
        const parameterObjectId = toObjectId(updateData.parameter_id);
        if (!parameterObjectId) {
          return {
            success: false,
            error: 'Invalid parameter_id'
          };
        }

        const parameter = await parameterCollection.findOne({ _id: parameterObjectId });
        if (!parameter) {
          return {
            success: false,
            error: 'Parameter not found'
          };
        }
        updateData.parameter_id = parameterObjectId;
      }

      // Validate reference_range_min < reference_range_max
      if (updateData.reference_range_min !== undefined && updateData.reference_range_max !== undefined) {
        if (updateData.reference_range_min >= updateData.reference_range_max) {
          return {
            success: false,
            error: 'reference_range_min must be less than reference_range_max'
          };
        }
      } else if (updateData.reference_range_min !== undefined || updateData.reference_range_max !== undefined) {
        // If only one is being updated, check against existing values
        const existing = await collection.findOne({ _id: objectId });
        if (existing) {
          const min = updateData.reference_range_min !== undefined ? updateData.reference_range_min : existing.reference_range_min;
          const max = updateData.reference_range_max !== undefined ? updateData.reference_range_max : existing.reference_range_max;
          if (min !== undefined && max !== undefined && min >= max) {
            return {
              success: false,
              error: 'reference_range_min must be less than reference_range_max'
            };
          }
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
          error: 'Flagging configuration not found'
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_UPDATE_ERROR
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
          error: 'Invalid flagging configuration ID'
        };
      }

      // Check if configuration exists
      const config = await collection.findOne({ _id: objectId });
      if (!config) {
        return {
          success: false,
          error: 'Flagging configuration not found'
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
        error: error instanceof Error ? error.message : MESSAGES.DB_DELETE_ERROR
      };
    }
  }

  async sync(configs: CreateFlaggingConfigurationInput[]): Promise<QueryResult<{ created: number; updated: number; failed: number; errors: string[] }>> {
    try {
      const collection = this.getCollection();
      const parameterCollection = getCollection<any>('parameters');
      let created = 0;
      let updated = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const configData of configs) {
        try {
          // Validate parameter_id
          const parameterObjectId = toObjectId(configData.parameter_id);
          if (!parameterObjectId) {
            failed++;
            errors.push(`Invalid parameter_id: ${configData.parameter_id}`);
            continue;
          }

          const parameter = await parameterCollection.findOne({ _id: parameterObjectId });
          if (!parameter) {
            failed++;
            errors.push(`Parameter not found: ${configData.parameter_id}`);
            continue;
          }

          // Validate reference_range_min < reference_range_max
          if (configData.reference_range_min !== undefined && configData.reference_range_max !== undefined) {
            if (configData.reference_range_min >= configData.reference_range_max) {
              failed++;
              errors.push(`Invalid range for parameter ${configData.parameter_id}: min >= max`);
              continue;
            }
          }

          // Check if exists (by parameter_id + gender + age_group)
          const query: any = {
            parameter_id: parameterObjectId
          };
          
          // Build gender query
          if (configData.gender !== undefined) {
            query.gender = configData.gender;
          } else {
            // Match null or undefined gender
            query.$or = [
              { gender: { $exists: false } },
              { gender: null }
            ];
          }
          
          // Build age_group query
          if (configData.age_group !== undefined) {
            if (query.$or) {
              // If gender is null/undefined, we need $and to combine both conditions
              query.$and = [
                { $or: query.$or },
                { age_group: configData.age_group }
              ];
              delete query.$or;
            } else {
              query.age_group = configData.age_group;
            }
          } else {
            // Match null or undefined age_group
            if (query.$or) {
              // Both gender and age_group are null/undefined
              query.$or.push(
                { age_group: { $exists: false } },
                { age_group: null }
              );
            } else {
              query.$or = [
                { age_group: { $exists: false } },
                { age_group: null }
              ];
            }
          }

          const existing = await collection.findOne(query);

          if (existing) {
            // Update existing
            const updateDoc = {
              ...configData,
              parameter_id: parameterObjectId,
              updated_at: new Date()
            };
            await collection.updateOne(
              { _id: existing._id },
              { $set: updateDoc }
            );
            updated++;
          } else {
            // Create new
            const configToInsert: Omit<FlaggingConfigurationDocument, '_id'> = {
              ...configData,
              parameter_id: parameterObjectId,
              created_at: new Date(),
              updated_at: new Date()
            };
            await collection.insertOne(configToInsert as FlaggingConfigurationDocument);
            created++;
          }
        } catch (error) {
          failed++;
          errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }

      return {
        success: true,
        data: {
          created,
          updated,
          failed,
          errors
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_SAVE_ERROR
      };
    }
  }
}

