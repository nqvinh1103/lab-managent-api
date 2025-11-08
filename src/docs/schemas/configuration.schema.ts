/**
 * @swagger
 * components:
 *   schemas:
 *     Configuration:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         config_key:
 *           type: string
 *           description: Unique configuration key
 *           example: "instrument.sysmex_xn1000.mode"
 *         config_name:
 *           type: string
 *           description: Human-readable configuration name
 *           example: "Sysmex XN-1000 Mode Configuration"
 *         config_value:
 *           type: object
 *           description: Configuration value (JSON object)
 *           example:
 *             mode: "CBC"
 *             auto_flag: true
 *             timeout: 300
 *         category:
 *           type: string
 *           description: Configuration category
 *           example: "instrument"
 *         instrument_type:
 *           type: string
 *           nullable: true
 *           description: Type of instrument this configuration applies to
 *           example: "Sysmex XN-1000"
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
 *     CreateConfigurationRequest:
 *       type: object
 *       required:
 *         - config_key
 *         - config_name
 *         - config_value
 *         - category
 *         - created_by
 *         - updated_by
 *       properties:
 *         config_key:
 *           type: string
 *           description: Unique configuration key (must be unique)
 *           example: "instrument.sysmex_xn1000.mode"
 *         config_name:
 *           type: string
 *           description: Human-readable configuration name
 *           example: "Sysmex XN-1000 Mode Configuration"
 *         config_value:
 *           type: object
 *           description: Configuration value (JSON object)
 *           example:
 *             mode: "CBC"
 *             auto_flag: true
 *             timeout: 300
 *         category:
 *           type: string
 *           description: Configuration category
 *           example: "instrument"
 *         instrument_type:
 *           type: string
 *           nullable: true
 *           description: Type of instrument this configuration applies to
 *           example: "Sysmex XN-1000"
 *         created_by:
 *           type: string
 *           description: User ID who created the configuration
 *           example: 507f1f77bcf86cd799439013
 *         updated_by:
 *           type: string
 *           description: User ID who last updated the configuration
 *           example: 507f1f77bcf86cd799439013
 * 
 *     UpdateConfigurationRequest:
 *       type: object
 *       properties:
 *         config_key:
 *           type: string
 *           description: Unique configuration key (must be unique if changed)
 *           example: "instrument.sysmex_xn1000.mode"
 *         config_name:
 *           type: string
 *           description: Human-readable configuration name
 *           example: "Sysmex XN-1000 Mode Configuration"
 *         config_value:
 *           type: object
 *           description: Configuration value (JSON object)
 *           example:
 *             mode: "CBC+DIFF"
 *             auto_flag: true
 *             timeout: 300
 *         category:
 *           type: string
 *           description: Configuration category
 *           example: "instrument"
 *         instrument_type:
 *           type: string
 *           nullable: true
 *           description: Type of instrument this configuration applies to
 *           example: "Sysmex XN-1000"
 *         updated_by:
 *           type: string
 *           description: User ID who is updating the configuration
 *           example: 507f1f77bcf86cd799439013
 */

