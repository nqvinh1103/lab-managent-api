import { Router } from 'express';
import { login, logout, refreshToken } from '../../controllers/auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// POST /auth/login - User login
router.post('/login', login);

// POST /auth/refresh-token - Refresh JWT token
router.post('/refresh-token', authMiddleware, refreshToken);

// POST /auth/logout - User logout
router.post('/logout', logout);

export default router;

