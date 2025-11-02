import { Router } from 'express';
import { PRIVILEGES } from '~/constants/privileges';
import { authMiddleware, checkPrivilege } from '~/middlewares/auth.middleware';
import { validationMiddleware } from '~/middlewares/validation.middleware';
import {
  deleteRawResult,
  getAllRawResults,
  getRawResultById,
  storeRawResult
} from '../../controllers/rawTestResult.controller';

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
  checkPrivilege([PRIVILEGES.EXECUTE_BLOOD_TESTING]),
  getAllRawResults
);

// View raw result by ID
router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.EXECUTE_BLOOD_TESTING]),
  getRawResultById
);

// Manual delete raw result
router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.EXECUTE_BLOOD_TESTING]),
  deleteRawResult
);

export default router;

