/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         role_name:
 *           type: string
 *           example: Lab Manager
 *         role_code:
 *           type: string
 *           example: LAB_MANAGER
 *         role_description:
 *           type: string
 *           example: Lab manager role with full access to lab operations
 *         privilege_ids:
 *           type: array
 *           items:
 *             type: string
 *           example: [507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012]
 *         created_at:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: string
 *         updated_at:
 *           type: string
 *           format: date-time
 *         updated_by:
 *           type: string
 *     
 *     CreateRoleRequest:
 *       type: object
 *       required:
 *         - role_name
 *         - role_code
 *         - privilege_ids
 *       properties:
 *         role_name:
 *           type: string
 *           example: Lab Technician
 *           description: Role display name
 *         role_code:
 *           type: string
 *           example: LAB_TECH
 *           description: Unique role code (uppercase with underscores)
 *         role_description:
 *           type: string
 *           example: Lab technician role with basic access to instruments and samples
 *         privilege_ids:
 *           type: array
 *           items:
 *             type: string
 *           example: [507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012]
 *           description: Array of privilege IDs
 *     
 *     UpdateRoleRequest:
 *       type: object
 *       properties:
 *         role_name:
 *           type: string
 *           description: Role display name
 *         role_code:
 *           type: string
 *           description: Role code (uppercase with underscores)
 *         role_description:
 *           type: string
 *         privilege_ids:
 *           type: array
 *           items:
 *             type: string
 *     
 *     AssignPrivilegeRequest:
 *       type: object
 *       required:
 *         - privilegeId
 *       properties:
 *         privilegeId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *     
 *     Privilege:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         privilege_code:
 *           type: string
 *           example: USER_READ
 *         privilege_name:
 *           type: string
 *           example: Read Users
 *         category:
 *           type: string
 *           example: User Management
 *         created_at:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: string
 *         updated_at:
 *           type: string
 *           format: date-time
 *         updated_by:
 *           type: string
 */

