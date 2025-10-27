import { Router } from "express";
import { getAllPrivileges, getPrivilegeById } from "~/controllers/privilege.controller";
import { authMiddleware } from "~/middlewares/auth.middleware";
import { checkRole } from "~/middlewares/auth.middleware";

const router = Router();
// Check if the user is ADMIN or LAB_MANAGER
const roleCheck = checkRole(['ADMIN', 'LAB_MANAGER']);

// Privilege read only for ADMIN and LAB_MANAGER 
router.get('/', authMiddleware, roleCheck, getAllPrivileges);
router.get('/:id', authMiddleware, roleCheck, getPrivilegeById);

export default router;