import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { CreateUserInput, UpdateUserInput, UserDocument } from '../models/User';
import { OperationResult, QueryResult, toObjectId } from '../utils/database.helper';

export class UserService {
  private collection = getCollection<UserDocument>('users');

  async create(userData: CreateUserInput): Promise<QueryResult<UserDocument>> {
    try {
      // Hash password before saving
      const hashedPassword = await bcrypt.hash(userData.password_hash, 12);
      
      const userToInsert: Omit<UserDocument, '_id'> = {
        ...userData,
        password_hash: hashedPassword,
        last_activity: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await this.collection.insertOne(userToInsert as UserDocument);
      
      if (result.insertedId) {
        const createdUser = await this.collection.findOne({ _id: result.insertedId });
        return {
          success: true,
          data: createdUser!
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
          error: 'Invalid user ID'
        };
      }

      // Hash password if it's being updated
      if (updateData.password_hash) {
        updateData.password_hash = await bcrypt.hash(updateData.password_hash, 12);
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

  async assignRole(userId: string | ObjectId, roleId: string | ObjectId): Promise<OperationResult> {
    try {
      const userObjectId = toObjectId(userId);
      const roleObjectId = toObjectId(roleId);
      
      if (!userObjectId || !roleObjectId) {
        return {
          success: false,
          error: 'Invalid user ID or role ID'
        };
      }

      const result = await this.collection.updateOne(
        { _id: userObjectId },
        { 
          $addToSet: { role_ids: roleObjectId },
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

      const result = await this.collection.updateOne(
        { _id: userObjectId },
        { 
          $pull: { role_ids: roleObjectId },
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
