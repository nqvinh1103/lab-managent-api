/**
 * @swagger
 * /configurations:
 *   post:
 *     summary: Create a new configuration
 *     description: |
 *       Create a new configuration with unique config_key. Configurations are used to store system settings
 *       that can be synced to other services. Auto-syncs to other services on creation.
 *       
 *       **Required Privilege:** CREATE_CONFIGURATION
 *     tags: [Configurations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConfigurationRequest'
 *           example:
 *             config_key: "instrument.sysmex_xn1000.mode"
 *             config_name: "Sysmex XN-1000 Mode Configuration"
 *             config_value:
 *               mode: "CBC"
 *               auto_flag: true
 *               timeout: 300
 *             category: "instrument"
 *             instrument_type: "Sysmex XN-1000"
 *             created_by: "507f1f77bcf86cd799439013"
 *             updated_by: "507f1f77bcf86cd799439013"
 *     responses:
 *       201:
 *         description: Configuration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Created"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 config_key: "instrument.sysmex_xn1000.mode"
 *                 config_name: "Sysmex XN-1000 Mode Configuration"
 *                 config_value:
 *                   mode: "CBC"
 *                   auto_flag: true
 *                   timeout: 300
 *                 category: "instrument"
 *                 instrument_type: "Sysmex XN-1000"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439013"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *                 updated_by: "507f1f77bcf86cd799439013"
 *       400:
 *         description: Bad request - Validation error or duplicate config_key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Database save error"
 *               error: "Configuration with this config_key already exists"
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
 *     summary: Get all configurations
 *     description: |
 *       Get paginated list of all configurations with optional filters by category and instrument_type.
 *       
 *       **Required Privilege:** VIEW_CONFIGURATION
 *     tags: [Configurations]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by configuration category
 *         example: "instrument"
 *       - in: query
 *         name: instrument_type
 *         schema:
 *           type: string
 *         description: Filter by instrument type
 *         example: "Sysmex XN-1000"
 *     responses:
 *       200:
 *         description: Configurations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   config_key: "instrument.sysmex_xn1000.mode"
 *                   config_name: "Sysmex XN-1000 Mode Configuration"
 *                   config_value:
 *                     mode: "CBC"
 *                     auto_flag: true
 *                     timeout: 300
 *                   category: "instrument"
 *                   instrument_type: "Sysmex XN-1000"
 *                   created_at: "2024-01-01T00:00:00.000Z"
 *                   updated_at: "2024-01-01T00:00:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   config_key: "system.email.smtp"
 *                   config_name: "SMTP Email Configuration"
 *                   config_value:
 *                     host: "smtp.example.com"
 *                     port: 587
 *                     secure: false
 *                   category: "system"
 *                   created_at: "2024-01-01T00:00:00.000Z"
 *                   updated_at: "2024-01-01T00:00:00.000Z"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 25
 *                 totalPages: 3
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
 * /configurations/{id}:
 *   get:
 *     summary: Get configuration by ID
 *     description: |
 *       Get a specific configuration by its ID.
 *       
 *       **Required Privilege:** VIEW_CONFIGURATION
 *     tags: [Configurations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 config_key: "instrument.sysmex_xn1000.mode"
 *                 config_name: "Sysmex XN-1000 Mode Configuration"
 *                 config_value:
 *                   mode: "CBC"
 *                   auto_flag: true
 *                   timeout: 300
 *                 category: "instrument"
 *                 instrument_type: "Sysmex XN-1000"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439013"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *                 updated_by: "507f1f77bcf86cd799439013"
 *       400:
 *         description: Bad request - Invalid configuration ID format
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
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Not Found"
 *               error: "Configuration not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     summary: Update configuration
 *     description: |
 *       Update an existing configuration. Changes are logged to event log for audit trail.
 *       Auto-syncs to other services on update.
 *       
 *       **Required Privilege:** MODIFY_CONFIGURATION
 *     tags: [Configurations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConfigurationRequest'
 *           example:
 *             config_name: "Sysmex XN-1000 Mode Configuration (Updated)"
 *             config_value:
 *               mode: "CBC+DIFF"
 *               auto_flag: true
 *               timeout: 300
 *             updated_by: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Updated"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 config_key: "instrument.sysmex_xn1000.mode"
 *                 config_name: "Sysmex XN-1000 Mode Configuration (Updated)"
 *                 config_value:
 *                   mode: "CBC+DIFF"
 *                   auto_flag: true
 *                   timeout: 300
 *                 category: "instrument"
 *                 instrument_type: "Sysmex XN-1000"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439013"
 *                 updated_at: "2024-01-01T12:00:00.000Z"
 *                 updated_by: "507f1f77bcf86cd799439013"
 *       400:
 *         description: Bad request - Validation error or duplicate config_key
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
 *         description: Configuration not found
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
 *     summary: Delete configuration
 *     description: |
 *       Delete a configuration by ID. Operation is logged to event log for audit trail.
 *       
 *       **Required Privilege:** DELETE_CONFIGURATION
 *     tags: [Configurations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Configuration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Deleted"
 *       400:
 *         description: Bad request - Invalid configuration ID format
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
 *         description: Configuration not found
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

