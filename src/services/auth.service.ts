import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { MESSAGES } from '../constants/messages';
import { PrivilegeDocument } from '../models/Privilege';
import { RoleDocument } from '../models/Role';
import { UserDocument } from '../models/User';
import { EmailService } from './email.service';
import { QueryResult, toObjectId } from '../utils/database.helper';
import { validatePasswordStrength } from '../utils/hashPassword';
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

  /**
   * Change user password (without requiring old password)
   * Used for patient password reset
   */
  async changePassword(userId: string, newPassword: string): Promise<QueryResult<boolean>> {
    try {
      const objectId = toObjectId(userId);
      
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      // Find user
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

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      const result = await this.getUserCollection().updateOne(
        { _id: objectId },
        { 
          $set: { 
            password_hash: hashedPassword,
            updated_at: new Date()
          } 
        }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'Failed to update password'
        };
      }

      console.log(`✅ Password changed successfully for user: ${user.email}`);

      return {
        success: true,
        data: true
      };

    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password'
      };
    }
  }

  async forgotPassword(email: string): Promise<QueryResult<boolean>> {
    try {
      // Find user by email
      const user = await this.getUserCollection().findOne({ 
        email: email.toLowerCase() 
      });

      // For security, always return success even if user doesn't exist
      if (!user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        return {
          success: true,
          data: true
        };
      }

      // Check if account is locked
      if (user.is_locked) {
        // Still return success to not reveal account status
        return {
          success: true,
          data: true
        };
      }

      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Calculate expiration time (default: 1 hour)
      const expiryHours = parseInt(process.env.RESET_TOKEN_EXPIRY_HOURS || '1', 10);
      const resetTokenExpiresAt = new Date();
      resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + expiryHours);

      // Save token and expiration to user document
      await this.getUserCollection().updateOne(
        { _id: user._id },
        { 
          $set: { 
            reset_token: resetToken,
            reset_token_expires_at: resetTokenExpiresAt,
            updated_at: new Date()
          } 
        }
      );

      // Send reset email
      const emailService = new EmailService();
      await emailService.sendPasswordResetEmail(
        user.email,
        user.full_name,
        resetToken
      );

      console.log(`✅ Password reset token generated for user: ${user.email}`);

      return {
        success: true,
        data: true
      };

    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process password reset request'
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<QueryResult<boolean>> {
    try {
      // Validate password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.message || MESSAGES.WEAK_PASSWORD
        };
      }

      // Find user by reset token
      const user = await this.getUserCollection().findOne({ 
        reset_token: token 
      });

      if (!user) {
        return {
          success: false,
          error: MESSAGES.RESET_TOKEN_INVALID
        };
      }

      // Check if token is expired
      if (!user.reset_token_expires_at || user.reset_token_expires_at < new Date()) {
        // Clear expired token
        await this.getUserCollection().updateOne(
          { _id: user._id },
          { 
            $unset: { 
              reset_token: '',
              reset_token_expires_at: ''
            },
            $set: { updated_at: new Date() }
          }
        );

        return {
          success: false,
          error: MESSAGES.RESET_TOKEN_EXPIRED
        };
      }

      // Check if account is locked
      if (user.is_locked) {
        return {
          success: false,
          error: MESSAGES.USER_LOCKED
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      const result = await this.getUserCollection().updateOne(
        { _id: user._id },
        { 
          $set: { 
            password_hash: hashedPassword,
            updated_at: new Date()
          },
          $unset: {
            reset_token: '',
            reset_token_expires_at: ''
          }
        }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'Failed to update password'
        };
      }

      console.log(`✅ Password reset successfully for user: ${user.email}`);

      return {
        success: true,
        data: true
      };

    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password'
      };
    }
  }
}

