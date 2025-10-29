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

