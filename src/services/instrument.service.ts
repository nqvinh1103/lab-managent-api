import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import {
  CreateInstrumentInput,
  InstrumentDocument,
  UpdateInstrumentInput
} from '../models/Instrument';
import { InstrumentReagentDocument } from '../models/InstrumentReagent';
import { TestOrderDocument } from '../models/TestOrder';
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
          error: 'Invalid user ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      // Check if serial_number already exists
      const existingInstrument = await this.collection.findOne({
        serial_number: instrumentData.serial_number
      });

      if (existingInstrument) {
        return {
          success: false,
          error: 'Instrument with this serial number already exists',
          statusCode: HTTP_STATUS.CONFLICT
        };
      }

      const instrumentToInsert: Omit<InstrumentDocument, '_id'> = {
        ...instrumentData,
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
        error: 'Failed to create instrument',
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

  async findById(id: string | ObjectId): Promise<QueryResult<InstrumentDocument & { reagents: InstrumentReagentDocument[]; test_orders: TestOrderDocument[] }>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid instrument ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const instrument = await this.collection.findOne({ _id: objectId });

      if (!instrument) {
        return {
          success: false,
          error: 'Instrument not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      // Query reagents installed in this instrument
      const reagentCollection = getCollection<InstrumentReagentDocument>('instrument_reagents');
      const reagents = await reagentCollection
        .find({ instrument_id: objectId })
        .toArray();

      // Query test orders related to this instrument
      const testOrderCollection = getCollection<TestOrderDocument>('test_orders');
      const testOrders = await testOrderCollection
        .find({ instrument_id: objectId })
        .toArray();

      return {
        success: true,
        data: {
          ...instrument,
          reagents,
          test_orders: testOrders
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
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
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
          error: 'Invalid instrument ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const userObjectId = toObjectId(userId);
      if (!userObjectId) {
        return {
          success: false,
          error: 'Invalid user ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
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
            error: 'Instrument with this serial number already exists',
            statusCode: HTTP_STATUS.CONFLICT
          };
        }
      }

      // Filter out deprecated fields (status, is_active) if present
      const { status, is_active, ...cleanUpdateData } = updateData as any;

      const updateDoc = {
        ...cleanUpdateData,
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
          error: 'Instrument not found',
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

  async deleteById(id: string | ObjectId): Promise<QueryResult<{ deletedCount: number }>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid instrument ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
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
        error: error instanceof Error ? error.message : MESSAGES.DB_DELETE_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  // Change instrument mode
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
          error: 'Invalid instrument ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      // Get current instrument
      const instrument = await this.collection.findOne({ _id: objectId });
      if (!instrument) {
        return {
          success: false,
          error: 'Instrument not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      // Validation logic based on mode
      if (newMode === 'ready') {
        // For 'ready' mode, require QC check within last 24 hours
        if (!instrument.last_qc_check) {
          return {
            success: false,
            error: 'Cannot set to ready mode: QC check has never been performed',
            statusCode: HTTP_STATUS.BAD_REQUEST
          };
        }

        const now = new Date();
        const qcCheckTime = new Date(instrument.last_qc_check);
        const hoursSinceQC = (now.getTime() - qcCheckTime.getTime()) / (1000 * 60 * 60);

        if (hoursSinceQC > 24) {
          return {
            success: false,
            error: 'Cannot set to ready mode: QC check must be performed within the last 24 hours',
            statusCode: HTTP_STATUS.BAD_REQUEST
          };
        }
      } else if (newMode === 'maintenance' || newMode === 'inactive') {
        // For 'maintenance' or 'inactive' mode, require a reason
        if (!modeReason || modeReason.trim().length === 0) {
          return {
            success: false,
            error: `mode_reason is required when setting mode to ${newMode}`,
            statusCode: HTTP_STATUS.BAD_REQUEST
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

      // Handle mode_reason
      if (modeReason) {
        updateDoc.mode_reason = modeReason;
      }

      // Handle deactivated_at: set when mode='inactive', clear when mode='ready'
      if (newMode === 'inactive') {
        updateDoc.deactivated_at = new Date();
      }

      // Build update operation
      const setOperation: any = { ...updateDoc };
      const unsetOperation: any = {};
      
      // Clear mode_reason and deactivated_at when switching to 'ready'
      if (newMode === 'ready') {
        if (!modeReason) {
          unsetOperation.mode_reason = '';
        }
        unsetOperation.deactivated_at = '';
      } else if (newMode === 'maintenance' && !modeReason) {
        // Clear mode_reason if switching to maintenance without reason (shouldn't happen due to validation, but handle it)
        unsetOperation.mode_reason = '';
      }

      const updateOperation: any = { $set: setOperation };
      if (Object.keys(unsetOperation).length > 0) {
        updateOperation.$unset = unsetOperation;
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: objectId },
        updateOperation,
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Failed to change instrument mode',
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
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
}

