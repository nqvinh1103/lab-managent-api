import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { MESSAGES } from '../constants/messages';
import { PrivilegeDocument } from '../models/Privilege';
import { RoleDocument } from '../models/Role';
import { UserDocument } from '../models/User';
import { QueryResult, toObjectId } from '../utils/database.helper';
import { signToken, TokenPayload } from '../utils/jwt';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    roles: string[];
    privileges: string[];
  };
}

export class AuthService {
  private getUserCollection = () => getCollection<UserDocument>('users');
  private getRoleCollection = () => getCollection<RoleDocument>('roles');
  private getPrivilegeCollection = () => getCollection<PrivilegeDocument>('privileges');

  async login(email: string, password: string): Promise<QueryResult<LoginResult>> {
    try {
      // Step 1: Find user by email
      const userResult = await this.getUserCollection().findOne({ 
        email: email.toLowerCase() 
      });

      if (!userResult) {
        return {
          success: false,
          error: MESSAGES.INVALID_CREDENTIALS
        };
      }

      const user = userResult;

      // Step 2: Check if account is locked
      if (user.is_locked) {
        return {
          success: false,
          error: MESSAGES.USER_LOCKED
        };
      }

      // Step 3: Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: MESSAGES.INVALID_CREDENTIALS
        };
      }

      // Step 4: Get user's roles
      const roleIds = user.role_ids || [];
      
      if (roleIds.length === 0) {
        return {
          success: false,
          error: 'User has no roles assigned'
        };
      }

      // Fetch roles from database
      const roles = await this.getRoleCollection()
        .find({ _id: { $in: roleIds } })
        .toArray();

      if (roles.length === 0) {
        return {
          success: false,
          error: 'User roles not found'
        };
      }

      // Extract role codes
      const roleCodes = roles.map(role => role.role_code);

      // Step 5: Get all privileges from user's roles
      const privilegeIds = new Set<ObjectId>();
      
      roles.forEach(role => {
        if (role.privilege_ids && role.privilege_ids.length > 0) {
          role.privilege_ids.forEach(pid => privilegeIds.add(pid));
        }
      });

      // Fetch privilege documents to get privilege codes
      const privilegeDocuments = privilegeIds.size > 0
        ? await this.getPrivilegeCollection()
            .find({ _id: { $in: Array.from(privilegeIds) } })
            .toArray()
        : [];

      const privilegeCodes = privilegeDocuments.map(p => p.privilege_code);

      // Step 6: Generate JWT token
      const tokenPayload: TokenPayload = {
        id: user._id.toString(),
        email: user.email,
        roles: roleCodes
      };

      const token = signToken(tokenPayload);

      // Step 7: Update last_activity
      await this.getUserCollection().updateOne(
        { _id: user._id },
        { $set: { last_activity: new Date() } }
      );

      // Step 8: Prepare response data
      const loginResult: LoginResult = {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          full_name: user.full_name,
          roles: roleCodes,
          privileges: privilegeCodes
        }
      };

      return {
        success: true,
        data: loginResult
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.LOGIN_FAILED
      };
    }
  }

  async refreshToken(userId: string): Promise<QueryResult<{ token: string; privileges: string[] }>> {
    try {
      const objectId = toObjectId(userId);
      
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      // Get user
      const user = await this.getUserCollection().findOne({ _id: objectId });

      if (!user) {
        return {
          success: false,
          error: MESSAGES.USER_NOT_FOUND
        };
      }

      // Check if account is locked
      if (user.is_locked) {
        return {
          success: false,
          error: MESSAGES.USER_LOCKED
        };
      }

      // Get user's roles
      const roleIds = user.role_ids || [];
      const roles = await this.getRoleCollection()
        .find({ _id: { $in: roleIds } })
        .toArray();

      const roleCodes = roles.map(role => role.role_code);

      // Get privileges from roles
      const privilegeIds = new Set<ObjectId>();
      roles.forEach(role => {
        if (role.privilege_ids && role.privilege_ids.length > 0) {
          role.privilege_ids.forEach(pid => privilegeIds.add(pid));
        }
      });

      const privilegeDocuments = privilegeIds.size > 0
        ? await this.getPrivilegeCollection()
            .find({ _id: { $in: Array.from(privilegeIds) } })
            .toArray()
        : [];

      const privilegeCodes = privilegeDocuments.map(p => p.privilege_code);

      // Generate new token
      const tokenPayload: TokenPayload = {
        id: user._id.toString(),
        email: user.email,
        roles: roleCodes
      };

      const token = signToken(tokenPayload);

      return {
        success: true,
        data: { token, privileges: privilegeCodes }
      };

    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token'
      };
    }
  }
}

