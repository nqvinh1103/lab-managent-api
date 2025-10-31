import { Router } from 'express';
import {
  createConfiguration,
  deleteConfiguration,
  getAllConfigurations,
  getConfigurationById,
  updateConfiguration
} from '../../controllers/configuration.controller';
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { PRIVILEGES } from '../../constants/privileges';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  configurationIdValidation,
  createConfigurationValidation,
  searchConfigurationValidation,
  updateConfigurationValidation
} from '../../middlewares/validations/configuration.validation';

const router = Router();

// Configuration CRUD
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.CREATE_CONFIGURATION]),
  createConfigurationValidation,
  validationMiddleware,
  createConfiguration
);

router.get(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_CONFIGURATION]),
  searchConfigurationValidation,
  validationMiddleware,
  getAllConfigurations
);

router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_CONFIGURATION]),
  configurationIdValidation,
  validationMiddleware,
  getConfigurationById
);

router.put(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_CONFIGURATION]),
  updateConfigurationValidation,
  validationMiddleware,
  updateConfiguration
);

router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.DELETE_CONFIGURATION]),
  configurationIdValidation,
  validationMiddleware,
  deleteConfiguration
);

export default router;

