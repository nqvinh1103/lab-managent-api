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
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance, decommissioned]
 *           example: active
 *         mode:
 *           type: string
 *           enum: [ready, maintenance, inactive]
 *           nullable: true
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
 *         is_active:
 *           type: boolean
 *           example: true
 *         deactivated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         auto_delete_scheduled_at:
 *           type: string
 *           format: date-time
 *           nullable: true
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
 *         - status
 *         - is_active
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
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance, decommissioned]
 *           example: active
 *         mode:
 *           type: string
 *           enum: [ready, maintenance, inactive]
 *           nullable: true
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
 *         is_active:
 *           type: boolean
 *           example: true
 *         deactivated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         auto_delete_scheduled_at:
 *           type: string
 *           format: date-time
 *           nullable: true
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
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance, decommissioned]
 *         mode:
 *           type: string
 *           enum: [ready, maintenance, inactive]
 *           nullable: true
 *         mode_reason:
 *           type: string
 *           nullable: true
 *         last_qc_check:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         is_active:
 *           type: boolean
 *         deactivated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         auto_delete_scheduled_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

