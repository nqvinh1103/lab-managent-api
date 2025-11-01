/**
 * @swagger
 * components:
 *   schemas:
 *     TestOrder:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         order_number:
 *           type: string
 *           example: ORD-1704067200000
 *         patient_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439012
 *         patient_email:
 *           type: string
 *           format: email
 *           example: nguyen.van.a@email.com
 *           description: Patient email (populated from patient record)
 *         patient_name:
 *           type: string
 *           example: Nguyen Van A
 *           description: Patient name (populated from patient record)
 *         patient_age:
 *           type: number
 *           example: 34
 *           description: Patient age (calculated from date of birth)
 *         patient_gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *           description: Patient gender (populated from patient record)
 *         patient_phone:
 *           type: string
 *           example: +84912345678
 *           description: Patient phone number (populated from patient record)
 *         instrument_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 *         barcode:
 *           type: string
 *           example: BC-SAMPLE001
 *         status:
 *           type: string
 *           enum: [pending, running, completed, cancelled, failed]
 *           example: pending
 *         test_results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TestResult'
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TestComment'
 *         run_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439014
 *           description: User ID who ran the test
 *         run_by_name:
 *           type: string
 *           example: Dr. Nguyen Van B
 *           description: User name who ran the test (populated)
 *         run_at:
 *           type: string
 *           format: date-time
 *           example: 2024-01-05T10:30:00.000Z
 *           description: Date and time when test was run
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2024-01-01T00:00:00.000Z
 *         created_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439015
 *         created_by_name:
 *           type: string
 *           example: Admin User
 *           description: User name who created the order (populated)
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2024-01-05T10:30:00.000Z
 *         updated_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439015
 *     
 *     TestResult:
 *       type: object
 *       properties:
 *         parameter_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439016
 *         result_value:
 *           type: number
 *           example: 120.5
 *         unit:
 *           type: string
 *           example: mg/dL
 *         reference_range_text:
 *           type: string
 *           example: 70-100 mg/dL
 *         is_flagged:
 *           type: boolean
 *           example: true
 *           description: Whether result is outside normal range
 *         reagent_lot_number:
 *           type: string
 *           example: LOT-2024-001
 *         measured_at:
 *           type: string
 *           format: date-time
 *           example: 2024-01-05T10:30:00.000Z
 *     
 *     TestComment:
 *       type: object
 *       properties:
 *         comment_text:
 *           type: string
 *           example: Sample hemolyzed, retest recommended
 *         created_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439015
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2024-01-05T10:30:00.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2024-01-05T10:30:00.000Z
 *         updated_by:
 *           type: string
 *           example: 507f1f77bcf86cd799439015
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     
 *     CreateTestOrderRequest:
 *       type: object
 *       required:
 *         - patient_email
 *       properties:
 *         patient_email:
 *           type: string
 *           format: email
 *           example: nguyen.van.a@email.com
 *           description: Email of existing patient to create test order for
 *         instrument_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 *           description: Optional instrument ID
 *         instrument_name:
 *           type: string
 *           example: Analyzer A
 *           description: Optional instrument name (alternative to instrument_id)
 *     
 *     UpdateTestOrderRequest:
 *       type: object
 *       properties:
 *         instrument_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 *         status:
 *           type: string
 *           enum: [pending, running, completed, cancelled, failed]
 *           example: pending
 *         # Patient info fields (will update patient record)
 *         full_name:
 *           type: string
 *           example: Nguyen Van A Updated
 *           description: Update patient's full name
 *         date_of_birth:
 *           type: string
 *           format: date
 *           example: 1990-01-15
 *           description: Update patient's date of birth
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *           description: Update patient's gender
 *         phone_number:
 *           type: string
 *           example: +84999999999
 *           description: Update patient's phone number
 *         address:
 *           type: string
 *           example: 456 Le Loi, District 1, Ho Chi Minh City
 *           description: Update patient's address
 *     
 *     AddCommentRequest:
 *       type: object
 *       required:
 *         - comment_text
 *       properties:
 *         comment_text:
 *           type: string
 *           minLength: 1
 *           example: Sample hemolyzed, retest recommended
 *     
 *     AddTestResultsRequest:
 *       type: object
 *       required:
 *         - results
 *       properties:
 *         results:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required:
 *               - parameter_id
 *               - result_value
 *               - unit
 *             properties:
 *               parameter_id:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439016
 *               result_value:
 *                 type: number
 *                 example: 120.5
 *               unit:
 *                 type: string
 *                 example: mg/dL
 *     
 *     CompleteTestOrderRequest:
 *       type: object
 *       properties:
 *         reagent_usage:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               reagent_lot_number:
 *                 type: string
 *                 example: LOT-2024-001
 *               quantity_used:
 *                 type: number
 *                 example: 2.5
 *     
 *     ProcessSampleRequest:
 *       type: object
 *       required:
 *         - barcode
 *         - instrument_id
 *       properties:
 *         barcode:
 *           type: string
 *           example: BC-SAMPLE001
 *         instrument_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439013
 */

