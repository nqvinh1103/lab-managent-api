import { Router } from 'express';
import {
  assignPrivilege,
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  getRoleWithPrivileges,
  removePrivilege,
  updateRole
} from '../../controllers/role.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  assignPrivilegeValidation,
  createRoleValidation,
  roleIdValidation,
  updateRoleValidation
} from '../../middlewares/validations/role.validation';

const router = Router();

// All routes require authentication and admin/lab_manager role
const roleCheckMiddleware = checkRole(['ADMIN', 'LAB_MANAGER']);

// Role CRUD
router.post(
  '/',
  authMiddleware,
  roleCheckMiddleware,
  createRoleValidation,
  validationMiddleware,
  createRole
);

router.get(
  '/',
  authMiddleware,
  roleCheckMiddleware,
  getAllRoles
);

router.get(
  '/:id',
  authMiddleware,
  roleCheckMiddleware,
  roleIdValidation,
  validationMiddleware,
  getRoleById
);

router.get(
  '/:id/with-privileges',
  authMiddleware,
  roleCheckMiddleware,
  roleIdValidation,
  validationMiddleware,
  getRoleWithPrivileges
);

router.put(
  '/:id',
  authMiddleware,
  roleCheckMiddleware,
  updateRoleValidation,
  validationMiddleware,
  updateRole
);

router.delete(
  '/:id',
  authMiddleware,
  roleCheckMiddleware,
  roleIdValidation,
  validationMiddleware,
  deleteRole
);

// Privilege management
router.post(
  '/:id/privileges',
  authMiddleware,
  roleCheckMiddleware,
  assignPrivilegeValidation,
  validationMiddleware,
  assignPrivilege
);

router.delete(
  '/:id/privileges/:privilegeId',
  authMiddleware,
  roleCheckMiddleware,
  removePrivilege
);

export default router;
