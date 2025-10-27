/**
 * @swagger
 * /privileges:
 *   get:
 *     summary: Get all privileges
 *     description: Get complete list of all privileges without pagination. **Required Privilege:** VIEW_ROLE
 *     tags: [Privileges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Privileges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   privilege_code: "USER_READ"
 *                   privilege_name: "Read Users"
 *                   category: "User Management"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   privilege_code: "USER_WRITE"
 *                   privilege_name: "Write Users"
 *                   category: "User Management"
 *                 - _id: "507f1f77bcf86cd799439013"
 *                   privilege_code: "ROLE_READ"
 *                   privilege_name: "Read Roles"
 *                   category: "Role Management"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /privileges/{id}:
 *   get:
 *     summary: Get privilege by ID
 *     description: Get a specific privilege by ID. **Required Privilege:** VIEW_ROLE
 *     tags: [Privileges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Privilege ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Privilege retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 privilege_code: "USER_READ"
 *                 privilege_name: "Read Users"
 *                 category: "User Management"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439011"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *                 updated_by: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Bad request - Invalid privilege ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Privilege not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

