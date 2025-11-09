import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ReagentDocument, UpdateReagentMetadataInput } from '../models/Reagent';
import { createSortOptions, QueryResult, toObjectId } from '../utils/database.helper';
import { withTransaction } from '../utils/transaction.helper';

export class ReagentService {
  private getCollection() {
    return getCollection<ReagentDocument>('reagents');
  }

  async findAll(): Promise<QueryResult<ReagentDocument[]>> {
    try {
      const sortOptions = createSortOptions('reagent_name', 1) as Record<string, 1 | -1>;
      const reagents = await this.getCollection()
        .find({ is_active: true })
        .sort(sortOptions)
        .toArray();

      return {
        success: true,
        data: reagents
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<ReagentDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid reagent ID',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const reagent = await this.getCollection().findOne({ _id: objectId });

      if (!reagent) {
        return {
          success: false,
          error: 'Reagent not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: reagent
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async findByName(reagent_name: string): Promise<QueryResult<ReagentDocument>> {
    try {
      const reagent = await this.getCollection().findOne({
        reagent_name: reagent_name,
        is_active: true
      });

      if (!reagent) {
        return {
          success: false,
          error: 'Reagent not found',
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: reagent
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async updateMetadata(
    id: string | ObjectId,
    updateData: UpdateReagentMetadataInput
  ): Promise<QueryResult<ReagentDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid reagent ID'
        };
      }

      // Only allow updating: description, usage_per_run_min, usage_per_run_max, usage_unit, is_active
      const allowedFields: (keyof UpdateReagentMetadataInput)[] = [
        'description',
        'usage_per_run_min',
        'usage_per_run_max',
        'usage_unit',
        'is_active'
      ];

      const updateDoc: Partial<ReagentDocument> = {};
      allowedFields.forEach((key) => {
        if (key in updateData && updateData[key] !== undefined) {
          updateDoc[key as keyof ReagentDocument] = updateData[key] as never;
        }
      });

      // Check if any denormalized fields are being updated
      // Fields that need to sync to InstrumentReagent: description, usage_per_run_min, usage_per_run_max, usage_unit
      const denormalizedFields = ['description', 'usage_per_run_min', 'usage_per_run_max', 'usage_unit'];
      const hasDenormalizedChanges = denormalizedFields.some(field => field in updateData);

      // Add updated_at
      updateDoc.updated_at = new Date();

      let result: ReagentDocument | null;

      if (hasDenormalizedChanges) {
        // Update Reagent master + sync to InstrumentReagent in transaction
        const instrumentReagentCollection = getCollection<any>('instrument_reagents');

        result = await withTransaction(async (session) => {
          // Update Reagent master document
          const updatedReagent = await this.getCollection().findOneAndUpdate(
            { _id: objectId },
            { $set: updateDoc },
            { session, returnDocument: 'after' }
          );

          if (!updatedReagent) {
            throw new Error('Reagent not found');
          }

          // Build update document for InstrumentReagent denormalized fields
          const instrumentReagentUpdate: any = {};
          if ('description' in updateData) instrumentReagentUpdate.description = updateData.description;
          if ('usage_per_run_min' in updateData) instrumentReagentUpdate.usage_per_run_min = updateData.usage_per_run_min;
          if ('usage_per_run_max' in updateData) instrumentReagentUpdate.usage_per_run_max = updateData.usage_per_run_max;
          if ('usage_unit' in updateData) instrumentReagentUpdate.usage_unit = updateData.usage_unit;

          // Update all InstrumentReagent documents with matching reagent_id
          if (Object.keys(instrumentReagentUpdate).length > 0) {
            await instrumentReagentCollection.updateMany(
              { reagent_id: objectId },
              { $set: instrumentReagentUpdate },
              { session }
            );
          }

          return updatedReagent;
        });
      } else {
        // No denormalized fields changed, just update Reagent master
        result = await this.getCollection().findOneAndUpdate(
          { _id: objectId },
          { $set: updateDoc },
          { returnDocument: 'after' }
        );
      }

      if (!result) {
        return {
          success: false,
          error: 'Reagent not found'
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

