import express from 'express';
import { 
  createTestResult,
  getAllTestResults,
  getTestResultById,
  updateTestResult,
  deleteTestResult 
} from '../../controllers/testResult.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validationMiddleware } from '../../middlewares/validation.middleware';

const router = express.Router();

// Create Test Result
router.post('/', 
  authMiddleware,
  validationMiddleware,
  createTestResult
);

// Get all Test Results
router.get('/',
  authMiddleware,
  getAllTestResults
);

// Get Test Result by ID
router.get('/:id',
  authMiddleware,
  validationMiddleware,
  getTestResultById
);

// Update Test Result
router.put('/:id',
  authMiddleware,
  validationMiddleware,
  updateTestResult
);

// Delete Test Result
router.delete('/:id',
  authMiddleware,
  validationMiddleware,
  deleteTestResult
);

export default router;
