import { Router } from 'express';
import {
  createVendorSupply,
  getAllVendorSupply,
  getVendorSupplyById
} from '../../controllers/reagentVendorSupply.controller';
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { PRIVILEGES } from '../../constants/privileges';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  createVendorSupplyValidation,
  searchVendorSupplyValidation,
  vendorSupplyIdValidation
} from '../../middlewares/validations/reagentVendorSupply.validation';

const router = Router();

// Create vendor supply history record
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.ADD_REAGENTS]),
  createVendorSupplyValidation,
  validationMiddleware,
  createVendorSupply
);

// Get all vendor supply history with filters
router.get(
  '/',
  authMiddleware,
  searchVendorSupplyValidation,
  validationMiddleware,
  getAllVendorSupply
);

// Get vendor supply history by ID
router.get(
  '/:id',
  authMiddleware,
  vendorSupplyIdValidation,
  validationMiddleware,
  getVendorSupplyById
);

export default router;

