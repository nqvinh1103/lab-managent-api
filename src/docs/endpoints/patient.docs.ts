/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     description: Create a new patient record. Automatically creates a linked User account with NORMAL_USER role for patient portal access. Returns a temporary password that should be sent to patient via email. **Required Privilege:** MANAGE_PATIENT
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
 *             example:
 *               success: true
 *               message: "Patient created successfully"
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
 *               temporaryPassword: "Abc@123456"
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: List patients
 *     description: Get paginated list of all patients. **Required Privilege:** MANAGE_PATIENT
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, identity number, or phone
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     description: Get patient details by ID. **Required Privilege:** MANAGE_PATIENT
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       404:
 *         description: Patient not found
 *
 *   put:
 *     summary: Update patient
 *     description: Update patient information. **Required Privilege:** MANAGE_PATIENT
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePatientRequest'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *
 *   delete:
 *     summary: Delete patient
 *     description: Soft delete a patient (sets deleted_at timestamp and locks associated user account). **Required Privilege:** MANAGE_PATIENT
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *
 * /patients/me:
 *   get:
 *     summary: Get my profile
 *     description: Get logged-in patient's own profile. Available to authenticated patients.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient profile not found
 */

