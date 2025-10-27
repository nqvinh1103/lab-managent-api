import { Router } from 'express';
import {
  assignRole,
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  lockUser,
  removeRole,
  unlockUser,
  updateUser
} from '../../controllers/user.controller';
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { PRIVILEGES } from '../../constants/privileges';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  assignRoleValidation,
  createUserValidation,
  updateUserValidation,
  userIdValidation
} from '../../middlewares/validations/user.validation';

const router = Router();

// User CRUD
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.CREATE_USER]),
  createUserValidation,
  validationMiddleware,
  createUser
);

router.get(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_USER]),
  getAllUsers
);

router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_USER]),
  userIdValidation,
  validationMiddleware,
  getUserById
);

router.put(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_USER]),
  updateUserValidation,
  validationMiddleware,
  updateUser
);

router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.DELETE_USER]),
  userIdValidation,
  validationMiddleware,
  deleteUser
);

// Role management
router.post(
  '/:id/roles',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_USER]),
  assignRoleValidation,
  validationMiddleware,
  assignRole
);

router.delete(
  '/:id/roles/:roleId',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_USER]),
  removeRole
);

// Lock/Unlock
router.post(
  '/:id/lock',
  authMiddleware,
  checkPrivilege([PRIVILEGES.LOCK_UNLOCK_USER]),
  userIdValidation,
  validationMiddleware,
  lockUser
);

router.post(
  '/:id/unlock',
  authMiddleware,
  checkPrivilege([PRIVILEGES.LOCK_UNLOCK_USER]),
  userIdValidation,
  validationMiddleware,
  unlockUser
);

export default router;
