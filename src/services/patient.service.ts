import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { MESSAGES } from '../constants/messages';
import { CreatePatientInput, IPatient, PatientDocument, UpdatePatientInput } from '../models/Patient';
import { RoleDocument } from '../models/Role';
import { CreateUserInput, UserDocument } from '../models/User';
import { UserRoleDocument } from '../models/UserRole';
import { createPaginationOptions, QueryResult, toObjectId } from '../utils/database.helper';
import { generatePassword } from '../utils/passwordGenerator';

export interface CreatePatientResult extends PatientDocument {
  temporaryPassword: string;
}

export class PatientService {
  private collection = getCollection<PatientDocument>('patients');
  private userCollection = getCollection<UserDocument>('users');
  private roleCollection = getCollection<RoleDocument>('roles');
  private userRoleCollection = getCollection<UserRoleDocument>('user_roles');

  /**
   * Get NORMAL_USER role ID
   */
  private async getNormalUserRole(): Promise<ObjectId | null> {
    const role = await this.roleCollection.findOne({ role_code: 'NORMAL_USER' });
    return role?._id || null;
  }

  /**
   * Create patient and automatically create linked User account
   */
  async create(patientData: CreatePatientInput): Promise<QueryResult<CreatePatientResult>> {
    try {
      // Validate email is provided
      if (!patientData.email) {
        return {
          success: false,
          error: 'Email is required for patient portal access'
        };
      }

      // Check if email already exists
      const existingUser = await this.userCollection.findOne({ 
        email: patientData.email.toLowerCase() 
      });
      
      if (existingUser) {
        return {
          success: false,
          error: 'Email already exists'
        };
      }

      // Check if patient with same email exists
      const existingPatient = await this.collection.findOne({ 
        email: patientData.email.toLowerCase(),
        deleted_at: { $exists: false }
      });
      
      if (existingPatient) {
        return {
          success: false,
          error: 'Patient with this email already exists'
        };
      }

      // Generate random password
      const temporaryPassword = generatePassword();

      // Get NORMAL_USER role
      const normalUserRole = await this.getNormalUserRole();
      if (!normalUserRole) {
        return {
          success: false,
          error: 'NORMAL_USER role not found in database'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

      // Create User account
      const userData: CreateUserInput = {
        email: patientData.email.toLowerCase(),
        phone_number: patientData.phone_number || '',
        full_name: patientData.full_name,
        identity_number: patientData.identity_number || '',
        gender: patientData.gender,
        address: patientData.address,
        date_of_birth: patientData.date_of_birth,
        password_hash: temporaryPassword, // Will be replaced with has passed
        is_locked: false,
        role_ids: [normalUserRole],
        created_by: patientData.created_by,
        updated_by: patientData.created_by
      };

      const userToInsert: Omit<UserDocument, '_id'> = {
        ...userData,
        password_hash: hashedPassword,
        last_activity: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      const userResult = await this.userCollection.insertOne(userToInsert as UserDocument);
      
      if (!userResult.insertedId) {
        return {
          success: false,
          error: 'Failed to create user account'
        };
      }

      // Create user_roles record
      const userRoleDoc: Omit<UserRoleDocument, '_id' | 'created_at'> = {
        user_id: userResult.insertedId,
        role_id: normalUserRole,
        created_by: patientData.created_by
      };

      await this.userRoleCollection.insertOne({
        ...userRoleDoc,
        created_at: new Date()
      } as UserRoleDocument);

      // Create Patient record
      const patientToInsert: Omit<PatientDocument, '_id'> = {
        ...patientData,
        user_id: userResult.insertedId,
        created_at: new Date(),
        updated_at: new Date()
      };

      const patientResult = await this.collection.insertOne(patientToInsert as PatientDocument);
      
      if (!patientResult.insertedId) {
        // Rollback: delete user account if patient creation fails
        await this.userCollection.deleteOne({ _id: userResult.insertedId });
        await this.userRoleCollection.deleteMany({ user_id: userResult.insertedId });
        
        return {
          success: false,
          error: 'Failed to create patient'
        };
      }

      const createdPatient = await this.collection.findOne({ _id: patientResult.insertedId });

      return {
        success: true,
        data: {
          ...createdPatient!,
          temporaryPassword
        }
      };

    } catch (error) {
      console.error('Error creating patient:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_SAVE_ERROR
      };
    }
  }

  /**
   * Get patient by ID
   */
  async getById(id: string | ObjectId): Promise<QueryResult<PatientDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid patient ID'
        };
      }

      const patient = await this.collection.findOne({ 
        _id: objectId,
        deleted_at: { $exists: false }
      });

      if (!patient) {
        return {
          success: false,
          error: 'Patient not found'
        };
      }

      return {
        success: true,
        data: patient
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
      };
    }
  }

  /**
   * Get patient by user_id (for logged-in patients)
   */
  async getByUserId(userId: string | ObjectId): Promise<QueryResult<PatientDocument>> {
    try {
      const objectId = toObjectId(userId);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      const patient = await this.collection.findOne({ 
        user_id: objectId,
        deleted_at: { $exists: false }
      });

      if (!patient) {
        return {
          success: false,
          error: 'Patient not found'
        };
      }

      return {
        success: true,
        data: patient
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
      };
    }
  }

  /**
   * Update patient
   */
  async update(id: string | ObjectId, updates: UpdatePatientInput): Promise<QueryResult<PatientDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid patient ID'
        };
      }

      const updateData = {
        ...updates,
        updated_at: new Date(),
        updated_by: updates.updated_by
      };

      const result = await this.collection.updateOne(
        { 
          _id: objectId,
          deleted_at: { $exists: false }
        },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'Patient not found'
        };
      }

      const updatedPatient = await this.collection.findOne({ _id: objectId });

      return {
        success: true,
        data: updatedPatient!
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_UPDATE_ERROR
      };
    }
  }

  /**
   * Soft delete patient
   */
  async delete(id: string | ObjectId, deletedBy: ObjectId): Promise<QueryResult<boolean>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid patient ID'
        };
      }

      const patient = await this.collection.findOne({ 
        _id: objectId,
        deleted_at: { $exists: false }
      });

      if (!patient) {
        return {
          success: false,
          error: 'Patient not found'
        };
      }

      await this.collection.updateOne(
        { _id: objectId },
        { 
          $set: { 
            deleted_at: new Date(),
            updated_by: deletedBy,
            updated_at: new Date()
          }
        }
      );

      // Lock the associated user account
      if (patient.user_id) {
        await this.userCollection.updateOne(
          { _id: patient.user_id },
          { $set: { is_locked: true } }
        );
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_DELETE_ERROR
      };
    }
  }

  /**
   * List patients with pagination
   */
  async list(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<QueryResult<{ patients: PatientDocument[]; total: number; page: number; limit: number }>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const { skip, limit: takeLimit } = createPaginationOptions(page, limit);

      // Build query
      const query: any = {
        deleted_at: { $exists: false }
      };

      // Add search filter
      if (options.search) {
        query.$or = [
          { full_name: { $regex: options.search, $options: 'i' } },
          { email: { $regex: options.search, $options: 'i' } },
          { identity_number: { $regex: options.search, $options: 'i' } },
          { phone_number: { $regex: options.search, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await this.collection.countDocuments(query);

      // Get patients
      const patients = await this.collection
        .find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(takeLimit)
        .toArray();

      return {
        success: true,
        data: {
          patients,
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
}

