import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { AuthService } from '../services/auth.service';
import { sendSuccessResponse, sendErrorResponse, handleServiceResult } from '../utils/response.helper';

const authService = new AuthService();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.VALIDATION_ERROR, 'Email and password are required');
      return;
    }

    // Call auth service
    const result = await authService.login(email, password);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.UNAUTHORIZED,
        result.statusCode === HTTP_STATUS.FORBIDDEN ? result.error || MESSAGES.USER_LOCKED : MESSAGES.INVALID_CREDENTIALS,
        result.error
      );
      return;
    }

    // Return success response
    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.LOGIN_SUCCESS, result.data);

  } catch (error) {
    console.error('Login controller error:', error);
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Login failed'
    );
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user ID from authenticated user (req.user is set by authMiddleware)
    if (!req.user) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    const userId = req.user.id;

    // Call auth service to generate new token
    const result = await authService.refreshToken(userId);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.UNAUTHORIZED,
        result.statusCode === HTTP_STATUS.FORBIDDEN ? result.error || MESSAGES.USER_LOCKED : MESSAGES.UNAUTHORIZED,
        result.error
      );
      return;
    }

    // Return success response with new token
    sendSuccessResponse(res, HTTP_STATUS.OK, 'Token refreshed successfully', result.data);

  } catch (error) {
    console.error('Refresh token controller error:', error);
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Token refresh failed'
    );
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In JWT-based auth, logout is mainly client-side
    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.LOGOUT_SUCCESS);

  } catch (error) {
    console.error('Logout controller error:', error);
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Logout failed'
    );
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get authenticated user from middleware
    if (!req.user) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    const { newPassword } = req.body;
    const userId = req.user.id;

    // Call auth service
    const result = await authService.changePassword(userId, newPassword);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        'Failed to change password',
        result.error
      );
      return;
    }

    // Return success response
    sendSuccessResponse(res, HTTP_STATUS.OK, 'Password changed successfully. Please login with your new password.');

  } catch (error) {
    console.error('Change password controller error:', error);
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to change password'
    );
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.VALIDATION_ERROR, 'Email is required');
      return;
    }

    // Call auth service
    const result = await authService.forgotPassword(email);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        MESSAGES.INTERNAL_ERROR,
        result.error
      );
      return;
    }

    // Always return success (security: don't reveal if email exists)
    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.FORGOT_PASSWORD_SUCCESS);

  } catch (error) {
    console.error('Forgot password controller error:', error);
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to process request'
    );
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.VALIDATION_ERROR, 'Token and new password are required');
      return;
    }

    // Call auth service
    const result = await authService.resetPassword(token, newPassword);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        result.error === MESSAGES.RESET_TOKEN_EXPIRED || result.error === MESSAGES.RESET_TOKEN_INVALID
          ? result.error
          : MESSAGES.VALIDATION_ERROR,
        result.error
      );
      return;
    }

    // Return success response
    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.RESET_PASSWORD_SUCCESS);

  } catch (error) {
    console.error('Reset password controller error:', error);
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to reset password'
    );
  }
};

