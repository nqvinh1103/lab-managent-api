import { Router } from 'express';
import { changePassword, login, logout, refreshToken } from '../../controllers/auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { changePasswordValidation } from '../../middlewares/validations/auth.validation';

const router = Router();

// POST /auth/login - User login
router.post('/login', login);

// POST /auth/refresh-token - Refresh JWT token
router.post('/refresh-token', authMiddleware, refreshToken);

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

export default router;

