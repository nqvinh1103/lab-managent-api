import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { MESSAGES } from '../constants/messages';
import {
  CreateInstrumentInput,
  InstrumentDocument,
  UpdateInstrumentInput
} from '../models/Instrument';
import { ConfigurationDocument } from '../models/Configuration';
import { createPaginationOptions, createTextSearchFilter, QueryResult, toObjectId } from '../utils/database.helper';

export class InstrumentService {
  private collection = getCollection<InstrumentDocument>('instruments');

  async create(
    instrumentData: CreateInstrumentInput, 
    userId: string | ObjectId
  ): Promise<QueryResult<InstrumentDocument>> {
    try {
      const userObjectId = toObjectId(userId);
      if (!userObjectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      // Check if serial_number already exists
      const existingInstrument = await this.collection.findOne({
        serial_number: instrumentData.serial_number
      });

      if (existingInstrument) {
        return {
          success: false,
          error: 'Instrument with this serial number already exists'
        };
      }

      // If configuration_id is provided, validate it and normalize to ObjectId
      let configurationObjectId: ObjectId | null = null;
      if ((instrumentData as any).configuration_id) {
        configurationObjectId = toObjectId((instrumentData as any).configuration_id);
        if (configurationObjectId === null) {
          return { success: false, error: 'Invalid configuration ID' };
        }

        // Validate configuration exists
        const configCollection = getCollection<ConfigurationDocument>('configurations');
        const config = await configCollection.findOne({ _id: configurationObjectId });
        if (!config) {
          return { success: false, error: 'Configuration not found' };
        }

        // Optional: ensure configuration.instrument_type matches instrument type if set
        if (config.instrument_type && config.instrument_type !== instrumentData.instrument_type) {
          return { success: false, error: 'Configuration is not valid for this instrument type' };
        }
      }

      const instrumentToInsert: Omit<InstrumentDocument, '_id'> = {
        ...instrumentData,
        configuration_id: configurationObjectId as any,
        created_by: userObjectId,
        updated_by: userObjectId,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await this.collection.insertOne(instrumentToInsert as InstrumentDocument);

      if (result.insertedId) {
        const createdInstrument = await this.collection.findOne({ _id: result.insertedId });
        
        return {
          success: true,
          data: createdInstrument!
        };
      }

      return {
        success: false,
        error: 'Failed to create instrument'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_SAVE_ERROR
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<InstrumentDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid instrument ID'
        };
      }

      const instrument = await this.collection.findOne({ _id: objectId });

      if (!instrument) {
        return {
          success: false,
          error: 'Instrument not found'
        };
      }

      return {
        success: true,
        data: instrument
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
    search?: string
  ): Promise<QueryResult<{ instruments: InstrumentDocument[]; total: number; page: number; limit: number }>> {
    try {
      const { skip, limit: takeLimit } = createPaginationOptions(page, limit);

      // Build query
      const query: any = {};

      // Add search filter
      if (search) {
        const searchFilter = createTextSearchFilter(search, ['instrument_name', 'instrument_type', 'serial_number']);
        Object.assign(query, searchFilter);
      }

      // Get total count
      const total = await this.collection.countDocuments(query);

      // Get instruments
      const instruments = await this.collection
        .find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(takeLimit)
        .toArray();

      return {
        success: true,
        data: {
          instruments,
          total,
          page,
          limit: takeLimit
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
    updateData: UpdateInstrumentInput,
    userId: string | ObjectId
  ): Promise<QueryResult<InstrumentDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid instrument ID'
        };
      }

      const userObjectId = toObjectId(userId);
      if (!userObjectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      // Check if serial_number is being updated and if it already exists
      if (updateData.serial_number) {
        const existingInstrument = await this.collection.findOne({
          serial_number: updateData.serial_number,
          _id: { $ne: objectId }
        });

        if (existingInstrument) {
          return {
            success: false,
            error: 'Instrument with this serial number already exists'
          };
        }
      }
      // If configuration_id is being updated, validate it
      if ('configuration_id' in updateData && updateData.configuration_id !== undefined) {
        const configObjectId = toObjectId((updateData as any).configuration_id);
        if (!configObjectId) {
          return { success: false, error: 'Invalid configuration ID' };
        }

        const configCollection = getCollection<ConfigurationDocument>('configurations');
        const config = await configCollection.findOne({ _id: configObjectId });
        if (!config) {
          return { success: false, error: 'Configuration not found' };
        }

        // Ensure configuration.instrument_type matches (if set on config)
        if (config.instrument_type && updateData.instrument_type && config.instrument_type !== updateData.instrument_type) {
          return { success: false, error: 'Configuration is not valid for this instrument type' };
        }

        updateData.configuration_id = configObjectId as any;
      }

      const updateDoc = {
        ...updateData,
        updated_by: userObjectId,
        updated_at: new Date()
      };

      const result = await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Instrument not found'
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

  async deleteById(id: string | ObjectId): Promise<QueryResult<{ deletedCount: number }>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid instrument ID'
        };
      }

      const result = await this.collection.deleteOne({ _id: objectId });

      return {
        success: true,
        data: { deletedCount: result.deletedCount }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_DELETE_ERROR
      };
    }
  }

  async activateInstrument(id: string | ObjectId, updatedBy: ObjectId): Promise<QueryResult<InstrumentDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid instrument ID'
        };
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: objectId },
        {
          $set: {
            is_active: true,
            status: 'active',
            updated_at: new Date(),
            updated_by: updatedBy
          },
          $unset: {
            deactivated_at: ''
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Instrument not found'
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

  async deactivateInstrument(id: string | ObjectId, updatedBy: ObjectId): Promise<QueryResult<InstrumentDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid instrument ID'
        };
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: objectId },
        {
          $set: {
            is_active: false,
            status: 'inactive',
            deactivated_at: new Date(),
            updated_at: new Date(),
            updated_by: updatedBy
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Instrument not found'
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

  // Change instrument mode (3.6.1.1)
  async changeMode(
    id: string | ObjectId,
    newMode: 'ready' | 'maintenance' | 'inactive',
    modeReason?: string,
    updatedBy?: ObjectId
  ): Promise<QueryResult<InstrumentDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid instrument ID'
        };
      }

      // Get current instrument
      const instrument = await this.collection.findOne({ _id: objectId });
      if (!instrument) {
        return {
          success: false,
          error: 'Instrument not found'
        };
      }

      // Validation logic based on mode
      if (newMode === 'ready') {
        // For 'ready' mode, require QC check within last 24 hours
        if (!instrument.last_qc_check) {
          return {
            success: false,
            error: 'Cannot set to ready mode: QC check has never been performed'
          };
        }

        const now = new Date();
        const qcCheckTime = new Date(instrument.last_qc_check);
        const hoursSinceQC = (now.getTime() - qcCheckTime.getTime()) / (1000 * 60 * 60);

        if (hoursSinceQC > 24) {
          return {
            success: false,
            error: 'Cannot set to ready mode: QC check must be performed within the last 24 hours'
          };
        }
      } else if (newMode === 'maintenance' || newMode === 'inactive') {
        // For 'maintenance' or 'inactive' mode, require a reason
        if (!modeReason || modeReason.trim().length === 0) {
          return {
            success: false,
            error: `mode_reason is required when setting mode to ${newMode}`
          };
        }
      }

      // Prepare update document
      const updateDoc: any = {
        mode: newMode,
        updated_at: new Date()
      };

      if (updatedBy) {
        updateDoc.updated_by = updatedBy;
      }

      if (modeReason) {
        updateDoc.mode_reason = modeReason;
      } else {
        // Clear mode_reason if switching to 'ready'
        updateDoc.mode_reason = undefined;
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updateDoc, ...(newMode === 'ready' ? { $unset: { mode_reason: '' } } : {}) },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Failed to change instrument mode'
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
}

