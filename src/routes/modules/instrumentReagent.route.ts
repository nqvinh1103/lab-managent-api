import { Router } from 'express';
import {
  createReagentController,
  getReagentsController,
  getReagentByIdController,
  updateReagentController,
  updateReagentStatusController,
  deleteReagentController
} from '../../controllers/instrumentReagent.controller';
import { authMiddleware, checkPrivilege } from '~/middlewares/auth.middleware';
import { validationMiddleware } from '~/middlewares/validation.middleware';
import { PRIVILEGES } from '~/constants/privileges';
import {
  createInstrumentReagentValidation,
  instrumentReagentIdValidation,
  updateInstrumentReagentValidation,
  updateReagentStatusValidation
} from '../../middlewares/validations/instrumentReagent.validation';

const router = Router();

// Create reagent (install)
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.ADD_REAGENTS]),
  createInstrumentReagentValidation,
  validationMiddleware,
  createReagentController
);

// Get all reagents
router.get(
  '/',
  authMiddleware,
  getReagentsController
);

// Get reagent by ID
router.get(
  '/:id',
  authMiddleware,
  instrumentReagentIdValidation,
  validationMiddleware,
  getReagentByIdController
);

// Update reagent
router.put(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_REAGENTS]),
  instrumentReagentIdValidation,
  updateInstrumentReagentValidation,
  validationMiddleware,
  updateReagentController
);

// Update reagent status only
router.patch(
  '/:id/status',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_REAGENTS]),
  instrumentReagentIdValidation,
  updateReagentStatusValidation,
  validationMiddleware,
  updateReagentStatusController
);

// Delete reagent
router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.DELETE_REAGENTS]),
  instrumentReagentIdValidation,
  validationMiddleware,
  deleteReagentController
);

export default router;
