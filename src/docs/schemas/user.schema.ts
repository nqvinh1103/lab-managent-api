/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         email:
 *           type: string
 *           format: email
 *           example: user@lab.com
 *         full_name:
 *           type: string
 *           example: John Doe
 *         identity_number:
 *           type: string
 *           example: 123456789012
 *         phone_number:
 *           type: string
 *           example: +84123456789
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *         address:
 *           type: string
 *           example: 123 Main Street
 *         date_of_birth:
 *           type: string
 *           format: date
 *           example: 1990-01-01
 *         is_locked:
 *           type: boolean
 *           example: false
 *         last_activity:
 *           type: string
 *           format: date-time
 *         role_ids:
 *           type: array
 *           items:
 *             type: string
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
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - email
 *         - password_hash
 *         - full_name
 *         - identity_number
 *         - phone_number
 *         - gender
 *         - date_of_birth
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@lab.com
 *         password_hash:
 *           type: string
 *           format: password
 *           minLength: 8
 *           pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)
 *           example: Password123
 *           description: Must contain uppercase, lowercase, and number
 *         full_name:
 *           type: string
 *           minLength: 2
 *           example: John Doe
 *         identity_number:
 *           type: string
 *           example: 123456789012
 *         phone_number:
 *           type: string
 *           example: +84123456789
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *         date_of_birth:
 *           type: string
 *           format: date
 *           example: 1990-01-01
 *         address:
 *           type: string
 *           example: 123 Main Street
 *         is_locked:
 *           type: boolean
 *           example: false
 *     
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password_hash:
 *           type: string
 *           format: password
 *         full_name:
 *           type: string
 *         phone_number:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         date_of_birth:
 *           type: string
 *           format: date
 *         address:
 *           type: string
 *         is_locked:
 *           type: boolean
 *     
 *     AssignRoleRequest:
 *       type: object
 *       required:
 *         - roleId
 *       properties:
 *         roleId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 */

