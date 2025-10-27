import { Router } from "express";
import { getAllPrivileges, getPrivilegeById } from "~/controllers/privilege.controller";
import { authMiddleware, checkPrivilege } from "~/middlewares/auth.middleware";
import { PRIVILEGES } from "~/constants/privileges";

const router = Router();

// Privilege read only - cần VIEW_ROLE để gán privilege cho role
router.get('/', authMiddleware, checkPrivilege([PRIVILEGES.VIEW_ROLE]), getAllPrivileges);
router.get('/:id', authMiddleware, checkPrivilege([PRIVILEGES.VIEW_ROLE]), getPrivilegeById);

export default router;