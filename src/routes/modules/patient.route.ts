import { Router } from 'express';
import { PRIVILEGES } from '../../constants/privileges';
import {
  createPatient,
  deletePatient,
  getMyProfile,
  getPatient,
  getPatientTestOrders,
  listPatients,
  updatePatient
} from '../../controllers/patient.controller';
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  createPatientValidation,
  listPatientsValidation,
  patientIdValidation,
  updatePatientValidation
} from '../../middlewares/validations/patient.validation';

const router = Router();

// Admin routes (require User Management privileges)
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.CREATE_USER]),
  createPatientValidation,
  validationMiddleware,
  createPatient
);

router.get(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_USER, PRIVILEGES.READ_ONLY]),
  listPatientsValidation,
  validationMiddleware,
  listPatients
);

// Patient portal routes (require authentication only, no privilege check)
// IMPORTANT: This must be before /:id route to avoid matching "me" as an id
router.get(
  '/me',
  authMiddleware,
  getMyProfile
);

// Get patient's test orders (must be before /:id route)
router.get(
  '/:id/test-orders',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_USER, PRIVILEGES.READ_ONLY]),
  patientIdValidation,
  validationMiddleware,
  getPatientTestOrders
);

router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_USER, PRIVILEGES.READ_ONLY]),
  patientIdValidation,
  validationMiddleware,
  getPatient
);

router.put(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_USER]),
  updatePatientValidation,
  validationMiddleware,
  updatePatient
);

router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.DELETE_USER]),
  patientIdValidation,
  validationMiddleware,
  deletePatient
);

export default router;

