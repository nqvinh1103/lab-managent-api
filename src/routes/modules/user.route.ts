import { Router } from 'express';
import {
    assignRole,
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    lockUser,
    removeRole,
    searchUsers,
    unlockUser,
    updateUser
} from '../../controllers/user.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
    assignRoleValidation,
    createUserValidation,
    searchUserValidation,
    updateUserValidation,
    userIdValidation
} from '../../middlewares/validations/user.validation';

const router = Router();

// All routes require authentication and admin/lab_manager role
const roleCheck = checkRole(['ADMIN', 'LAB_MANAGER']);

// User CRUD
router.post(
  '/',
  authMiddleware,
  roleCheck,
  createUserValidation,
  validationMiddleware,
  createUser
);

router.get(
  '/',
  authMiddleware,
  roleCheck,
  getAllUsers
);

router.get(
  '/search',
  authMiddleware,
  roleCheck,
  searchUserValidation,
  validationMiddleware,
  searchUsers
);

router.get(
  '/:id',
  authMiddleware,
  roleCheck,
  userIdValidation,
  validationMiddleware,
  getUserById
);

router.put(
  '/:id',
  authMiddleware,
  roleCheck,
  updateUserValidation,
  validationMiddleware,
  updateUser
);

router.delete(
  '/:id',
  authMiddleware,
  roleCheck,
  userIdValidation,
  validationMiddleware,
  deleteUser
);

// Role management
router.post(
  '/:id/roles',
  authMiddleware,
  roleCheck,
  assignRoleValidation,
  validationMiddleware,
  assignRole
);

router.delete(
  '/:id/roles/:roleId',
  authMiddleware,
  roleCheck,
  removeRole
);

// Lock/Unlock
router.post(
  '/:id/lock',
  authMiddleware,
  roleCheck,
  userIdValidation,
  validationMiddleware,
  lockUser
);

router.post(
  '/:id/unlock',
  authMiddleware,
  roleCheck,
  userIdValidation,
  validationMiddleware,
  unlockUser
);

export default router;
