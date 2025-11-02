/**
 * @swagger
 * /test-results:
 *   post:
 *     tags:
 *       - TestResults
 *     summary: Create test results for a test order using barcode
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [barcode, results]
 *             properties:
 *               barcode:
 *                 type: string
 *                 example: BC-ABC123XYZ
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - parameter_id
 *                     - result_value
 *                     - unit
 *                     - reference_range_text
 *                     - is_flagged
 *                     - reagent_lot_number
 *                     - measured_at
 *                   properties:
 *                     parameter_id:
 *                       type: string
 *                       example: '507f1f77bcf86cd799439016'
 *                     result_value:
 *                       type: number
 *                       example: 120.5
 *                     unit:
 *                       type: string
 *                       example: mg/dL
 *                     reference_range_text:
 *                       type: string
 *                       example: '70-100 mg/dL'
 *                     is_flagged:
 *                       type: boolean
 *                       example: true
 *                     reagent_lot_number:
 *                       type: string
 *                       example: 'LOT-2024-001'
 *                     measured_at:
 *                       type: string
 *                       format: date-time
 *                       example: '2024-01-05T10:30:00.000Z'
 *     responses:
 *       201:
 *         description: Test results added successfully
 *       400:
 *         description: Bad Request (missing barcode/results)
 *       404:
 *         description: Test order not found
 *
 *   get:
 *     tags:
 *       - TestResults
 *     summary: Get all test results
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test results
 *
 * /test-results/{id}:
 *   get:
 *     tags:
 *       - TestResults
 *     summary: Get a test result by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test result found
 *       404:
 *         description: Test result not found
 *
 *   put:
 *     tags:
 *       - TestResults
 *     summary: Update a test result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTestResult'
 *     responses:
 *       200:
 *         description: Test result updated successfully
 *
 *   delete:
 *     tags:
 *       - TestResults
 *     summary: Delete a test result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test result deleted successfully
 */