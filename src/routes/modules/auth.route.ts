import { Router } from 'express';
import { changePassword, forgotPassword, getMe, login, logout, refreshToken, resetPassword } from '../../controllers/auth.controller';
import { authMiddleware, refreshTokenMiddleware } from '../../middlewares/auth.middleware';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { changePasswordValidation, forgotPasswordValidation, resetPasswordValidation } from '../../middlewares/validations/auth.validation';

const router = Router();

// POST /auth/login - User login
router.post('/login', login);

// POST /auth/refresh-token - Refresh JWT token
// Uses refreshTokenMiddleware to allow expired tokens for refresh
router.post('/refresh-token', refreshTokenMiddleware, refreshToken);

// GET /auth/me - Get current user's profile
router.get('/me', authMiddleware, getMe);

// POST /auth/logout - User logout
router.post('/logout', logout);

// PUT /auth/change-password - Change user password
router.put(
  '/change-password',
  authMiddleware,
  changePasswordValidation,
  validationMiddleware,
  changePassword
);

// POST /auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  forgotPasswordValidation,
  validationMiddleware,
  forgotPassword
);

// POST /auth/reset-password - Reset password with token
router.post(
  '/reset-password',
  resetPasswordValidation,
  validationMiddleware,
  resetPassword
);

export default router;

