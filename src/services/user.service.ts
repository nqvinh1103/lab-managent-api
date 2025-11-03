import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { RoleDocument } from '../models/Role';
import { CreateUserInput, UpdateUserInput, UserDocument } from '../models/User';
import { UserRoleDocument } from '../models/UserRole';
import { OperationResult, QueryResult, toObjectId } from '../utils/database.helper';
import { withTransaction } from '../utils/transaction.helper';

export class UserService {
  private collection = getCollection<UserDocument>('users');
  private roleCollection = getCollection<RoleDocument>('roles');
  private userRoleCollection = getCollection<UserRoleDocument>('user_roles');

  private async getDefaultRole(): Promise<ObjectId | null> {
    const role = await this.roleCollection.findOne({ role_code: 'NORMAL_USER' });
    return role?._id || null;
  }

  private generateIdentityNumber(): string {
    // Generate a unique identity number format: ID-YYYYMMDD-XXXXX
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `ID-${year}${month}${day}-${random}`;
  }

  private async checkDuplicateFields(
    email: string, 
    phone?: string, 
    identityNumber?: string,
    excludeUserId?: ObjectId
  ): Promise<{ isDuplicate: boolean; field?: string; }> {
    // Check email
    const emailUser = await this.collection.findOne({ 
      email: email.toLowerCase(),
      ...excludeUserId && { _id: { $ne: excludeUserId } }
    });
    if (emailUser) {
      return { isDuplicate: true, field: 'email' };
    }

    // Check phone if provided
    if (phone) {
      const phoneUser = await this.collection.findOne({ 
        phone_number: phone,
        ...excludeUserId && { _id: { $ne: excludeUserId } }
      });
      if (phoneUser) {
        return { isDuplicate: true, field: 'phone_number' };
      }
    }

    // Check identity number if provided
    if (identityNumber) {
      const identityUser = await this.collection.findOne({
        identity_number: identityNumber,
        ...excludeUserId && { _id: { $ne: excludeUserId } }
      });
      if (identityUser) {
        return { isDuplicate: true, field: 'identity_number' };
      }
    }

    return { isDuplicate: false };
  }

  async create(userData: CreateUserInput): Promise<QueryResult<UserDocument>> {
    try {
      // Check for duplicate email, phone, and identity number
      const { isDuplicate, field } = await this.checkDuplicateFields(
        userData.email, 
        userData.phone_number,
        userData.identity_number
      );
      if (isDuplicate) {
        let errorMessage = 'Email already exists';
        if (field === 'phone_number') errorMessage = 'Phone number already exists';
        if (field === 'identity_number') errorMessage = 'Identity number already exists';
        
        return {
          success: false,
          error: errorMessage,
          statusCode: 409 // Conflict status code
        };
      }

      // Generate identity number if not provided
      if (!userData.identity_number) {
        userData.identity_number = this.generateIdentityNumber();
      }

      // Validate roles if provided
      const roleIds: ObjectId[] = []
      if (userData.role_ids && userData.role_ids.length > 0) {
        // Convert string IDs to ObjectIds and validate
        for (const roleId of userData.role_ids) {
          const objectId = toObjectId(roleId);
          if (!objectId) {
            return {
              success: false,
              error: `Invalid role ID: ${roleId}`
            };
          }
          
          // Check if role exists
          const roleExists = await this.roleCollection.findOne({ _id: objectId });
          if (!roleExists) {
            return {
              success: false,
              error: `Role not found: ${roleId}`
            };
          }
          
          roleIds.push(objectId);
        }
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(userData.password_hash, 12);
      
      const userToInsert: Omit<UserDocument, '_id'> = {
        ...userData,
        password_hash: hashedPassword,
        role_ids: roleIds,
        last_activity: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      let createdUser: UserDocument | null = null;

      // Use transaction to ensure User.role_ids and UserRole collection stay in sync
      if (roleIds.length > 0) {
        await withTransaction(async (session) => {
          // Insert user
          const result = await this.collection.insertOne(userToInsert as UserDocument, { session });
          
          if (result.insertedId) {
            // Create records in user_roles collection
            const userRoleDocs = roleIds.map(roleId => ({
              user_id: result.insertedId,
              role_id: roleId,
              created_by: userToInsert.created_by,
              created_at: new Date()
            }));
            await this.userRoleCollection.insertMany(userRoleDocs as UserRoleDocument[], { session });
            
            // Fetch created user
            createdUser = await this.collection.findOne({ _id: result.insertedId }, { session });
          }
        });
      } else {
        // No roles, just insert user
        const result = await this.collection.insertOne(userToInsert as UserDocument);
        if (result.insertedId) {
          createdUser = await this.collection.findOne({ _id: result.insertedId });
        }
      }

      if (createdUser) {
        return {
          success: true,
          data: createdUser
        };
      }

      return {
        success: false,
        error: 'Failed to create user'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<UserDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      const user = await this.collection.findOne({ _id: objectId });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findByEmail(email: string): Promise<QueryResult<UserDocument>> {
    try {
      const user = await this.collection.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async findByIdAndUpdate(id: string | ObjectId, updateData: UpdateUserInput): Promise<QueryResult<UserDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid user ID',
          statusCode: 400
        };
      }

      // Check for duplicate email/phone/identity if being updated
      if (updateData.email || updateData.phone_number || updateData.identity_number) {
        const { isDuplicate, field } = await this.checkDuplicateFields(
          updateData.email || '', 
          updateData.phone_number,
          updateData.identity_number,
          objectId // Exclude current user from duplicate check
        );
        if (isDuplicate) {
          let errorMessage = 'Email already exists';
          if (field === 'phone_number') errorMessage = 'Phone number already exists';
          if (field === 'identity_number') errorMessage = 'Identity number already exists';
          
          return {
            success: false,
            error: errorMessage,
            statusCode: 409
          };
        }
      }

      // Hash password if it's being updated
      if (updateData.password_hash) {
        updateData.password_hash = await bcrypt.hash(updateData.password_hash, 12);
      }

      const updateDoc: any = {
        ...updateData,
        updated_at: new Date()
      };

      // Check if role_ids is being updated
      const hasRoleIdsUpdate = 'role_ids' in updateData && updateData.role_ids !== undefined;

      let result: UserDocument | null = null;

      if (hasRoleIdsUpdate) {
        // Update User.role_ids + sync UserRole collection in transaction
        const roleIds = (updateData.role_ids || [])
          .map(id => toObjectId(id))
          .filter((id): id is ObjectId => id !== null);

        result = await withTransaction(async (session) => {
          // Update user document
          const updatedUser = await this.collection.findOneAndUpdate(
            { _id: objectId },
            { $set: updateDoc },
            { session, returnDocument: 'after' }
          );

          if (!updatedUser) {
            throw new Error('User not found');
          }

          // Delete all existing UserRole records for this user
          await this.userRoleCollection.deleteMany(
            { user_id: objectId },
            { session }
          );

          // Insert new UserRole records
          if (roleIds.length > 0) {
            const userRoleDocs = roleIds.map(roleId => ({
              user_id: objectId,
              role_id: roleId,
              created_by: updatedUser.created_by,
              created_at: new Date()
            }));
            await this.userRoleCollection.insertMany(userRoleDocs as UserRoleDocument[], { session });
          }

          return updatedUser;
        });
      } else {
        // No role_ids update, just update user document
        result = await this.collection.findOneAndUpdate(
          { _id: objectId },
          { $set: updateDoc },
          { returnDocument: 'after' }
        );
      }

      if (!result) {
        return {
          success: false,
          error: 'User not found'
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
          error: 'Invalid user ID'
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

  async findAll(skip = 0, limit = 10): Promise<QueryResult<UserDocument[]>> {
    try {
      const users = await this.collection
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        success: true,
        data: users
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

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  async assignRole(userId: string | ObjectId, roleId: string | ObjectId, createdBy?: string | ObjectId): Promise<OperationResult> {
    try {
      const userObjectId = toObjectId(userId);
      const roleObjectId = toObjectId(roleId);
      
      if (!userObjectId || !roleObjectId) {
        return {
          success: false,
          error: 'Invalid user ID or role ID'
        };
      }

      // Check if user exists
      const user = await this.collection.findOne({ _id: userObjectId });
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Get created_by from parameter or use current user
      const createdByObjectId = createdBy ? toObjectId(createdBy) : user.created_by;

      // Use transaction to ensure User.role_ids and UserRole collection stay in sync
      let modifiedCount = 0;
      await withTransaction(async (session) => {
        // Update role_ids in users collection
        const result = await this.collection.updateOne(
          { _id: userObjectId },
          { 
            $addToSet: { role_ids: roleObjectId },
            $set: { updated_at: new Date() }
          },
          { session }
        );
        modifiedCount = result.modifiedCount || 0;

        // Create record in user_roles collection if not exists
        await this.userRoleCollection.updateOne(
          { user_id: userObjectId, role_id: roleObjectId },
          { 
            $set: { 
              user_id: userObjectId, 
              role_id: roleObjectId,
              created_at: new Date(),
              created_by: createdByObjectId
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

  async removeRole(userId: string | ObjectId, roleId: string | ObjectId): Promise<OperationResult> {
    try {
      const userObjectId = toObjectId(userId);
      const roleObjectId = toObjectId(roleId);
      
      if (!userObjectId || !roleObjectId) {
        return {
          success: false,
          error: 'Invalid user ID or role ID'
        };
      }

      // Use transaction to ensure User.role_ids and UserRole collection stay in sync
      let modifiedCount = 0;
      await withTransaction(async (session) => {
        // Update role_ids in users collection
        const result = await this.collection.updateOne(
          { _id: userObjectId },
          { 
            $pull: { role_ids: roleObjectId },
            $set: { updated_at: new Date() }
          },
          { session }
        );
        modifiedCount = result.modifiedCount || 0;

        // Delete record from user_roles collection
        await this.userRoleCollection.deleteOne(
          {
            user_id: userObjectId,
            role_id: roleObjectId
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

  async lockUser(userId: string | ObjectId): Promise<OperationResult> {
    try {
      const objectId = toObjectId(userId);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      const result = await this.collection.updateOne(
        { _id: objectId },
        { 
          $set: { 
            is_locked: true,
            updated_at: new Date()
          }
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

  async unlockUser(userId: string | ObjectId): Promise<OperationResult> {
    try {
      const objectId = toObjectId(userId);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      const result = await this.collection.updateOne(
        { _id: objectId },
        { 
          $set: { 
            is_locked: false,
            updated_at: new Date()
          }
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

}
