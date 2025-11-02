import { ObjectId, Sort } from 'mongodb';
import { getCollection } from '../config/database';
import { CreateRoleInput, RoleDocument, UpdateRoleInput } from '../models/Role';
import { RolePrivilegeDocument } from '../models/RolePrivilege';
import { createPaginationOptions, createSortOptions, OperationResult, QueryResult, toObjectId } from '../utils/database.helper';
import { withTransaction } from '../utils/transaction.helper';

export class RoleService {
  private collection = getCollection<RoleDocument>('roles');
  private rolePrivilegeCollection = getCollection<RolePrivilegeDocument>('role_privileges');

  async create(roleData: CreateRoleInput, userId: string | ObjectId): Promise<QueryResult<RoleDocument>> {
    try {
      const userObjectId = toObjectId(userId);
      if (!userObjectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      // Convert privilege_ids from strings to ObjectId if needed
      const privilegeIds = (roleData.privilege_ids || []).map(id => toObjectId(id)).filter((id): id is ObjectId => id !== null);

      const roleToInsert: Omit<RoleDocument, '_id'> = {
        ...roleData,
        privilege_ids: privilegeIds,
        created_by: userObjectId,
        updated_by: userObjectId,
        created_at: new Date(),
        updated_at: new Date()
      };

      let createdRole: RoleDocument | null = null;

      // If role has privileges, sync RolePrivilege collection in transaction
      if (privilegeIds.length > 0) {
        await withTransaction(async (session) => {
          // Insert Role document
          const result = await this.collection.insertOne(roleToInsert as RoleDocument, { session });
          
          if (!result.insertedId) {
            throw new Error('Failed to create role');
          }

          // Create RolePrivilege records
          const rolePrivilegeDocs = privilegeIds.map(privilegeId => ({
            role_id: result.insertedId,
            privilege_id: privilegeId,
            created_by: userObjectId,
            created_at: new Date()
          }));

          await this.rolePrivilegeCollection.insertMany(rolePrivilegeDocs as RolePrivilegeDocument[], { session });

          // Fetch created role within transaction
          createdRole = await this.collection.findOne({ _id: result.insertedId }, { session });
        });
      } else {
        // No privileges, just insert role
        const result = await this.collection.insertOne(roleToInsert as RoleDocument);
        
        if (result.insertedId) {
          createdRole = await this.collection.findOne({ _id: result.insertedId });
        }
      }

      if (createdRole) {
        return {
          success: true,
          data: createdRole
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

  async findByIdAndUpdate(id: string | ObjectId, updateData: UpdateRoleInput, userId: string | ObjectId): Promise<QueryResult<RoleDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid role ID'
        };
      }

      const userObjectId = toObjectId(userId);
      if (!userObjectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      // Check if privilege_ids is being updated
      const hasPrivilegeIdsUpdate = 'privilege_ids' in updateData && updateData.privilege_ids !== undefined;

      const updateDoc: any = {
        ...updateData,
        updated_by: userObjectId,
        updated_at: new Date()
      };

      let result: RoleDocument | null = null;

      if (hasPrivilegeIdsUpdate) {
        // Update Role.privilege_ids + sync RolePrivilege collection in transaction
        const privilegeIds = (updateData.privilege_ids || [])
          .map(id => toObjectId(id))
          .filter((id): id is ObjectId => id !== null);

        updateDoc.privilege_ids = privilegeIds;

        result = await withTransaction(async (session) => {
          // Update role document
          const updatedRole = await this.collection.findOneAndUpdate(
            { _id: objectId },
            { $set: updateDoc },
            { session, returnDocument: 'after' }
          );

          if (!updatedRole) {
            throw new Error('Role not found');
          }

          // Delete all existing RolePrivilege records for this role
          await this.rolePrivilegeCollection.deleteMany(
            { role_id: objectId },
            { session }
          );

          // Insert new RolePrivilege records
          if (privilegeIds.length > 0) {
            const rolePrivilegeDocs = privilegeIds.map(privilegeId => ({
              role_id: objectId,
              privilege_id: privilegeId,
              created_by: userObjectId,
              created_at: new Date()
            }));
            await this.rolePrivilegeCollection.insertMany(rolePrivilegeDocs as RolePrivilegeDocument[], { session });
          }

          return updatedRole;
        });
      } else {
        // No privilege_ids update, just update role document
        const resultUpdate = await this.collection.findOneAndUpdate(
          { _id: objectId },
          { $set: updateDoc },
          { returnDocument: 'after' }
        );
        result = resultUpdate;
      }

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

      // Use transaction to ensure Role.privilege_ids and RolePrivilege collection stay in sync
      let modifiedCount = 0;
      await withTransaction(async (session) => {
        // Update privilege_ids in roles collection
        const result = await this.collection.updateOne(
          { _id: roleObjectId },
          { 
            $addToSet: { privilege_ids: privilegeObjectId },
            $set: { updated_at: new Date() }
          },
          { session }
        );
        modifiedCount = result.modifiedCount || 0;

        // Create record in role_privileges collection if not exists
        await this.rolePrivilegeCollection.updateOne(
          { role_id: roleObjectId, privilege_id: privilegeObjectId },
          { 
            $set: { 
              role_id: roleObjectId, 
              privilege_id: privilegeObjectId,
              created_at: new Date(),
              created_by: new ObjectId('000000000000000000000000') // Default system user
            }
          },
          { upsert: true, session }
        );
      });

      return {
        success: true,
        modifiedCount
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

      // Use transaction to ensure Role.privilege_ids and RolePrivilege collection stay in sync
      let modifiedCount = 0;
      await withTransaction(async (session) => {
        // Update privilege_ids in roles collection
        const result = await this.collection.updateOne(
          { _id: roleObjectId },
          { 
            $pull: { privilege_ids: privilegeObjectId },
            $set: { updated_at: new Date() }
          },
          { session }
        );
        modifiedCount = result.modifiedCount || 0;

        // Delete record from role_privileges collection
        await this.rolePrivilegeCollection.deleteOne(
          {
            role_id: roleObjectId,
            privilege_id: privilegeObjectId
          },
          { session }
        );
      });

      return {
        success: true,
        modifiedCount
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