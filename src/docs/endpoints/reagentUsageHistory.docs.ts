/**
 * @swagger
 * /reagent-usage-history:
 *   get:
 *     summary: Get all reagent usage history with filters (SRS 3.3.2.2)
 *     description: |
 *       View reagent usage history with optional filters. **Note:** History is immutable (append-only).
 *     tags: [Reagent Usage History]
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
 *         name: reagent_lot_number
 *         schema:
 *           type: string
 *         description: Filter by reagent lot number
 *       - in: query
 *         name: instrument_id
 *         schema:
 *           type: string
 *         description: Filter by instrument ID
 *       - in: query
 *         name: test_order_id
 *         schema:
 *           type: string
 *         description: Filter by test order ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by usage start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by usage end date
 *     responses:
 *       200:
 *         description: Usage history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * /reagent-usage-history/{id}:
 *   get:
 *     summary: Get reagent usage history by ID (SRS 3.3.2.2)
 *     description: |
 *       Get a specific reagent usage history record. **Note:** History is immutable (read-only).
 *       
 *       **Note:** PUT and DELETE endpoints have been removed per SRS 3.3.2.2.
 *       ReagentUsageHistory is immutable (append-only) and cannot be modified or deleted.
 *     tags: [Reagent Usage History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Usage history record ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Usage history retrieved successfully
 *       400:
 *         description: Bad request - Invalid ID format
 *       404:
 *         description: Usage history not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

