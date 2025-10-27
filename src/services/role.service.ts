import { ObjectId, Sort } from 'mongodb';
import { getCollection } from '../config/database';
import { CreateRoleInput, RoleDocument, UpdateRoleInput } from '../models/Role';
import { createPaginationOptions, createSortOptions, OperationResult, QueryResult, toObjectId } from '../utils/database.helper';

export class RoleService {
  private collection = getCollection<RoleDocument>('roles');

  async create(roleData: CreateRoleInput): Promise<QueryResult<RoleDocument>> {
    try {
      const roleToInsert: Omit<RoleDocument, '_id'> = {
        ...roleData,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await this.collection.insertOne(roleToInsert as RoleDocument);
      
      if (result.insertedId) {
        const createdRole = await this.collection.findOne({ _id: result.insertedId });
        return {
          success: true,
          data: createdRole!
        };
      }

      return {
        success: false,
        error: 'Failed to create role'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<RoleDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid role ID'
        };
      }

      const role = await this.collection.findOne({ _id: objectId });
      
      if (!role) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      return {
        success: true,
        data: role
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findByCode(roleCode: string): Promise<QueryResult<RoleDocument>> {
    try {
      const role = await this.collection.findOne({ role_code: roleCode });
      
      if (!role) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      return {
        success: true,
        data: role
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findByIdAndUpdate(id: string | ObjectId, updateData: UpdateRoleInput): Promise<QueryResult<RoleDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid role ID'
        };
      }

      const updateDoc = {
        ...updateData,
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
          error: 'Role not found'
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async deleteById(id: string | ObjectId): Promise<OperationResult> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid role ID'
        };
      }

      const result = await this.collection.deleteOne({ _id: objectId });

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<QueryResult<RoleDocument[]>> {
    try {
      const { skip, limit: pageLimit } = createPaginationOptions(page, limit);
      const sortOptions = createSortOptions('created_at', -1) as Sort

      const roles = await this.collection
        .find({})
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit)
        .toArray();

      return {
        success: true,
        data: roles
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async assignPrivilege(roleId: string | ObjectId, privilegeId: string | ObjectId): Promise<OperationResult> {
    try {
      const roleObjectId = toObjectId(roleId);
      const privilegeObjectId = toObjectId(privilegeId);
      
      if (!roleObjectId || !privilegeObjectId) {
        return {
          success: false,
          error: 'Invalid role ID or privilege ID'
        };
      }

      const result = await this.collection.updateOne(
        { _id: roleObjectId },
        { 
          $addToSet: { privilege_ids: privilegeObjectId },
          $set: { updated_at: new Date() }
        }
      );

      return {
        success: true,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async removePrivilege(roleId: string | ObjectId, privilegeId: string | ObjectId): Promise<OperationResult> {
    try {
      const roleObjectId = toObjectId(roleId);
      const privilegeObjectId = toObjectId(privilegeId);
      
      if (!roleObjectId || !privilegeObjectId) {
        return {
          success: false,
          error: 'Invalid role ID or privilege ID'
        };
      }

      const result = await this.collection.updateOne(
        { _id: roleObjectId },
        { 
          $pull: { privilege_ids: privilegeObjectId },
          $set: { updated_at: new Date() }
        }
      );

      return {
        success: true,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async count(): Promise<QueryResult<number>> {
    try {
      const count = await this.collection.countDocuments();
      return {
        success: true,
        data: count
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}