import { Router } from 'express';
import {
  createUsage,
  getUsages,
  getUsageById,
  updateUsage,
  deleteUsage,
} from '../../controllers/reagentUsageHistory.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validationMiddleware } from '../../middlewares/validation.middleware';

const router = Router();

router.post('/', authMiddleware, validationMiddleware, createUsage);
router.get('/', authMiddleware, getUsages);
router.get('/:id', authMiddleware, validationMiddleware, getUsageById);
router.put('/:id', authMiddleware, validationMiddleware, updateUsage);
router.delete('/:id', authMiddleware, validationMiddleware, deleteUsage);

export default router;
