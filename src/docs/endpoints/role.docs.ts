/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     description: Create a new role. **Required Privilege:** CREATE_ROLE
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleRequest'
 *           example:
 *             role_name: "Lab Technician"
 *             role_code: "LAB_TECH"
 *             role_description: "Lab technician role with basic access to instruments and samples"
 *             privilege_ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Created"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 role_name: "Lab Technician"
 *                 role_code: "LAB_TECH"
 *                 role_description: "Lab technician role with basic access to instruments and samples"
 *                 privilege_ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
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
 *
 *   get:
 *     summary: Get all roles
 *     description: Get paginated list of all roles. **Required Privilege:** VIEW_ROLE
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   role_name: "Lab Manager"
 *                   role_code: "LAB_MANAGER"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   role_name: "Lab Technician"
 *                   role_code: "LAB_TECH"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 50
 *                 totalPages: 5
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
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     description: Get a specific role by their ID. **Required Privilege:** VIEW_ROLE
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - Invalid role ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update role
 *     description: Update role information. **Required Privilege:** UPDATE_ROLE
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *           example:
 *             role_name: "Senior Lab Technician"
 *             role_description: "Updated description"
 *             privilege_ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete role
 *     description: Delete a role by ID. **Required Privilege:** DELETE_ROLE
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - Invalid role ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /roles/{id}/with-privileges:
 *   get:
 *     summary: Get role with privileges details
 *     description: Get a role with its privileges populated. **Required Privilege:** VIEW_ROLE
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Role retrieved successfully with privileges
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - Invalid role ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /roles/{id}/privileges:
 *   post:
 *     summary: Assign privilege to role
 *     description: Assign a privilege to a role. **Required Privilege:** UPDATE_ROLE
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignPrivilegeRequest'
 *           example:
 *             privilegeId: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Privilege assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role or privilege not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /roles/{id}/privileges/{privilegeId}:
 *   delete:
 *     summary: Remove privilege from role
 *     description: Remove a privilege from a role. **Required Privilege:** UPDATE_ROLE
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: privilegeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Privilege ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Privilege removed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role or privilege not found
 *       500:
 *         description: Internal server error
 */
