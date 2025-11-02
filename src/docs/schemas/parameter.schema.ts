/**
 * @swagger
 * components:
 *   schemas:
 *     Parameter:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         parameter_code:
 *           type: string
 *           description: Unique code for the parameter (e.g., WBC, RBC)
 *           example: WBC
 *         parameter_name:
 *           type: string
 *           description: Full name of the parameter
 *           example: White Blood Cell Count
 *         abbreviation:
 *           type: string
 *           nullable: true
 *           description: Abbreviation of the parameter
 *           example: WBC
 *         unit:
 *           type: string
 *           description: Unit of measurement
 *           example: "10^3/µL"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the parameter
 *           example: "Measure of white blood cells in blood sample"
 *         normal_range:
 *           type: object
 *           nullable: true
 *           description: Normal reference range for the parameter
 *           properties:
 *             min:
 *               type: number
 *             max:
 *               type: number
 *             text:
 *               type: string
 *           example:
 *             min: 4.5
 *             max: 11.0
 *             text: "4.5-11.0 10^3/µL"
 *         is_active:
 *           type: boolean
 *           description: Whether the parameter is active
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         created_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         updated_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 */

