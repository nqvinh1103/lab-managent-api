import { Router } from 'express';
import {
  getAllReagents,
  getReagentById,
  updateReagentMetadata
} from '../../controllers/reagent.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  reagentIdValidation,
  updateReagentMetadataValidation
} from '../../middlewares/validations/reagent.validation';

const router = Router();

// GET all reagents (read-only for all authenticated users)
router.get(
  '/',
  authMiddleware,
  getAllReagents
);

// GET reagent by ID (read-only for all authenticated users)
router.get(
  '/:id',
  authMiddleware,
  reagentIdValidation,
  validationMiddleware,
  getReagentById
);

// PATCH reagent metadata (ADMIN only)
router.patch(
  '/:id',
  authMiddleware,
  checkRole(['ADMIN']),
  reagentIdValidation,
  updateReagentMetadataValidation,
  validationMiddleware,
  updateReagentMetadata
);

export default router;

