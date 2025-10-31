import { Router } from 'express';
import {
  createUsage,
  getUsages,
  getUsageById,
  updateUsage,
  deleteUsage,
} from '../../controllers/reagentUsageHistory.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
  getAllUsageHistory,
  getUsageHistoryById
} from '../../controllers/reagentUsageHistory.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { param, query } from 'express-validator';
import { validationMiddleware } from '../../middlewares/validation.middleware';

const router = Router();

router.post('/', authMiddleware, validationMiddleware, createUsage);
router.get('/', authMiddleware, getUsages);
router.get('/:id', authMiddleware, validationMiddleware, getUsageById);
router.put('/:id', authMiddleware, validationMiddleware, updateUsage);
router.delete('/:id', authMiddleware, validationMiddleware, deleteUsage);

export default router;
// Validation for query parameters
const searchValidation = [
  query('reagent_lot_number').optional().trim(),
  query('instrument_id').optional().isMongoId().withMessage('Invalid instrument ID'),
  query('test_order_id').optional().isMongoId().withMessage('Invalid test order ID'),
  query('start_date').optional().isISO8601().withMessage('start_date must be a valid date'),
  query('end_date').optional().isISO8601().withMessage('end_date must be a valid date'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const idValidation = [
  param('id').notEmpty().withMessage('ID is required').isMongoId().withMessage('Invalid ID format')
];

// Get all usage history with filters (view only)
router.get(
  '/',
  authMiddleware,
  searchValidation,
  validationMiddleware,
  getAllUsageHistory
);

// Get usage history by ID
router.get(
  '/:id',
  authMiddleware,
  idValidation,
  validationMiddleware,
  getUsageHistoryById
);

export default router;

