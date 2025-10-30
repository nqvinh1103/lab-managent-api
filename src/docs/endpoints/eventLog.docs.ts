/**
 * @swagger
 * /event-logs:
 *   get:
 *     summary: Get all event logs
 *     description: Get paginated list of all event logs with optional filters. **Required Privilege:** VIEW_EVENT_LOGS
 *     tags: [Event Logs]
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
 *         name: entity_type
 *         schema:
 *           type: string
 *         description: Filter by entity type (e.g., User, Role, Patient)
 *       - in: query
 *         name: action_type
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *         description: Filter by action type
 *       - in: query
 *         name: performed_by
 *         schema:
 *           type: string
 *         description: Filter by user ID who performed the action
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events until this date
 *     responses:
 *       200:
 *         description: Event logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   action_type: "CREATE"
 *                   entity_type: "User"
 *                   entity_id: "507f1f77bcf86cd799439012"
 *                   performed_by: "507f1f77bcf86cd799439013"
 *                   description: "Created new user"
 *                   created_at: "2023-01-01T00:00:00.000Z"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 100
 *                 totalPages: 10
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
 * /event-logs/{id}:
 *   get:
 *     summary: Get event log by ID
 *     description: Get a specific event log by its ID. **Required Privilege:** VIEW_EVENT_LOGS
 *     tags: [Event Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event log ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Event log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 action_type: "CREATE"
 *                 entity_type: "User"
 *                 entity_id: "507f1f77bcf86cd799439012"
 *                 performed_by: "507f1f77bcf86cd799439013"
 *                 description: "Created new user"
 *                 metadata: { "role": "admin" }
 *                 created_at: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid event log ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Event log not found
 *       500:
 *         description: Internal server error
 */

