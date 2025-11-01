/**
 * @swagger
 * /reagents:
 *   get:
 *     summary: Get all reagents (Read-only master data)
 *     description: |
 *       Get list of all reagent types from master data (SRS 2.5 Reagents List).
 *       These are fixed reagent types: Diluent, Lysing, Staining, Clotting, Cleaner.
 *       
 *       **Access:** All authenticated users can read (read-only)
 *     tags: [Reagents]
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
 *               message: "Success"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   reagent_name: "Diluent"
 *                   description: "Typically used in a 1:10 to 1:20 ratio with blood samples..."
 *                   usage_per_run_min: 1
 *                   usage_per_run_max: 2
 *                   usage_unit: "ml"
 *                   is_active: true
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   reagent_name: "Lysing"
 *                   description: "Often added in precise microliter amounts (e.g., 50–200 µL)..."
 *                   usage_per_run_min: 50
 *                   usage_per_run_max: 200
 *                   usage_unit: "µL"
 *                   is_active: true
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
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
 * /reagents/{id}:
 *   get:
 *     summary: Get reagent by ID (Read-only master data)
 *     description: |
 *       Get a specific reagent type by its ID from master data.
 *       
 *       **Access:** All authenticated users can read (read-only)
 *     tags: [Reagents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reagent ID
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
 *               message: "Success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 reagent_name: "Diluent"
 *                 description: "Typically used in a 1:10 to 1:20 ratio with blood samples to maintain cell integrity. Used to dilute blood samples to ensure accurate counting of blood cells."
 *                 usage_per_run_min: 1
 *                 usage_per_run_max: 2
 *                 usage_unit: "ml"
 *                 is_active: true
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid reagent ID format
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
 *   patch:
 *     summary: Update reagent metadata (ADMIN only)
 *     description: |
 *       Update metadata of a reagent type (description, usage_per_run, usage_unit, is_active).
 *       **Note:** reagent_name cannot be changed (fixed master data).
 *       
 *       **Access:** ADMIN role only
 *     tags: [Reagents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reagent ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReagentMetadataRequest'
 *           example:
 *             description: "Updated description for Diluent reagent"
 *             usage_per_run_min: 1
 *             usage_per_run_max: 2
 *             usage_unit: "ml"
 *             is_active: true
 *     responses:
 *       200:
 *         description: Reagent metadata updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Updated"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 reagent_name: "Diluent"
 *                 description: "Updated description for Diluent reagent"
 *                 usage_per_run_min: 1
 *                 usage_per_run_max: 2
 *                 usage_unit: "ml"
 *                 is_active: true
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
 *         description: Forbidden - ADMIN role required
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

