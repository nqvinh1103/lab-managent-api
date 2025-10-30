import { Router } from 'express';
import {
  getAllEventLogs,
  getEventLogById
} from '../../controllers/eventLog.controller';
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { PRIVILEGES } from '../../constants/privileges';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  eventLogIdValidation,
  eventLogQueryValidation
} from '../../middlewares/validations/eventLog.validation';

const router = Router();

router.get(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_EVENT_LOGS]),
  eventLogQueryValidation,
  validationMiddleware,
  getAllEventLogs
);

router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_EVENT_LOGS]),
  eventLogIdValidation,
  validationMiddleware,
  getEventLogById
);

export default router;

