/**
 * @swagger
 * /configurations:
 *   post:
 *     summary: Create a new configuration
 *     description: |
 *       Create a new system configuration. The authenticated user's ID from JWT is used
 *       as the creator (created_by) and updater (updated_by).
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
 *             config_key: "COBAS_DEFAULT_CONFIG"
 *             config_name: "Cobas Default Configuration"
*             config_value: 1
 *             category: "instrument"
 *             instrument_type: "Hematology Analyzer"
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
 *                 config_key: "COBAS_DEFAULT_CONFIG"
 *                 config_name: "Cobas Default Configuration"
*                 config_value: 1
 *                 category: "instrument"
 *                 instrument_type: "Hematology Analyzer"
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
 *       Get paginated list of configurations with optional filters by category and instrument_type.
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
 *         description: Filter by category
 *         example: "instrument"
 *       - in: query
 *         name: instrument_type
 *         schema:
 *           type: string
 *           enum:
 *             - "Hematology Analyzer"
 *             - "Chemistry Analyzer"
 *             - "Immunology Analyzer"
 *             - "Coagulation Analyzer"
 *             - "Blood Gas Analyzer"
 *         description: Filter by instrument type
 *         example: "Hematology Analyzer"
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
 *                   config_key: "COBAS_DEFAULT_CONFIG"
 *                   config_name: "Cobas Default Configuration"
*                   config_value: 1
 *                   category: "instrument"
 *                   instrument_type: "Hematology Analyzer"
 *                   created_at: "2024-01-01T00:00:00.000Z"
 *                   updated_at: "2024-01-01T00:00:00.000Z"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 totalPages: 1
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
 *                 config_key: "COBAS_DEFAULT_CONFIG"
 *                 config_name: "Cobas Default Configuration"
*                 config_value: 1
 *                 category: "instrument"
 *                 instrument_type: "Hematology Analyzer"
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
*             config_value: 2
 *             instrument_type: "Chemistry Analyzer"
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
 *                 config_key: "COBAS_DEFAULT_CONFIG"
 *                 config_name: "Cobas Default Configuration"
*                 config_value: 2
 *                 category: "instrument"
 *                 instrument_type: "Chemistry Analyzer"
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