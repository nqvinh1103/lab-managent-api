import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: 'Email and password are required'
      });
      return;
    }

    // Call auth service
    const result = await authService.login(email, password);

    if (!result.success) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS,
        error: result.error
      });
      return;
    }

    // Return success response
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      data: result.data
    });

  } catch (error) {
    console.error('Login controller error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Login failed'
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user ID from authenticated user (req.user is set by authMiddleware)
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const userId = req.user.id;

    // Call auth service to generate new token
    const result = await authService.refreshToken(userId);

    if (!result.success) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: result.error
      });
      return;
    }

    // Return success response with new token
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Refresh token controller error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Token refresh failed'
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In JWT-based auth, logout is mainly client-side
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.LOGOUT_SUCCESS
    });

  } catch (error) {
    console.error('Logout controller error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Logout failed'
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get authenticated user from middleware
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const { newPassword } = req.body;
    const userId = req.user.id;

    // Call auth service
    const result = await authService.changePassword(userId, newPassword);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Failed to change password',
        error: result.error
      });
      return;
    }

    // Return success response
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed successfully. Please login with your new password.'
    });

  } catch (error) {
    console.error('Change password controller error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to change password'
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: 'Email is required'
      });
      return;
    }

    // Call auth service
    const result = await authService.forgotPassword(email);

    if (!result.success) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.INTERNAL_ERROR,
        error: result.error
      });
      return;
    }

    // Always return success (security: don't reveal if email exists)
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.FORGOT_PASSWORD_SUCCESS
    });

  } catch (error) {
    console.error('Forgot password controller error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to process request'
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: 'Token and new password are required'
      });
      return;
    }

    // Call auth service
    const result = await authService.resetPassword(token, newPassword);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error === MESSAGES.RESET_TOKEN_EXPIRED || result.error === MESSAGES.RESET_TOKEN_INVALID
          ? result.error
          : MESSAGES.VALIDATION_ERROR,
        error: result.error
      });
      return;
    }

    // Return success response
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.RESET_PASSWORD_SUCCESS
    });

  } catch (error) {
    console.error('Reset password controller error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to reset password'
    });
  }
};

