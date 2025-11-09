/**
 * @swagger
 * components:
 *   schemas:
 *     FlaggingConfiguration:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         parameter_id:
 *           type: string
 *           description: Parameter ID this flagging configuration applies to
 *           example: 507f1f77bcf86cd799439012
 *         age_group:
 *           type: string
 *           nullable: true
 *           description: Age group this configuration applies to (e.g., "adult", "child", "infant")
 *           example: "adult"
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           nullable: true
 *           description: Gender this configuration applies to (null means applies to all genders)
 *           example: "male"
 *         reference_range_min:
 *           type: number
 *           nullable: true
 *           description: Minimum value of the reference range
 *           example: 4.5
 *         reference_range_max:
 *           type: number
 *           nullable: true
 *           description: Maximum value of the reference range
 *           example: 11.0
 *         flag_type:
 *           type: string
 *           enum: [critical, warning, info]
 *           description: Type of flag to apply when value is outside reference range
 *           example: "warning"
 *         is_active:
 *           type: boolean
 *           description: Whether this flagging configuration is active
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
 * 
 *     CreateFlaggingConfigurationRequest:
 *       type: object
 *       required:
 *         - parameter_id
 *         - reference_range_min
 *         - reference_range_max
 *         - flag_type
 *         - is_active
 *         - created_by
 *         - updated_by
 *       properties:
 *         parameter_id:
 *           type: string
 *           description: Parameter ID this flagging configuration applies to
 *           example: 507f1f77bcf86cd799439012
 *         age_group:
 *           type: string
 *           nullable: true
 *           description: Age group this configuration applies to (e.g., "adult", "child", "infant")
 *           example: "adult"
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           nullable: true
 *           description: Gender this configuration applies to (null means applies to all genders)
 *           example: "male"
 *         reference_range_min:
 *           type: number
 *           description: Minimum value of the reference range (must be less than reference_range_max)
 *           example: 4.5
 *         reference_range_max:
 *           type: number
 *           description: Maximum value of the reference range (must be greater than reference_range_min)
 *           example: 11.0
 *         flag_type:
 *           type: string
 *           enum: [critical, warning, info]
 *           description: Type of flag to apply when value is outside reference range
 *           example: "warning"
 *         is_active:
 *           type: boolean
 *           description: Whether this flagging configuration is active
 *           example: true
 *         created_by:
 *           type: string
 *           description: User ID who created the flagging configuration
 *           example: 507f1f77bcf86cd799439013
 *         updated_by:
 *           type: string
 *           description: User ID who last updated the flagging configuration
 *           example: 507f1f77bcf86cd799439013
 * 
 *     UpdateFlaggingConfigurationRequest:
 *       type: object
 *       properties:
 *         parameter_id:
 *           type: string
 *           description: Parameter ID this flagging configuration applies to
 *           example: 507f1f77bcf86cd799439012
 *         age_group:
 *           type: string
 *           nullable: true
 *           description: Age group this configuration applies to
 *           example: "adult"
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           nullable: true
 *           description: Gender this configuration applies to
 *           example: "male"
 *         reference_range_min:
 *           type: number
 *           description: Minimum value of the reference range
 *           example: 4.5
 *         reference_range_max:
 *           type: number
 *           description: Maximum value of the reference range
 *           example: 11.0
 *         flag_type:
 *           type: string
 *           enum: [critical, warning, info]
 *           description: Type of flag to apply when value is outside reference range
 *           example: "warning"
 *         is_active:
 *           type: boolean
 *           description: Whether this flagging configuration is active
 *           example: true
 *         updated_by:
 *           type: string
 *           description: User ID who is updating the flagging configuration
 *           example: 507f1f77bcf86cd799439013
 * 
 *     SyncFlaggingConfigurationRequest:
 *       type: object
 *       required:
 *         - configurations
 *       properties:
 *         configurations:
 *           type: array
 *           description: Array of flagging configurations to sync (create or update)
 *           minItems: 1
 *           items:
 *             type: object
 *             required:
 *               - parameter_id
 *               - reference_range_min
 *               - reference_range_max
 *               - flag_type
 *               - is_active
 *             properties:
 *               parameter_id:
 *                 type: string
 *                 description: Parameter ID this flagging configuration applies to
 *                 example: 507f1f77bcf86cd799439012
 *               age_group:
 *                 type: string
 *                 nullable: true
 *                 description: Age group this configuration applies to
 *                 example: "adult"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 nullable: true
 *                 description: Gender this configuration applies to
 *                 example: "male"
 *               reference_range_min:
 *                 type: number
 *                 description: Minimum value of the reference range
 *                 example: 4.5
 *               reference_range_max:
 *                 type: number
 *                 description: Maximum value of the reference range
 *                 example: 11.0
 *               flag_type:
 *                 type: string
 *                 enum: [critical, warning, info]
 *                 description: Type of flag to apply when value is outside reference range
 *                 example: "warning"
 *               is_active:
 *                 type: boolean
 *                 description: Whether this flagging configuration is active
 *                 example: true
 */

