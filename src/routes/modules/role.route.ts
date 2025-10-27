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
import { authMiddleware, checkPrivilege } from '../../middlewares/auth.middleware';
import { PRIVILEGES } from '../../constants/privileges';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
  assignPrivilegeValidation,
  createRoleValidation,
  roleIdValidation,
  updateRoleValidation
} from '../../middlewares/validations/role.validation';

const router = Router();

// Role CRUD
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.CREATE_ROLE]),
  createRoleValidation,
  validationMiddleware,
  createRole
);

router.get(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_ROLE]),
  getAllRoles
);

router.get(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_ROLE]),
  roleIdValidation,
  validationMiddleware,
  getRoleById
);

router.get(
  '/:id/with-privileges',
  authMiddleware,
  checkPrivilege([PRIVILEGES.VIEW_ROLE]),
  roleIdValidation,
  validationMiddleware,
  getRoleWithPrivileges
);

router.put(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.UPDATE_ROLE]),
  updateRoleValidation,
  validationMiddleware,
  updateRole
);

router.delete(
  '/:id',
  authMiddleware,
  checkPrivilege([PRIVILEGES.DELETE_ROLE]),
  roleIdValidation,
  validationMiddleware,
  deleteRole
);

// Privilege management
router.post(
  '/:id/privileges',
  authMiddleware,
  checkPrivilege([PRIVILEGES.UPDATE_ROLE]),
  assignPrivilegeValidation,
  validationMiddleware,
  assignPrivilege
);

router.delete(
  '/:id/privileges/:privilegeId',
  authMiddleware,
  checkPrivilege([PRIVILEGES.UPDATE_ROLE]),
  removePrivilege
);

export default router;
