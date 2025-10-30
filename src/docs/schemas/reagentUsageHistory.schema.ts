/**
 * @swagger
 * components:
 *   schemas:
 *     ReagentUsageHistory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         reagent_lot_number:
 *           type: string
 *           example: LOT-2024-001
 *         instrument_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439012
 *         instrument_name:
 *           type: string
 *           example: Hematology Analyzer X1 Updated
 *         test_order_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 *         test_order_barcode:
 *           type: string
 *           example: BC-ZJVP3KADG
 *         quantity_used:
 *           type: number
 *           example: 2
 *         used_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439014
 *         used_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439015
 *       required:
 *         - reagent_lot_number
 *         - instrument_id
 *         - quantity_used
 *         - used_by
 *         - used_at
 *
 *     CreateReagentUsageRequest:
 *       type: object
 *       required:
 *         - reagent_lot_number
 *         - quantity_used
 *       properties:
 *         reagent_lot_number:
 *           type: string
 *           example: LOT-2024-001
 *         instrument_name:
 *           type: string
 *           example: Hematology Analyzer X1 Updated
 *         test_order_barcode:
 *           type: string
 *           example: BC-ZJVP3KADG
 *         quantity_used:
 *           type: number
 *           example: 2
 *
 *     UpdateReagentUsageRequest:
 *       type: object
 *       properties:
 *         reagent_lot_number:
 *           type: string
 *         instrument_name:
 *           type: string
 *         test_order_id:
 *           type: string
 *         test_order_barcode:
 *           type: string
 *         quantity_used:
 *           type: number
 */

