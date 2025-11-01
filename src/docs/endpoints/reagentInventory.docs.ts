/**
 * @swagger
 * /reagent-inventory:
 *   post:
 *     summary: Create reagent inventory (Warehouse Management)
 *     description: |
 *       Create a new reagent inventory record when receiving reagent from vendor. This represents warehouse management
 *       (SRS 3.3.2.1 Vendor Supply History).
 *       
 *       **Flow:**
 *       1. Select reagent from Reagent master list (SRS 2.5)
 *       2. Enter vendor supply info (PO, order_date, receipt_date, vendor_name, etc.)
 *       3. Enter batch info (lot_number, expiration_date, quantity_received)
 *       
 *       **Status Logic:**
 *       - "Received": Full shipment received (default if quantity_received = quantity_ordered)
 *       - "Partial Shipment": quantity_received < quantity_ordered
 *       - "Returned": Set manually, requires returned_reason, quantity_in_stock = 0
 *       
 *       **Required Privilege:** ADD_REAGENTS
 *     tags: [Reagent Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReagentInventoryRequest'
 *           example:
 *             reagent_id: "507f1f77bcf86cd799439012"
 *             catalog_number: "CAT-001"
 *             manufacturer: "Manufacturer Inc."
 *             cas_number: "CAS-12345-67-8"
 *             vendor_name: "ABC Reagents Inc."
 *             vendor_id: "VND-001"
 *             vendor_contact: "contact@abcreagents.com"
 *             po_number: "PO-2024-001"
 *             order_date: "2024-01-01T00:00:00.000Z"
 *             receipt_date: "2024-01-15T10:00:00.000Z"
 *             quantity_ordered: 1000
 *             quantity_received: 1000
 *             unit_of_measure: "ml"
 *             lot_number: "LOT-2024-DIL-001"
 *             expiration_date: "2025-12-31T23:59:59.000Z"
 *             initial_storage_location: "Warehouse A, Shelf 3"
 *             status: "Received"
 *     responses:
 *       201:
 *         description: Reagent inventory created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Created"
 *               data:
 *                 _id: "507f1f77bcf86cd799439014"
 *                 reagent_id: "507f1f77bcf86cd799439012"
 *                 reagent_name: "Diluent"
 *                 vendor_name: "ABC Reagents Inc."
 *                 quantity_received: 1000
 *                 quantity_in_stock: 1000
 *                 status: "Received"
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Get all reagent inventory with filters
 *     description: Get list of reagent inventory with optional filters (reagent_name, vendor_name, lot_number, status, date range)
 *     tags: [Reagent Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: reagent_name
 *         schema:
 *           type: string
 *         description: Filter by reagent name (from master)
 *       - in: query
 *         name: vendor_name
 *         schema:
 *           type: string
 *         description: Filter by vendor name
 *       - in: query
 *         name: lot_number
 *         schema:
 *           type: string
 *         description: Filter by lot number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Received, Partial Shipment, Returned]
 *         description: Filter by status
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by receipt date start
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by receipt date end
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /reagent-inventory/{id}:
 *   get:
 *     summary: Get reagent inventory by ID
 *     description: Get a specific reagent inventory record by its ID
 *     tags: [Reagent Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory ID
 *         example: "507f1f77bcf86cd799439014"
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 *       400:
 *         description: Bad request - Invalid ID format
 *       404:
 *         description: Inventory not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update reagent inventory
 *     description: Update reagent inventory information
 *     tags: [Reagent Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReagentInventoryRequest'
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Inventory not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /reagent-inventory/{id}/stock:
 *   put:
 *     summary: Update reagent inventory stock
 *     description: Update the quantity_in_stock in inventory (e.g., when installing reagent to instrument)
 *     tags: [Reagent Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReagentInventoryStockRequest'
 *           example:
 *             quantity_in_stock: 850
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       400:
 *         description: Bad request - Validation error (stock cannot exceed quantity_received)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Inventory not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /reagent-inventory/{id}/status:
 *   put:
 *     summary: Update reagent inventory status
 *     description: |
 *       Update the status of reagent inventory, especially to mark as "Returned".
 *       
 *       **Status "Returned":**
 *       - Requires returned_reason
 *       - Sets quantity_in_stock to 0
 *       - Prevents further installation
 *     tags: [Reagent Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReagentInventoryStatusRequest'
 *           example:
 *             status: "Returned"
 *             returned_reason: "Defective items received"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Bad request - Validation error (returned_reason required if status is "Returned")
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Inventory not found
 *       500:
 *         description: Internal server error
 */

