/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         full_name:
 *           type: string
 *           example: Nguyen Van A
 *         identity_number:
 *           type: string
 *           example: 001234567890
 *         date_of_birth:
 *           type: string
 *           format: date
 *           example: 1990-01-15
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *         address:
 *           type: string
 *           example: 123 Nguyen Hue, Ho Chi Minh City
 *         phone_number:
 *           type: string
 *           example: +84912345678
 *         email:
 *           type: string
 *           format: email
 *           example: nguyen.van.a@email.com
 *         user_id:
 *           type: string
 *           example: 507f1f77bcf86cd799439012
 *           description: Linked User account ID for portal access
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: string
 *         updated_at:
 *           type: string
 *           format: date-time
 *         updated_by:
 *           type: string
 *     
 *     CreatePatientRequest:
 *       type: object
 *       required:
 *         - email
 *         - full_name
 *         - date_of_birth
 *         - gender
 *         - phone_number
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: nguyen.van.a@email.com
 *           description: Email is required for patient portal access
 *         full_name:
 *           type: string
 *           minLength: 2
 *           example: Nguyen Van A
 *         identity_number:
 *           type: string
 *           example: 001234567890
 *           description: Optional identity/passport number
 *         date_of_birth:
 *           type: string
 *           format: date
 *           example: 1990-01-15
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *         phone_number:
 *           type: string
 *           example: +84912345678
 *         address:
 *           type: string
 *           example: 123 Nguyen Hue, Ho Chi Minh City
 *     
 *     CreatePatientResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Patient created successfully
 *         data:
 *           $ref: '#/components/schemas/Patient'
 *         temporaryPassword:
 *           type: string
 *           example: Abc@123456
 *           description: Auto-generated password. Should be sent to patient via email.
 *     
 *     UpdatePatientRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         full_name:
 *           type: string
 *         identity_number:
 *           type: string
 *         date_of_birth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         phone_number:
 *           type: string
 *         address:
 *           type: string
 */

