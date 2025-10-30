/**
 * @swagger
 * components:
 *   schemas:
 *     EventLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         action_type:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *           example: CREATE
 *         entity_type:
 *           type: string
 *           example: User
 *         entity_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439012
 *         performed_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 *         description:
 *           type: string
 *           example: Created new user
 *         metadata:
 *           type: object
 *           example: { "role": "admin" }
 *         created_at:
 *           type: string
 *           format: date-time
 */

