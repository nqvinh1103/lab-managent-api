/**
 * @swagger
 * components:
 *   schemas:
 *     InstrumentReagent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         instrument_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439012
 *         reagent_inventory_id:
 *           type: string
 *           description: Reference to ReagentInventory (warehouse)
 *           example: 507f1f77bcf86cd799439014
 *         reagent_id:
 *           type: string
 *           description: Reference to Reagent master (SRS 2.5)
 *           example: 507f1f77bcf86cd799439015
 *         reagent_name:
 *           type: string
 *           description: From Reagent master (Diluent, Lysing, Staining, Clotting, Cleaner)
 *           example: Diluent
 *         description:
 *           type: string
 *           description: From Reagent master - Detailed description of the reagent
 *           example: "Typically used in a 1:10 to 1:20 ratio with blood samples..."
 *         usage_per_run_min:
 *           type: number
 *           description: From Reagent master - Minimum usage per run
 *           example: 1
 *         usage_per_run_max:
 *           type: number
 *           description: From Reagent master - Maximum usage per run
 *           example: 2
 *         usage_unit:
 *           type: string
 *           description: From Reagent master - Unit of measure
 *           example: ml
 *         reagent_lot_number:
 *           type: string
 *           description: From ReagentInventory - Lot number
 *           example: LOT-2024-DIL-001
 *         quantity:
 *           type: number
 *           description: Initial quantity when installed
 *           example: 1000
 *         quantity_remaining:
 *           type: number
 *           description: Current remaining quantity
 *           example: 850
 *         expiration_date:
 *           type: string
 *           format: date-time
 *           description: From ReagentInventory - Expiration date
 *           example: "2025-12-31T23:59:59.000Z"
 *         installed_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00.000Z"
 *         installed_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 *         removed_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         removed_by:
 *           type: string
 *           nullable: true
 *           example: 507f1f77bcf86cd799439013
 *         status:
 *           type: string
 *           enum: [in_use, not_in_use, expired]
 *           example: in_use
 *         created_at:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 *     
 *     CreateInstrumentReagentRequest:
 *       type: object
 *       required:
 *         - instrument_id
 *         - reagent_inventory_id
 *         - quantity
 *       properties:
 *         instrument_id:
 *           type: string
 *           description: ID of the instrument to install reagent on
 *           example: 507f1f77bcf86cd799439012
 *         reagent_inventory_id:
 *           type: string
 *           description: Reference to ReagentInventory (warehouse) - All reagent info will be populated from inventory
 *           example: 507f1f77bcf86cd799439014
 *         quantity:
 *           type: number
 *           minimum: 0.01
 *           description: Quantity to install from inventory (must be greater than zero). This will be deducted from inventory quantity_in_stock.
 *           example: 1000
 *       additionalProperties: false
 *       description: |
 *         Note: reagent_name, description, usage_per_run, lot_number, expiration_date will be automatically
 *         populated from ReagentInventory and Reagent master. Vendor info is no longer needed.
 *         
 *         quantity_remaining will be automatically set to quantity when first installed.
 *         
 *         installed_at and installed_by will be automatically set by the system (current time and current user).
 *         
 *         reagent_lot_number, quantity_remaining, installed_at, and installed_by should NOT be included in the request body.
 *     
 *     UpdateInstrumentReagentRequest:
 *       type: object
 *       description: Only installation-specific fields can be updated. Master data and inventory data are read-only.
 *       properties:
 *         quantity:
 *           type: number
 *           minimum: 0.01
 *         quantity_remaining:
 *           type: number
 *           minimum: 0
 *         status:
 *           type: string
 *           enum: [in_use, not_in_use, expired]
 */

