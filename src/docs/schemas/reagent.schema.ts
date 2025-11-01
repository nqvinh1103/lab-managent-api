/**
 * @swagger
 * components:
 *   schemas:
 *     Reagent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         reagent_name:
 *           type: string
 *           description: "Name of the reagent type (Fixed: Diluent, Lysing, Staining, Clotting, Cleaner)"
 *           example: Diluent
 *         description:
 *           type: string
 *           description: Detailed description of the reagent and its usage
 *           example: "Typically used in a 1:10 to 1:20 ratio with blood samples to maintain cell integrity. Used to dilute blood samples to ensure accurate counting of blood cells."
 *         usage_per_run_min:
 *           type: number
 *           description: Minimum usage per run
 *           example: 1
 *         usage_per_run_max:
 *           type: number
 *           description: Maximum usage per run
 *           example: 2
 *         usage_unit:
 *           type: string
 *           description: Unit of measure for usage (e.g., ml, µL)
 *           example: ml
 *         is_active:
 *           type: boolean
 *           description: Whether this reagent type is active
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     UpdateReagentMetadataRequest:
 *       type: object
 *       description: Only metadata fields can be updated (ADMIN only)
 *       properties:
 *         description:
 *           type: string
 *           description: Updated description
 *         usage_per_run_min:
 *           type: number
 *           minimum: 0
 *           description: Updated minimum usage per run
 *         usage_per_run_max:
 *           type: number
 *           minimum: 0
 *           description: Updated maximum usage per run
 *         usage_unit:
 *           type: string
 *           description: Updated usage unit
 *         is_active:
 *           type: boolean
 *           description: Whether to activate/deactivate this reagent type
 */

