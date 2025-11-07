/**
 * @swagger
 * /instruments:
 *   post:
 *     summary: Create a new instrument
 *     description: Create a new instrument record. **Required Privilege:** ADD_INSTRUMENT
 *     tags: [Instruments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInstrumentRequest'
 *           examples:
 *             basic:
 *               summary: Basic instrument creation
 *               value:
 *                 instrument_name: "Hematology Analyzer X1"
 *                 instrument_type: "Hematology Analyzer"
 *                 serial_number: "SN-2024-001"
 *                 mode: "ready"
 *                 last_qc_check: "2024-01-15T10:00:00.000Z"
 *             withReagents:
 *               summary: Create instrument with reagents (Use Case 2)
 *               description: Install reagents during instrument creation
 *               value:
 *                 instrument_name: "Hematology Analyzer X1"
 *                 instrument_type: "Hematology Analyzer"
 *                 serial_number: "SN-2024-001"
 *                 mode: "ready"
 *                 last_qc_check: "2024-01-15T10:00:00.000Z"
 *                 reagents:
 *                   - reagent_inventory_id: "507f1f77bcf86cd799439014"
 *                     quantity: 1000
 *                   - reagent_inventory_id: "507f1f77bcf86cd799439015"
 *                     quantity: 500
 *                   - reagent_inventory_id: "507f1f77bcf86cd799439016"
 *                     quantity: 300
 *     responses:
 *       201:
 *         description: Instrument created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Created"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 instrument_name: "Hematology Analyzer X1"
 *                 instrument_type: "Hematology Analyzer"
 *                 serial_number: "SN-2024-001"
 *                 mode: "ready"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439011"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *                 updated_by: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Bad request - Validation error or duplicate serial number
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
 *     summary: Get all instruments
 *     description: Get paginated list of all instruments with optional search. **Required Privilege:** VIEW_INSTRUMENT
 *     tags: [Instruments]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for instrument_name, instrument_type, or serial_number
 *     responses:
 *       200:
 *         description: Instruments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   instrument_name: "Hematology Analyzer X1"
 *                   instrument_type: "Hematology Analyzer"
 *                   serial_number: "SN-2024-001"
 *                   mode: "ready"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   instrument_name: "Chemistry Analyzer Y2"
 *                   instrument_type: "Chemistry Analyzer"
 *                   serial_number: "SN-2024-002"
 *                   mode: "ready"
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
 * /instruments/{id}:
 *   get:
 *     summary: Get instrument by ID
 *     description: Get a specific instrument by its ID. **Required Privilege:** VIEW_INSTRUMENT
 *     tags: [Instruments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instrument ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Instrument retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 instrument_name: "Hematology Analyzer X1"
 *                 instrument_type: "Hematology Analyzer"
 *                 serial_number: "SN-2024-001"
 *                 mode: "ready"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439011"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *                 updated_by: "507f1f77bcf86cd799439011"
 *                 reagents:
 *                   - _id: "507f1f77bcf86cd799439020"
 *                     instrument_id: "507f1f77bcf86cd799439011"
 *                     reagent_inventory_id: "507f1f77bcf86cd799439021"
 *                     reagent_id: "507f1f77bcf86cd799439022"
 *                     reagent_name: "Diluent"
 *                     description: "Diluent reagent for hematology analysis"
 *                     usage_per_run_min: 10
 *                     usage_per_run_max: 15
 *                     usage_unit: "ml"
 *                     reagent_lot_number: "LOT-2024-001"
 *                     expiration_date: "2025-12-31T00:00:00.000Z"
 *                     quantity: 1000
 *                     quantity_remaining: 850
 *                     installed_at: "2024-01-15T10:00:00.000Z"
 *                     installed_by: "507f1f77bcf86cd799439011"
 *                     status: "in_use"
 *                     created_at: "2024-01-15T10:00:00.000Z"
 *                     created_by: "507f1f77bcf86cd799439011"
 *                 test_orders:
 *                   - _id: "507f1f77bcf86cd799439030"
 *                     order_number: "ORD-1704067200000"
 *                     patient_id: "507f1f77bcf86cd799439031"
 *                     instrument_id: "507f1f77bcf86cd799439011"
 *                     barcode: "BC-ABC123XYZ"
 *                     status: "completed"
 *                     test_results: []
 *                     comments: []
 *                     run_by: "507f1f77bcf86cd799439011"
 *                     run_at: "2024-01-20T14:30:00.000Z"
 *                     created_at: "2024-01-20T14:00:00.000Z"
 *                     created_by: "507f1f77bcf86cd799439011"
 *                     updated_at: "2024-01-20T14:30:00.000Z"
 *                     updated_by: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Bad request - Invalid instrument ID
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
 *         description: Instrument not found
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
 *     summary: Update instrument
 *     description: Update instrument information. **Required Privilege:** ADD_INSTRUMENT
 *     tags: [Instruments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instrument ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInstrumentRequest'
 *           example:
 *             instrument_name: "Hematology Analyzer X1 Updated"
 *             mode: "maintenance"
 *     responses:
 *       200:
 *         description: Instrument updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Updated"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 instrument_name: "Hematology Analyzer X1 Updated"
 *                 instrument_type: "Hematology Analyzer"
 *                 serial_number: "SN-2024-001"
 *                 mode: "maintenance"
 *       400:
 *         description: Bad request - Validation error or duplicate serial number
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
 *         description: Instrument not found
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
 *     summary: Delete instrument
 *     description: Delete an instrument by ID. **Required Privilege:** ADD_INSTRUMENT
 *     tags: [Instruments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instrument ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Instrument deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Deleted"
 *               data:
 *                 deletedCount: 1
 *       400:
 *         description: Bad request - Invalid instrument ID
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
 *         description: Instrument not found
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

