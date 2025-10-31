import { Router } from 'express';
import { getAllParameters, getParameterById } from '../../controllers/parameter.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Parameter view routes (read-only)
router.get(
  '/',
  authMiddleware,
  getAllParameters
);

router.get(
  '/:id',
  authMiddleware,
  getParameterById
);

export default router;

