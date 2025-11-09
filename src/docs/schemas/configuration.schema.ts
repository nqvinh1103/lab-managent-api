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
 *           example: "Hematology Analyzer Configuration"
 *         config_value:
 *           type: number
 *           format: float
 *           description: Configuration value (numeric)
 *           example: 1
 *         category:
 *           type: string
 *           description: Configuration category
 *           example: "instrument"
 *         instrument_type:
 *           type: string
 *           nullable: true
 *           description: Type of instrument this configuration applies to
 *           enum:
 *             - "Hematology Analyzer"
 *             - "Chemistry Analyzer"
 *             - "Immunology Analyzer"
 *             - "Coagulation Analyzer"
 *             - "Blood Gas Analyzer"
 *           example: "Hematology Analyzer"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         created_by:
 *           type: string
 *           description: User ID who created the configuration (from JWT)
 *           example: 507f1f77bcf86cd799439013
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         updated_by:
 *           type: string
 *           description: User ID who last updated the configuration (from JWT)
 *           example: 507f1f77bcf86cd799439013
 * 
 *     CreateConfigurationRequest:
 *       type: object
 *       required:
 *         - config_key
 *         - config_name
 *         - config_value
 *         - category
 *       properties:
 *         config_key:
 *           type: string
 *           description: Unique configuration key (must be unique)
 *           example: "instrument.sysmex_xn1000.mode"
 *         config_name:
 *           type: string
 *           description: Human-readable configuration name
 *           example: "Hematology Analyzer Configuration"
 *         config_value:
 *           type: number
 *           format: float
 *           description: Configuration value (numeric)
 *           example: 1
 *         category:
 *           type: string
 *           description: Configuration category
 *           example: "instrument"
 *         instrument_type:
 *           type: string
 *           nullable: true
 *           description: Type of instrument this configuration applies to
 *           enum:
 *             - "Hematology Analyzer"
 *             - "Chemistry Analyzer"
 *             - "Immunology Analyzer"
 *             - "Coagulation Analyzer"
 *             - "Blood Gas Analyzer"
 *           example: "Hematology Analyzer"
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
 *           example: "Hematology Analyzer Configuration"
 *         config_value:
 *           type: number
 *           format: float
 *           description: Configuration value (numeric)
 *           example: 1.5
 *         category:
 *           type: string
 *           description: Configuration category
 *           example: "instrument"
 *         instrument_type:
 *           type: string
 *           nullable: true
 *           description: Type of instrument this configuration applies to
 *           enum:
 *             - "Hematology Analyzer"
 *             - "Chemistry Analyzer"
 *             - "Immunology Analyzer"
 *             - "Coagulation Analyzer"
 *             - "Blood Gas Analyzer"
 *           example: "Hematology Analyzer"
 */

