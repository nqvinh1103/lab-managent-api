import { Router } from 'express';
import {
  storeRawResult,
  getAllRawResults,
  getRawResultById,
  deleteRawResult
} from '../../controllers/rawTestResult.controller';
import { authMiddleware, checkPrivilege } from '~/middlewares/auth.middleware';
import { PRIVILEGES } from '~/constants/privileges';
import { validationMiddleware } from '~/middlewares/validation.middleware';

const router = Router();

// Store HL7 message
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.EXECUTE_BLOOD_TESTING]),
  validationMiddleware,
  storeRawResult
);

// View all raw results
router.get(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_MONITORING]),
  getAllRawResults
);

// View raw result by ID
router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_MONITORING]),
  getRawResultById
);

// Manual delete raw result
router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.DELETE_BACKUP_DATA]),
  deleteRawResult
);

export default router;

