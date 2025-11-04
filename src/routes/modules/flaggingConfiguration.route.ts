import { Router } from 'express';
import { PRIVILEGES } from '../../constants/privileges';
import {
    createFlaggingConfiguration,
    deleteFlaggingConfiguration,
    getAllFlaggingConfigurations,
    getFlaggingConfigurationById,
    syncFlaggingConfigurations,
    updateFlaggingConfiguration
} from '../../controllers/flaggingConfiguration.controller';
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
    createFlaggingConfigurationValidation,
    flaggingConfigurationIdValidation,
    searchFlaggingConfigurationValidation,
    syncFlaggingConfigurationValidation,
    updateFlaggingConfigurationValidation
} from '../../middlewares/validations/flaggingConfiguration.validation';

const router = Router();

// Flagging Configuration CRUD
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.CREATE_CONFIGURATION]),
  createFlaggingConfigurationValidation,
  validationMiddleware,
  createFlaggingConfiguration
);

router.get(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_CONFIGURATION]),
  searchFlaggingConfigurationValidation,
  validationMiddleware,
  getAllFlaggingConfigurations
);

router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_CONFIGURATION]),
  flaggingConfigurationIdValidation,
  validationMiddleware,
  getFlaggingConfigurationById
);

router.put(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_CONFIGURATION]),
  updateFlaggingConfigurationValidation,
  validationMiddleware,
  updateFlaggingConfiguration
);

router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.DELETE_CONFIGURATION]),
  flaggingConfigurationIdValidation,
  validationMiddleware,
  deleteFlaggingConfiguration
);

// Sync-up endpoint
router.post(
  '/sync',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_CONFIGURATION]),
  syncFlaggingConfigurationValidation,
  validationMiddleware,
  syncFlaggingConfigurations
);

export default router;

