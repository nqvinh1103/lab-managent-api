import { Router } from 'express';
import {
  createReagentInventory,
  getAllReagentInventory,
  getReagentInventoryById,
  updateReagentInventory,
  updateReagentInventoryStock,
  updateReagentInventoryStatus
} from '../../controllers/reagentInventory.controller';
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { PRIVILEGES } from '../../constants/privileges';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  createReagentInventoryValidation,
  reagentInventoryIdValidation,
  updateReagentInventoryValidation,
  updateReagentInventoryStockValidation,
  updateReagentInventoryStatusValidation
} from '../../middlewares/validations/reagentInventory.validation';

const router = Router();

// Create reagent inventory
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.ADD_REAGENTS]),
  createReagentInventoryValidation,
  validationMiddleware,
  createReagentInventory
);

// Get all reagent inventory with filters
router.get(
  '/',
  authMiddleware,
  getAllReagentInventory
);

// Get reagent inventory by ID
router.get(
  '/:id',
  authMiddleware,
  reagentInventoryIdValidation,
  validationMiddleware,
  getReagentInventoryById
);

// Update reagent inventory
router.put(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_REAGENTS]),
  reagentInventoryIdValidation,
  updateReagentInventoryValidation,
  validationMiddleware,
  updateReagentInventory
);

// Update reagent inventory stock
router.put(
  '/:id/stock',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_REAGENTS]),
  reagentInventoryIdValidation,
  updateReagentInventoryStockValidation,
  validationMiddleware,
  updateReagentInventoryStock
);

// Update reagent inventory status
router.put(
  '/:id/status',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_REAGENTS]),
  reagentInventoryIdValidation,
  updateReagentInventoryStatusValidation,
  validationMiddleware,
  updateReagentInventoryStatus
);

export default router;

