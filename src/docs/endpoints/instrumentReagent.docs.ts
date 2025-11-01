/**
 * @swagger
 * /instrument-reagents:
 *   post:
 *     summary: Install a reagent on an instrument (SRS 3.6.2.1)
 *     description: |
 *       Install a reagent from inventory onto an instrument. All reagent information (name, lot_number, expiration_date, etc.)
 *       will be automatically populated from ReagentInventory and Reagent master data.
 *       
 *       **Validation:**
 *       - reagent_inventory_id must exist in inventory
 *       - Inventory status must not be "Returned"
 *       - quantity_in_stock must be >= quantity to install
 *       - Quantity must be greater than zero
 *       
 *       **Automatic Actions:**
 *       - Creates InstrumentReagent record with master data and inventory data populated
 *       - Updates inventory: quantity_in_stock -= quantity_installed
 *       - Logs event for audit trail (SRS 3.6.2.1)
 *       
 *       **Required Privilege:** ADD_INSTRUMENT_REAGENT
 *     tags: [Instrument Reagents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInstrumentReagentRequest'
 *           example:
 *             instrument_id: "507f1f77bcf86cd799439012"
 *             reagent_inventory_id: "507f1f77bcf86cd799439014"
 *             quantity: 1000
 *     responses:
 *       201:
 *         description: Reagent installed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 instrument_id: "507f1f77bcf86cd799439012"
 *                 reagent_inventory_id: "507f1f77bcf86cd799439014"
 *                 reagent_id: "507f1f77bcf86cd799439015"
 *                 reagent_name: "Diluent"
 *                 description: "Typically used in a 1:10 to 1:20 ratio with blood samples..."
 *                 usage_per_run_min: 1
 *                 usage_per_run_max: 2
 *                 usage_unit: "ml"
 *                 reagent_lot_number: "LOT-2024-DIL-001"
 *                 quantity: 1000
 *                 quantity_remaining: 1000
 *                 expiration_date: "2025-12-31T23:59:59.000Z"
 *                 installed_at: "2024-01-15T10:00:00.000Z"
 *                 installed_by: "507f1f77bcf86cd799439013"
 *                 status: "in_use"
 *                 created_at: "2024-01-15T10:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439013"
 *       400:
 *         description: Bad request - Validation error (reagent_inventory_id not found, insufficient stock, inventory status is "Returned", quantity must be > 0)
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
 *     summary: Get all instrument reagents
 *     description: Get a list of all reagent installations on instruments. **Required Privilege:** VIEW_INSTRUMENT_REAGENT
 *     tags: [Instrument Reagents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reagents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   instrument_id: "507f1f77bcf86cd799439012"
 *                   reagent_name: "Diluent"
 *                   reagent_lot_number: "LOT-2024-DIL-001"
 *                   quantity: 1000
 *                   quantity_remaining: 850
 *                   expiration_date: "2025-12-31T23:59:59.000Z"
 *                   vendor_name: "ABC Reagents Inc."
 *                   status: "in_use"
 *                 - _id: "507f1f77bcf86cd799439014"
 *                   instrument_id: "507f1f77bcf86cd799439012"
 *                   reagent_name: "Lysing"
 *                   reagent_lot_number: "LOT-2024-LYS-001"
 *                   quantity: 500
 *                   quantity_remaining: 400
 *                   expiration_date: "2025-12-31T23:59:59.000Z"
 *                   vendor_name: "ABC Reagents Inc."
 *                   status: "in_use"
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
 * /instrument-reagents/{id}:
 *   get:
 *     summary: Get instrument reagent by ID
 *     description: Get a specific reagent installation by its ID. **Required Privilege:** VIEW_INSTRUMENT_REAGENT
 *     tags: [Instrument Reagents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instrument Reagent ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Reagent retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 instrument_id: "507f1f77bcf86cd799439012"
 *                 reagent_name: "Diluent"
 *                 reagent_lot_number: "LOT-2024-DIL-001"
 *                 quantity: 1000
 *                 quantity_remaining: 850
 *                 expiration_date: "2025-12-31T23:59:59.000Z"
 *                 vendor_name: "ABC Reagents Inc."
 *                 vendor_id: "VND-001"
 *                 vendor_contact: "contact@abcreagents.com"
 *                 installed_at: "2024-01-15T10:00:00.000Z"
 *                 installed_by: "507f1f77bcf86cd799439013"
 *                 status: "in_use"
 *                 created_at: "2024-01-15T10:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439013"
 *       400:
 *         description: Bad request - Invalid ID format
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
 *         description: Reagent not found
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
 *     summary: Update instrument reagent (SRS 3.6.2.2)
 *     description: |
 *       Update reagent information including quantity, expiration date, vendor information, or status.
 *       
 *       **Note:** To update status only, use the status update endpoint instead.
 *       
 *       **Required Privilege:** ADD_INSTRUMENT_REAGENT
 *     tags: [Instrument Reagents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instrument Reagent ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInstrumentReagentRequest'
 *           example:
 *             quantity_remaining: 750
 *             expiration_date: "2025-12-31T23:59:59.000Z"
 *             vendor_contact: "newcontact@abcreagents.com"
 *     responses:
 *       200:
 *         description: Reagent updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 instrument_id: "507f1f77bcf86cd799439012"
 *                 reagent_name: "Diluent"
 *                 reagent_lot_number: "LOT-2024-DIL-001"
 *                 quantity: 1000
 *                 quantity_remaining: 750
 *                 expiration_date: "2025-12-31T23:59:59.000Z"
 *                 vendor_name: "ABC Reagents Inc."
 *                 vendor_contact: "newcontact@abcreagents.com"
 *                 status: "in_use"
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
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reagent not found
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
 *     summary: Delete instrument reagent (SRS 3.6.2.3)
 *     description: |
 *       Delete a reagent from an instrument. The action will be logged for audit trail.
 *       
 *       **Required Privilege:** ADD_INSTRUMENT_REAGENT
 *     tags: [Instrument Reagents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instrument Reagent ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Reagent deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data: null
 *       400:
 *         description: Bad request - Invalid ID format
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
 *         description: Reagent not found
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
 * /instrument-reagents/{id}/status:
 *   put:
 *     summary: Update reagent status (SRS 3.6.2.2)
 *     description: |
 *       Update the status of a reagent (in_use, not_in_use, expired).
 *       
 *       **Validation:**
 *       - Reagent must exist
 *       - Cannot change to the same status (e.g., in_use → in_use will error)
 *       
 *       **Required Privilege:** ADD_INSTRUMENT_REAGENT
 *     tags: [Instrument Reagents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instrument Reagent ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [in_use, not_in_use, expired]
 *                 example: not_in_use
 *           example:
 *             status: "not_in_use"
 *     responses:
 *       200:
 *         description: Reagent status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 instrument_id: "507f1f77bcf86cd799439012"
 *                 reagent_name: "Diluent"
 *                 reagent_lot_number: "LOT-2024-DIL-001"
 *                 quantity: 1000
 *                 quantity_remaining: 850
 *                 status: "not_in_use"
 *       400:
 *         description: Bad request - Invalid status or same status error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Reagent is already marked as \"not_in_use\""
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
 *         description: Reagent not found
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

