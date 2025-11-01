/**
 * @swagger
 * /test-orders:
 *   post:
 *     summary: Create a new test order
 *     description: |
 *       Create a new test order for an existing patient. The patient must exist in the system.
 *       System will automatically generate order number and barcode.
 *       **Required Privilege:** CREATE_TEST_ORDER
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTestOrderRequest'
 *           example:
 *             patient_email: "nguyen.van.a@email.com"
 *             instrument_name: "Analyzer A"
 *     responses:
 *       201:
 *         description: Test order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TestOrder'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 order_number: "ORD-1704067200000"
 *                 patient_id: "507f1f77bcf86cd799439012"
 *                 instrument_id: "507f1f77bcf86cd799439013"
 *                 barcode: "BC-ABC123XYZ"
 *                 status: "pending"
 *                 test_results: []
 *                 comments: []
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 created_by: "507f1f77bcf86cd799439015"
 *       400:
 *         description: Bad request - Validation error or patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   error: "Validation failed"
 *                   details:
 *                     - field: "patient_email"
 *                       message: "Patient email is required"
 *               patient_not_found:
 *                 summary: Patient not found
 *                 value:
 *                   success: false
 *                   error: "Patient with email \"example@email.com\" not found"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (requires CREATE_TEST_ORDER privilege)
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
 *     summary: List all test orders
 *     description: |
 *       Get list of all test orders sorted by most recent date first.
 *       Includes patient information (name, age, gender, phone) and user names (created by, run by).
 *       Returns "No Data" message if no orders exist.
 *       **Required Privilege:** None (authentication required)
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestOrder'
 *                 message:
 *                   type: string
 *                   example: No Data
 *                   description: Only present when data array is empty
 *             examples:
 *               with_data:
 *                 summary: With data
 *                 value:
 *                   success: true
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       order_number: "ORD-1704067200000"
 *                       patient_email: "nguyen.van.a@email.com"
 *                       patient_name: "Nguyen Van A"
 *                       patient_age: 34
 *                       patient_gender: "male"
 *                       patient_phone: "+84912345678"
 *                       status: "completed"
 *                       created_by_name: "Admin User"
 *                       created_at: "2024-01-01T00:00:00.000Z"
 *                       run_by_name: "Dr. Nguyen Van B"
 *                       run_at: "2024-01-05T10:30:00.000Z"
 *               no_data:
 *                 summary: No data
 *                 value:
 *                   success: true
 *                   data: []
 *                   message: "No Data"
 *       401:
 *         description: Unauthorized - User not authenticated
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
 * /test-orders/{id}:
 *   get:
 *     summary: Get test order by ID
 *     description: |
 *       Get detailed information about a specific test order.
 *       Includes full patient information, test results (if status is "completed"), and all comments.
 *       **Required Privilege:** None (authentication required)
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID (MongoDB ObjectId)
 *         example: "671f8a36e9e9f84ef4a12345"
 *     responses:
 *       200:
 *         description: Test order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TestOrder'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 order_number: "ORD-1704067200000"
 *                 patient_email: "nguyen.van.a@email.com"
 *                 patient_name: "Nguyen Van A"
 *                 patient_age: 34
 *                 patient_gender: "male"
 *                 patient_phone: "+84912345678"
 *                 status: "completed"
 *                 test_results:
 *                   - parameter_id: "507f1f77bcf86cd799439016"
 *                     result_value: 120.5
 *                     unit: "mg/dL"
 *                     reference_range_text: "70-100 mg/dL"
 *                     is_flagged: true
 *                 comments:
 *                   - comment_text: "Sample hemolyzed, retest recommended"
 *                     created_by: "507f1f77bcf86cd799439015"
 *                     created_at: "2024-01-05T10:30:00.000Z"
 *                 created_by_name: "Admin User"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 run_by_name: "Dr. Nguyen Van B"
 *                 run_at: "2024-01-05T10:30:00.000Z"
 *       400:
 *         description: Bad request - Invalid test order ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation error"
 *               error: "Validation failed"
 *               details:
 *                 - field: "id"
 *                   message: "Invalid test order ID format"
 *       404:
 *         description: Test order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Test order not found or does not contain any data to display"
 *       401:
 *         description: Unauthorized - User not authenticated
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
 *     summary: Update test order
 *     description: |
 *       Update test order information. Can also update patient information (name, DOB, gender, phone, address).
 *       When patient fields are provided, both test order and patient records are updated.
 *       System logs all changes for audit trail.
 *       **Required Privilege:** None (authentication required)
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTestOrderRequest'
 *           examples:
 *             update_status:
 *               summary: Update order status only
 *               value:
 *                 status: "running"
 *             update_patient_info:
 *               summary: Update patient information through test order
 *               value:
 *                 full_name: "Nguyen Van A Updated"
 *                 phone_number: "+84999999999"
 *                 address: "456 Le Loi, District 1, Ho Chi Minh City"
 *             update_both:
 *               summary: Update both order and patient
 *               value:
 *                 status: "completed"
 *                 full_name: "Nguyen Van A Updated"
 *                 phone_number: "+84999999999"
 *     responses:
 *       200:
 *         description: Test order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TestOrder'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 order_number: "ORD-1704067200000"
 *                 status: "running"
 *                 updated_at: "2024-01-05T10:30:00.000Z"
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation error"
 *               error: "Validation failed"
 *               details:
 *                 - field: "status"
 *                   message: "Invalid status value"
 *       404:
 *         description: Test order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Order not found or update failed"
 *       401:
 *         description: Unauthorized - User not authenticated
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
 *     summary: Delete test order
 *     description: |
 *       Delete a test order. System maintains audit trail with user who performed deletion.
 *       **Required Privilege:** None (authentication required)
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Test order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Deleted
 *             example:
 *               success: true
 *               message: "Deleted"
 *       400:
 *         description: Bad request - Invalid test order ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Test order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Order not found or delete failed"
 *       401:
 *         description: Unauthorized - User not authenticated
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
 * /test-orders/{id}/comments:
 *   post:
 *     summary: Add comment to test order
 *     description: |
 *       Add a comment to a test order. Comments are visible in order detail view.
 *       **Required Privilege:** ADD_COMMENT
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCommentRequest'
 *           example:
 *             comment_text: "Sample hemolyzed, retest recommended"
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Comment added
 *                 data:
 *                   $ref: '#/components/schemas/TestOrder'
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Test order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions (requires ADD_COMMENT privilege)
 *
 * /test-orders/{id}/comments/{commentIndex}:
 *   put:
 *     summary: Update comment in test order
 *     description: Update a specific comment in a test order. **Required Privilege:** MODIFY_COMMENT
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID
 *       - in: path
 *         name: commentIndex
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Comment index in array
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCommentRequest'
 *           example:
 *             comment_text: "Updated: Sample reprocessed successfully"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Test order not found
 *
 *   delete:
 *     summary: Delete comment from test order
 *     description: Soft delete a comment (set deleted_at field). **Required Privilege:** DELETE_COMMENT
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID
 *       - in: path
 *         name: commentIndex
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Comment index in array
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Test order not found
 *
 * /test-orders/{id}/results:
 *   put:
 *     summary: Add test results to order
 *     description: |
 *       Add test results with automatic flagging based on parameter normal ranges.
 *       System automatically flags results outside normal range.
 *       **Required Privilege:** EXECUTE_BLOOD_TESTING
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTestResultsRequest'
 *           example:
 *             results:
 *               - parameter_id: "507f1f77bcf86cd799439016"
 *                 result_value: 120.5
 *                 unit: "mg/dL"
 *     responses:
 *       200:
 *         description: Results added successfully
 *       400:
 *         description: Bad request - Validation error
 *       404:
 *         description: Test order not found
 *
 * /test-orders/{id}/complete:
 *   post:
 *     summary: Complete test order
 *     description: |
 *       Mark order as completed and track reagent usage.
 *       Updates order status to "completed", sets run_by and run_at fields.
 *       **Required Privilege:** EXECUTE_BLOOD_TESTING
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteTestOrderRequest'
 *           example:
 *             reagent_usage:
 *               - reagent_lot_number: "LOT-2024-001"
 *                 quantity_used: 2.5
 *     responses:
 *       200:
 *         description: Order completed successfully
 *       404:
 *         description: Test order not found
 *
 * /test-orders/process-sample:
 *   post:
 *     summary: Process blood sample by barcode
 *     description: |
 *       Create or find test order by barcode. If barcode exists, returns existing order.
 *       If not, auto-creates new order with pending status.
 *       Checks instrument mode = 'ready' and validates reagent levels.
 *       **Required Privilege:** CREATE_TEST_ORDER
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessSampleRequest'
 *           example:
 *             barcode: "BC-SAMPLE001"
 *             instrument_id: "64f9e2c2b1a5d4f6e8c11111"
 *     responses:
 *       200:
 *         description: Sample processed successfully
 *       400:
 *         description: Validation error (instrument not ready, insufficient reagents)
 *
 * /test-orders/export:
 *   get:
 *     summary: Export test orders to Excel
 *     description: Export test orders with filtering (month, status, patient_name). **Required Privilege:** REVIEW_TEST_ORDER
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: "2025-10"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: patient_name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Excel file downloaded
 *
 * /test-orders/{id}/print:
 *   get:
 *     summary: Print test order results as PDF
 *     description: |
 *       Generate PDF report for completed test order.
 *       Order must be completed (status = "completed") to print.
 *       **Required Privilege:** REVIEW_TEST_ORDER
 *     tags: [TestOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *       400:
 *         description: Order not completed or not found
 */

