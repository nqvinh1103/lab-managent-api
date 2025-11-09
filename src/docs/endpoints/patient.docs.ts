/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     description: Create a new patient record and automatically create a linked User account with NORMAL_USER role for patient portal access. An email with login credentials will be sent to the patient's email address. **Required Privilege:** CREATE_USER
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePatientRequest'
 *           example:
 *             email: "nguyen.van.a@email.com"
 *             full_name: "Nguyen Van A"
 *             identity_number: "001234567890"
 *             date_of_birth: "1990-01-15"
 *             gender: "male"
 *             phone_number: "+84912345678"
 *             address: "123 Nguyen Hue, Ho Chi Minh City"
 *     responses:
 *       201:
 *         description: Patient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePatientResponse'
 *             examples:
 *               email_sent:
 *                 summary: Email sent successfully
 *                 value:
 *                   success: true
 *                   message: "Patient created successfully. Login credentials have been sent to patient email."
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     email: "nguyen.van.a@email.com"
 *                     full_name: "Nguyen Van A"
 *                     identity_number: "001234567890"
 *                     date_of_birth: "1990-01-15"
 *                     gender: "male"
 *                     phone_number: "+84912345678"
 *                     address: "123 Nguyen Hue, Ho Chi Minh City"
 *                     user_id: "507f1f77bcf86cd799439012"
 *                     created_at: "2024-01-01T00:00:00.000Z"
 *                     updated_at: "2024-01-01T00:00:00.000Z"
 *                   emailStatus:
 *                     sent: true
 *               email_failed:
 *                 summary: Email failed but patient created
 *                 value:
 *                   success: true
 *                   message: "Patient created successfully. Warning: Failed to send email with credentials."
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     email: "nguyen.van.a@email.com"
 *                     full_name: "Nguyen Van A"
 *                     user_id: "507f1f77bcf86cd799439012"
 *                     created_at: "2024-01-01T00:00:00.000Z"
 *                     updated_at: "2024-01-01T00:00:00.000Z"
 *                   emailStatus:
 *                     sent: false
 *                     error: "Email configuration not set"
 *       400:
 *         description: Bad request - Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     - msg: "Email is required"
 *                       param: "email"
 *               email_exists:
 *                 summary: Email already exists
 *                 value:
 *                   success: false
 *                   message: "Database save error"
 *                   error: "Email already exists"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (requires CREATE_USER privilege)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   get:
 *     summary: List patients
 *     description: Get paginated list of all patients with optional search functionality. **Required Privilege:** VIEW_USER or READ_ONLY
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, identity number, or phone number
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   email: "nguyen.van.a@email.com"
 *                   full_name: "Nguyen Van A"
 *                   date_of_birth: "1990-01-15"
 *                   gender: "male"
 *                   phone_number: "+84912345678"
 *                   user_id: "507f1f77bcf86cd799439012"
 *                   created_at: "2024-01-01T00:00:00.000Z"
 *                   updated_at: "2024-01-01T00:00:00.000Z"
 *                 - _id: "507f1f77bcf86cd799439013"
 *                   email: "tran.thi.b@email.com"
 *                   full_name: "Tran Thi B"
 *                   date_of_birth: "1992-05-20"
 *                   gender: "female"
 *                   phone_number: "+84987654321"
 *                   user_id: "507f1f77bcf86cd799439014"
 *                   created_at: "2024-01-02T00:00:00.000Z"
 *                   updated_at: "2024-01-02T00:00:00.000Z"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 50
 *                 totalPages: 5
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (requires VIEW_USER or READ_ONLY privilege)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     description: Get detailed patient information by patient ID. **Required Privilege:** VIEW_USER or READ_ONLY
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 email: "nguyen.van.a@email.com"
 *                 full_name: "Nguyen Van A"
 *                 identity_number: "001234567890"
 *                 date_of_birth: "1990-01-15"
 *                 gender: "male"
 *                 phone_number: "+84912345678"
 *                 address: "123 Nguyen Hue, Ho Chi Minh City"
 *                 user_id: "507f1f77bcf86cd799439012"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (requires VIEW_USER or READ_ONLY privilege)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Not found"
 *               error: "Patient not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     summary: Update patient
 *     description: Update patient information. All fields are optional. **Required Privilege:** MODIFY_USER
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePatientRequest'
 *           examples:
 *             update_contact:
 *               summary: Update contact information
 *               value:
 *                 phone_number: "+84999999999"
 *                 address: "456 Le Loi, District 1, Ho Chi Minh City"
 *             update_full_info:
 *               summary: Update full information
 *               value:
 *                 full_name: "Nguyen Van A Updated"
 *                 phone_number: "+84999999999"
 *                 address: "456 Le Loi, District 1, Ho Chi Minh City"
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *             example:
 *               success: true
 *               message: "Updated successfully"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 email: "nguyen.van.a@email.com"
 *                 full_name: "Nguyen Van A Updated"
 *                 phone_number: "+84999999999"
 *                 address: "456 Le Loi, District 1, Ho Chi Minh City"
 *                 user_id: "507f1f77bcf86cd799439012"
 *                 updated_at: "2024-01-05T00:00:00.000Z"
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation error"
 *               errors:
 *                 - msg: "Invalid email format"
 *                   param: "email"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (requires MODIFY_USER privilege)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Delete patient (soft delete)
 *     description: Soft delete a patient by setting the deleted_at timestamp and locking the associated user account. The patient record is not permanently removed from the database. **Required Privilege:** DELETE_USER
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Patient deleted successfully
 *             example:
 *               success: true
 *               message: "Patient deleted successfully"
 *       400:
 *         description: Bad request - Invalid patient ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (requires DELETE_USER privilege)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Database delete error"
 *               error: "Patient not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /patients/me:
 *   get:
 *     summary: Get my profile
 *     description: Get the logged-in patient's own profile information. Available to all authenticated patients without requiring special privileges.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 email: "nguyen.van.a@email.com"
 *                 full_name: "Nguyen Van A"
 *                 identity_number: "001234567890"
 *                 date_of_birth: "1990-01-15"
 *                 gender: "male"
 *                 phone_number: "+84912345678"
 *                 address: "123 Nguyen Hue, Ho Chi Minh City"
 *                 user_id: "507f1f77bcf86cd799439012"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Unauthorized"
 *               error: "User not authenticated"
 *       404:
 *         description: Patient profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Not found"
 *               error: "Patient profile not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /patients/{id}/test-orders:
 *   get:
 *     summary: Get patient's test orders
 *     description: Get all test orders for a specific patient. Returns list of test orders with populated patient information, created by, and run by user details. **Required Privilege:** VIEW_USER or READ_ONLY
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Test orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestOrder'
 *             example:
 *               success: true
 *               message: "Success"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439021"
 *                   order_number: "ORD-1704067200000"
 *                   patient_id: "507f1f77bcf86cd799439011"
 *                   patient_email: "nguyen.van.a@email.com"
 *                   patient_name: "Nguyen Van A"
 *                   patient_dob: "1990-01-15"
 *                   patient_gender: "male"
 *                   patient_phone: "+84912345678"
 *                   instrument_id: "507f1f77bcf86cd799439013"
 *                   barcode: "BC-SAMPLE001"
 *                   status: "completed"
 *                   test_results: []
 *                   comments: []
 *                   created_at: "2024-01-01T00:00:00.000Z"
 *                   created_by: "507f1f77bcf86cd799439015"
 *                   created_by_name: "Admin User"
 *                   updated_at: "2024-01-05T10:30:00.000Z"
 *                   updated_by: "507f1f77bcf86cd799439015"
 *                 - _id: "507f1f77bcf86cd799439022"
 *                   order_number: "ORD-1704153600000"
 *                   patient_id: "507f1f77bcf86cd799439011"
 *                   patient_email: "nguyen.van.a@email.com"
 *                   patient_name: "Nguyen Van A"
 *                   patient_dob: "1990-01-15"
 *                   patient_gender: "male"
 *                   patient_phone: "+84912345678"
 *                   status: "pending"
 *                   test_results: []
 *                   comments: []
 *                   created_at: "2024-01-02T00:00:00.000Z"
 *                   created_by: "507f1f77bcf86cd799439015"
 *                   created_by_name: "Admin User"
 *                   updated_at: "2024-01-02T00:00:00.000Z"
 *                   updated_by: "507f1f77bcf86cd799439015"
 *       400:
 *         description: Bad request - Invalid patient ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation error"
 *               error: "Invalid patient ID"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (requires VIEW_USER or READ_ONLY privilege)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Not found"
 *               error: "Patient not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
