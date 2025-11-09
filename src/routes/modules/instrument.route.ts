import { Router } from 'express';
import {
  changeModeInstrument,
  createInstrument,
  deleteInstrument,
  getAllInstruments,
  getInstrumentById,
  updateInstrument
} from '../../controllers/instrument.controller';
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { PRIVILEGES } from '../../constants/privileges';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  changeModeValidation,
  createInstrumentValidation,
  instrumentIdValidation,
  listInstrumentsValidation,
  updateInstrumentValidation
} from '../../middlewares/validations/instrument.validation';

const router = Router();

// Create instrument
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.ADD_INSTRUMENT]),
  createInstrumentValidation,
  validationMiddleware,
  createInstrument
);

// Get all instruments
router.get(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_INSTRUMENT]),
  listInstrumentsValidation,
  validationMiddleware,
  getAllInstruments
);

// Get instrument by ID
router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_INSTRUMENT]),
  instrumentIdValidation,
  validationMiddleware,
  getInstrumentById
);

// Update instrument
router.put(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.ADD_INSTRUMENT]),
  updateInstrumentValidation,
  validationMiddleware,
  updateInstrument
);

// Delete instrument
router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.ADD_INSTRUMENT]),
  instrumentIdValidation,
  validationMiddleware,
  deleteInstrument
);

// Change instrument mode
router.post(
  '/:id/change-mode',
  authMiddleware,
  checkPrivilege([PRIVILEGES.ACTIVATE_DEACTIVATE_INSTRUMENT]),
  changeModeValidation,
  validationMiddleware,
  changeModeInstrument
);

export default router;

