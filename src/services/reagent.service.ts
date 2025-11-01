import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { MESSAGES } from '../constants/messages';
import { ReagentDocument, UpdateReagentMetadataInput } from '../models/Reagent';
import { createSortOptions, QueryResult, toObjectId } from '../utils/database.helper';

export class ReagentService {
  private getCollection() {
    return getCollection<ReagentDocument>('reagents');
  }

  async findAll(): Promise<QueryResult<ReagentDocument[]>> {
    try {
      const sortOptions = createSortOptions('reagent_name', 1);
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
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<ReagentDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid reagent ID'
        };
      }

      const reagent = await this.getCollection().findOne({ _id: objectId });

      if (!reagent) {
        return {
          success: false,
          error: 'Reagent not found'
        };
      }

      return {
        success: true,
        data: reagent
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
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
          error: 'Reagent not found'
        };
      }

      return {
        success: true,
        data: reagent
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
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
        if (key in updateData) {
          updateDoc[key] = updateData[key];
        }
      });

      // Add updated_at
      updateDoc.updated_at = new Date();

      const result = await this.getCollection().findOneAndUpdate(
        { _id: objectId },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

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
        error: error instanceof Error ? error.message : MESSAGES.DB_UPDATE_ERROR
      };
    }
  }
}

