/**
 * @swagger
 * /flagging-configurations:
 *   post:
 *     summary: Create a new flagging configuration
 *     description: |
 *       Create a new flagging configuration for a parameter. Flagging configurations define reference ranges
 *       and flag types (critical, warning, info) that are applied when test results are outside the normal range.
 *       Configurations can be specific to gender and/or age group.
 *       
 *       **Required Privilege:** CREATE_CONFIGURATION
 *     tags: [FlaggingConfiguration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFlaggingConfigurationRequest'
 *           example:
 *             parameter_id: "507f1f77bcf86cd799439012"
 *             gender: "male"
 *             age_group: "adult"
 *             reference_range_min: 4.5
 *             reference_range_max: 11.0
 *             flag_type: "warning"
 *             is_active: true
 *             created_by: "507f1f77bcf86cd799439013"
 *             updated_by: "507f1f77bcf86cd799439013"
 *     responses:
 *       201:
 *         description: Flagging configuration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Created"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 parameter_id: "507f1f77bcf86cd799439012"
 *                 gender: "male"
 *                 age_group: "adult"
 *                 reference_range_min: 4.5
 *                 reference_range_max: 11.0
 *                 flag_type: "warning"
 *                 is_active: true
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439013"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *                 updated_by: "507f1f77bcf86cd799439013"
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Database save error"
 *               error: "reference_range_max must be greater than reference_range_min"
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (CREATE_CONFIGURATION privilege required)
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
 *     summary: Get all flagging configurations
 *     description: |
 *       Get paginated list of all flagging configurations with optional filters by parameter_id, gender, age_group, and is_active.
 *       
 *       **Required Privilege:** VIEW_CONFIGURATION
 *     tags: [FlaggingConfiguration]
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
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page (1-100)
 *       - in: query
 *         name: parameter_id
 *         schema:
 *           type: string
 *         description: Filter by parameter ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female]
 *         description: Filter by gender
 *         example: "male"
 *       - in: query
 *         name: age_group
 *         schema:
 *           type: string
 *         description: Filter by age group
 *         example: "adult"
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *         example: true
 *     responses:
 *       200:
 *         description: Flagging configurations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   parameter_id: "507f1f77bcf86cd799439012"
 *                   gender: "male"
 *                   age_group: "adult"
 *                   reference_range_min: 4.5
 *                   reference_range_max: 11.0
 *                   flag_type: "warning"
 *                   is_active: true
 *                   created_at: "2024-01-01T00:00:00.000Z"
 *                   updated_at: "2024-01-01T00:00:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439014"
 *                   parameter_id: "507f1f77bcf86cd799439012"
 *                   gender: "female"
 *                   age_group: "adult"
 *                   reference_range_min: 4.0
 *                   reference_range_max: 10.5
 *                   flag_type: "warning"
 *                   is_active: true
 *                   created_at: "2024-01-01T00:00:00.000Z"
 *                   updated_at: "2024-01-01T00:00:00.000Z"
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
 *         description: Forbidden - Insufficient permissions (VIEW_CONFIGURATION privilege required)
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
 * /flagging-configurations/{id}:
 *   get:
 *     summary: Get flagging configuration by ID
 *     description: |
 *       Get a specific flagging configuration by its ID.
 *       
 *       **Required Privilege:** VIEW_CONFIGURATION
 *     tags: [FlaggingConfiguration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flagging configuration ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Flagging configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 parameter_id: "507f1f77bcf86cd799439012"
 *                 gender: "male"
 *                 age_group: "adult"
 *                 reference_range_min: 4.5
 *                 reference_range_max: 11.0
 *                 flag_type: "warning"
 *                 is_active: true
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439013"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *                 updated_by: "507f1f77bcf86cd799439013"
 *       400:
 *         description: Bad request - Invalid flagging configuration ID format
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
 *         description: Forbidden - Insufficient permissions (VIEW_CONFIGURATION privilege required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Flagging configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Not Found"
 *               error: "Flagging configuration not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     summary: Update flagging configuration
 *     description: |
 *       Update an existing flagging configuration. Changes are logged to event log for audit trail.
 *       
 *       **Required Privilege:** MODIFY_CONFIGURATION
 *     tags: [FlaggingConfiguration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flagging configuration ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFlaggingConfigurationRequest'
 *           example:
 *             reference_range_min: 4.0
 *             reference_range_max: 11.5
 *             flag_type: "critical"
 *             is_active: true
 *             updated_by: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Flagging configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Updated"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 parameter_id: "507f1f77bcf86cd799439012"
 *                 gender: "male"
 *                 age_group: "adult"
 *                 reference_range_min: 4.0
 *                 reference_range_max: 11.5
 *                 flag_type: "critical"
 *                 is_active: true
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439013"
 *                 updated_at: "2024-01-01T12:00:00.000Z"
 *                 updated_by: "507f1f77bcf86cd799439013"
 *       400:
 *         description: Bad request - Validation error
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
 *         description: Forbidden - Insufficient permissions (MODIFY_CONFIGURATION privilege required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Flagging configuration not found
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
 *   delete:
 *     summary: Delete flagging configuration
 *     description: |
 *       Delete a flagging configuration by ID. Operation is logged to event log for audit trail.
 *       
 *       **Required Privilege:** DELETE_CONFIGURATION
 *     tags: [FlaggingConfiguration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flagging configuration ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Flagging configuration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Deleted"
 *       400:
 *         description: Bad request - Invalid flagging configuration ID format
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
 *         description: Forbidden - Insufficient permissions (DELETE_CONFIGURATION privilege required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Flagging configuration not found
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
 * /flagging-configurations/sync:
 *   post:
 *     summary: Sync flagging configurations (bulk create/update)
 *     description: |
 *       Sync multiple flagging configurations in a single operation. This endpoint performs bulk create/update
 *       operations. Configurations are matched by parameter_id, gender, and age_group. If a matching configuration
 *       exists, it will be updated; otherwise, a new one will be created.
 *       
 *       This is useful for importing flagging configurations from external systems or bulk updates.
 *       
 *       **Required Privilege:** MODIFY_CONFIGURATION
 *     tags: [FlaggingConfiguration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyncFlaggingConfigurationRequest'
 *           example:
 *             configurations:
 *               - parameter_id: "507f1f77bcf86cd799439012"
 *                 gender: "male"
 *                 age_group: "adult"
 *                 reference_range_min: 4.5
 *                 reference_range_max: 11.0
 *                 flag_type: "warning"
 *                 is_active: true
 *               - parameter_id: "507f1f77bcf86cd799439012"
 *                 gender: "female"
 *                 age_group: "adult"
 *                 reference_range_min: 4.0
 *                 reference_range_max: 10.5
 *                 flag_type: "warning"
 *                 is_active: true
 *               - parameter_id: "507f1f77bcf86cd799439013"
 *                 age_group: "child"
 *                 reference_range_min: 5.0
 *                 reference_range_max: 15.0
 *                 flag_type: "info"
 *                 is_active: true
 *     responses:
 *       200:
 *         description: Flagging configurations synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Flagging configurations synced successfully"
 *               data:
 *                 created: 2
 *                 updated: 1
 *                 failed: 0
 *                 errors: []
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Database save error"
 *               error: "Validation failed for one or more configurations"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (MODIFY_CONFIGURATION privilege required)
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

