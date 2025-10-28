import { Router } from 'express';
import {
  createPatient,
  deletePatient,
  getMyProfile,
  getPatient,
  listPatients,
  updatePatient
} from '../../controllers/patient.controller';
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { PRIVILEGES } from '../../constants/privileges';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  createPatientValidation,
  patientIdValidation,
  listPatientsValidation,
  updatePatientValidation
} from '../../middlewares/validations/patient.validation';

const router = Router();

// Admin routes (require MANAGE_PATIENT privilege)
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.CREATE_TEST_ORDER]),
  createPatientValidation,
  validationMiddleware,
  createPatient
);

router.get(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.READ_ONLY]),
  listPatientsValidation,
  validationMiddleware,
  listPatients
);

router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.READ_ONLY]),
  patientIdValidation,
  validationMiddleware,
  getPatient
);

router.put(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_TEST_ORDER]),
  updatePatientValidation,
  validationMiddleware,
  updatePatient
);

router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.DELETE_TEST_ORDER]),
  patientIdValidation,
  validationMiddleware,
  deletePatient
);

// Patient portal routes (require authentication)
router.get(
  '/me',
  authMiddleware,
  getMyProfile
);

export default router;

