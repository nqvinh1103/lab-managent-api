/**
 * @swagger
 * components:
 *   schemas:
 *     ReagentInventory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         reagent_id:
 *           type: string
 *           description: Reference to Reagent master (SRS 2.5)
 *           example: 507f1f77bcf86cd799439012
 *         catalog_number:
 *           type: string
 *           nullable: true
 *           example: CAT-001
 *         manufacturer:
 *           type: string
 *           nullable: true
 *           example: Manufacturer Inc.
 *         cas_number:
 *           type: string
 *           nullable: true
 *           description: Chemical Abstracts Service number (if applicable)
 *           example: CAS-12345-67-8
 *         vendor_name:
 *           type: string
 *           example: ABC Reagents Inc.
 *         vendor_id:
 *           type: string
 *           nullable: true
 *           example: VND-001
 *         vendor_contact:
 *           type: string
 *           nullable: true
 *           example: "contact@abcreagents.com"
 *         po_number:
 *           type: string
 *           nullable: true
 *           description: Purchase Order Number
 *           example: PO-2024-001
 *         order_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-01T00:00:00.000Z"
 *         receipt_date:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00.000Z"
 *         quantity_ordered:
 *           type: number
 *           nullable: true
 *           example: 1000
 *         quantity_received:
 *           type: number
 *           example: 1000
 *         unit_of_measure:
 *           type: string
 *           example: ml
 *         lot_number:
 *           type: string
 *           example: LOT-2024-DIL-001
 *         expiration_date:
 *           type: string
 *           format: date-time
 *           example: "2025-12-31T23:59:59.000Z"
 *         quantity_in_stock:
 *           type: number
 *           description: Remaining quantity in warehouse
 *           example: 850
 *         initial_storage_location:
 *           type: string
 *           nullable: true
 *           example: Warehouse A, Shelf 3
 *         status:
 *           type: string
 *           enum: [Received, Partial Shipment, Returned]
 *           example: Received
 *         returned_reason:
 *           type: string
 *           nullable: true
 *           description: Required if status is "Returned"
 *           example: Defective items
 *         received_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     CreateReagentInventoryRequest:
 *       type: object
 *       required:
 *         - reagent_id
 *         - vendor_name
 *         - receipt_date
 *         - quantity_received
 *         - unit_of_measure
 *         - lot_number
 *         - expiration_date
 *       properties:
 *         reagent_id:
 *           type: string
 *           description: Select from Reagent master list (SRS 2.5)
 *           example: 507f1f77bcf86cd799439012
 *         catalog_number:
 *           type: string
 *           nullable: true
 *         manufacturer:
 *           type: string
 *           nullable: true
 *         cas_number:
 *           type: string
 *           nullable: true
 *         vendor_name:
 *           type: string
 *         vendor_id:
 *           type: string
 *           nullable: true
 *         vendor_contact:
 *           type: string
 *           nullable: true
 *         po_number:
 *           type: string
 *           nullable: true
 *         order_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         receipt_date:
 *           type: string
 *           format: date-time
 *         quantity_ordered:
 *           type: number
 *           nullable: true
 *         quantity_received:
 *           type: number
 *           minimum: 0.01
 *         unit_of_measure:
 *           type: string
 *         lot_number:
 *           type: string
 *         expiration_date:
 *           type: string
 *           format: date-time
 *           description: Must be in the future
 *         quantity_in_stock:
 *           type: number
 *           nullable: true
 *           description: Defaults to quantity_received if not provided
 *         initial_storage_location:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [Received, Partial Shipment, Returned]
 *           description: Auto-set to "Partial Shipment" if quantity_received < quantity_ordered, otherwise "Received"
 *         returned_reason:
 *           type: string
 *           nullable: true
 *           description: Required if status is "Returned"
 *     
 *     UpdateReagentInventoryRequest:
 *       type: object
 *       properties:
 *         catalog_number:
 *           type: string
 *         manufacturer:
 *           type: string
 *         cas_number:
 *           type: string
 *         vendor_name:
 *           type: string
 *         vendor_id:
 *           type: string
 *         vendor_contact:
 *           type: string
 *         po_number:
 *           type: string
 *         order_date:
 *           type: string
 *           format: date-time
 *         receipt_date:
 *           type: string
 *           format: date-time
 *         quantity_ordered:
 *           type: number
 *         quantity_received:
 *           type: number
 *         unit_of_measure:
 *           type: string
 *         lot_number:
 *           type: string
 *         expiration_date:
 *           type: string
 *           format: date-time
 *         initial_storage_location:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Received, Partial Shipment, Returned]
 *         returned_reason:
 *           type: string
 *     
 *     UpdateReagentInventoryStockRequest:
 *       type: object
 *       required:
 *         - quantity_in_stock
 *       properties:
 *         quantity_in_stock:
 *           type: number
 *           minimum: 0
 *     
 *     UpdateReagentInventoryStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [Received, Partial Shipment, Returned]
 *         returned_reason:
 *           type: string
 *           description: Required if status is "Returned"
 */

