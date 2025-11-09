/**
 * @swagger
 * components:
 *   schemas:
 *     Instrument:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         instrument_name:
 *           type: string
 *           example: Hematology Analyzer X1
 *         instrument_type:
 *           type: string
 *           example: Hematology Analyzer
 *         serial_number:
 *           type: string
 *           example: SN-2024-001
 *         mode:
 *           type: string
 *           enum: [ready, maintenance, inactive]
 *           example: ready
 *         mode_reason:
 *           type: string
 *           nullable: true
 *           example: Scheduled calibration
 *         last_qc_check:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-15T10:00:00.000Z"
 *         deactivated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         auto_delete_scheduled_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         configuration_id:
 *           type: string
 *           description: Reference to a saved Configuration (_id) applied to this instrument
 *           example: 507f1f77bcf86cd799439099
 *         created_at:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         updated_at:
 *           type: string
 *           format: date-time
 *         updated_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *     
 *     CreateInstrumentRequest:
 *       type: object
 *       required:
 *         - instrument_name
 *         - instrument_type
 *         - serial_number
 *         - mode
 *       properties:
 *         instrument_name:
 *           type: string
 *           minLength: 2
 *           example: Hematology Analyzer X1
 *         instrument_type:
 *           type: string
 *           minLength: 2
 *           example: Hematology Analyzer
 *         serial_number:
 *           type: string
 *           example: SN-2024-001
 *         mode:
 *           type: string
 *           enum: [ready, maintenance, inactive]
 *           example: ready
 *         mode_reason:
 *           type: string
 *           nullable: true
 *           example: Scheduled calibration
 *         last_qc_check:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-15T10:00:00.000Z"
 *         deactivated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         auto_delete_scheduled_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         configuration_id:
 *           type: string
 *           description: Optional configuration to apply to the instrument (must be a valid Configuration _id)
 *           example: 507f1f77bcf86cd799439099
 *         reagents:
 *           type: array
 *           description: Optional array of reagents to install during instrument creation (Use Case 2). All reagent info will be populated from inventory.
 *           items:
 *             type: object
 *             required:
 *               - reagent_inventory_id
 *               - quantity
 *             properties:
 *               reagent_inventory_id:
 *                 type: string
 *                 description: Reference to ReagentInventory - All reagent info (name, lot_number, expiration_date, etc.) will be populated from inventory
 *                 example: 507f1f77bcf86cd799439014
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Quantity to install from inventory. This will be deducted from inventory quantity_in_stock. quantity_remaining will be automatically set to quantity.
 *                 example: 1000
 *           nullable: true
 *     
 *     UpdateInstrumentRequest:
 *       type: object
 *       properties:
 *         instrument_name:
 *           type: string
 *           minLength: 2
 *         instrument_type:
 *           type: string
 *           minLength: 2
 *         serial_number:
 *           type: string
 *         mode:
 *           type: string
 *           enum: [ready, maintenance, inactive]
 *         mode_reason:
 *           type: string
 *           nullable: true
 *         last_qc_check:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         deactivated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         auto_delete_scheduled_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         configuration_id:
 *           type: string
 *           description: Optional configuration reference (Configuration _id)
 *           example: 507f1f77bcf86cd799439099
 */

