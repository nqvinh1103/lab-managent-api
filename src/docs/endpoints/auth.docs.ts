/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   email: "admin@lab.com"
 *                   firstName: "Admin"
 *                   lastName: "User"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn: "24h"
 *       400:
 *         description: Bad request - Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Validation error
 *               error: "Email and password are required"
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Invalid credentials
 *               error: "Invalid email or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     description: Generate a new JWT token using current authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expiresIn:
 *                       type: string
 *                       example: "24h"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Unauthorized
 *               error: "User not authenticated"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user's profile
 *     description: |
 *       Get the authenticated user's profile information.
 *       - Returns user info with roles and privileges
 *       - If user is a patient, also returns patient profile information
 *     tags: [Authentication]
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         full_name:
 *                           type: string
 *                           example: "John Doe"
 *                         phone_number:
 *                           type: string
 *                           example: "1234567890"
 *                         identity_number:
 *                           type: string
 *                           example: "ID-20240101-00001"
 *                         gender:
 *                           type: string
 *                           enum: [male, female]
 *                           example: "male"
 *                         address:
 *                           type: string
 *                           example: "123 Main St"
 *                         date_of_birth:
 *                           type: string
 *                           format: date-time
 *                           example: "1990-01-01T00:00:00.000Z"
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["NORMAL_USER"]
 *                         privileges:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["VIEW_INSTRUMENT"]
 *                     patient:
 *                       type: object
 *                       nullable: true
 *                       description: Patient profile (only present if user is a patient)
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439012"
 *                         full_name:
 *                           type: string
 *                           example: "Jane Patient"
 *                         identity_number:
 *                           type: string
 *                           example: "ID-20240101-00002"
 *                         date_of_birth:
 *                           type: string
 *                           format: date-time
 *                           example: "1985-05-15T00:00:00.000Z"
 *                         gender:
 *                           type: string
 *                           enum: [male, female]
 *                           example: "female"
 *                         address:
 *                           type: string
 *                           example: "456 Oak Ave"
 *                         phone_number:
 *                           type: string
 *                           example: "0987654321"
 *                         email:
 *                           type: string
 *                           example: "patient@example.com"
 *             examples:
 *               regular_user:
 *                 summary: Regular user profile
 *                 value:
 *                   success: true
 *                   message: Success
 *                   data:
 *                     user:
 *                       id: "507f1f77bcf86cd799439011"
 *                       email: "user@example.com"
 *                       full_name: "John Doe"
 *                       phone_number: "1234567890"
 *                       identity_number: "ID-20240101-00001"
 *                       gender: "male"
 *                       address: "123 Main St"
 *                       date_of_birth: "1990-01-01T00:00:00.000Z"
 *                       roles: ["NORMAL_USER"]
 *                       privileges: ["VIEW_INSTRUMENT"]
 *               patient_user:
 *                 summary: Patient user profile
 *                 value:
 *                   success: true
 *                   message: Success
 *                   data:
 *                     user:
 *                       id: "507f1f77bcf86cd799439011"
 *                       email: "patient@example.com"
 *                       full_name: "Jane Patient"
 *                       phone_number: "0987654321"
 *                       identity_number: "ID-20240101-00002"
 *                       gender: "female"
 *                       address: "456 Oak Ave"
 *                       date_of_birth: "1985-05-15T00:00:00.000Z"
 *                       roles: ["NORMAL_USER"]
 *                       privileges: []
 *                     patient:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       full_name: "Jane Patient"
 *                       identity_number: "ID-20240101-00002"
 *                       date_of_birth: "1985-05-15T00:00:00.000Z"
 *                       gender: "female"
 *                       address: "456 Oak Ave"
 *                       phone_number: "0987654321"
 *                       email: "patient@example.com"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Unauthorized
 *               error: "User not authenticated"
 *       403:
 *         description: Forbidden - Account is locked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: User account is locked
 *               error: "User account is locked"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: User not found
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Internal server error
 *               error: "Failed to get profile"
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user (client-side token removal)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: "Logout successful"
 *             example:
 *               success: true
 *               message: "Logout successful"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change user password
 *     description: Change the password for the authenticated user without requiring old password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "NewPass123"
 *                 description: Must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully. Please login with your new password."
 *             example:
 *               success: true
 *               message: "Password changed successfully. Please login with your new password."
 *       400:
 *         description: Validation error or failed to change password
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
 *                     - msg: "Password must be at least 8 characters long"
 *                       param: "newPassword"
 *               weak_password:
 *                 summary: Weak password
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     - msg: "Password must contain at least one uppercase letter"
 *                       param: "newPassword"
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: |
 *       Send a password reset email to the user if the email exists.
 *       For security reasons, this endpoint always returns success even if the email doesn't exist.
 *       The reset token will be sent via email and expires after 1 hour (configurable via RESET_TOKEN_EXPIRY_HOURS).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Success - Email sent if user exists (always returns success for security)
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
 *                   example: "If email exists, reset link has been sent to your email"
 *             example:
 *               success: true
 *               message: "If email exists, reset link has been sent to your email"
 *       400:
 *         description: Validation error - Invalid email format or missing email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_email:
 *                 summary: Missing email
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   error: "Email is required"
 *               invalid_email:
 *                 summary: Invalid email format
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     - msg: "Invalid email format"
 *                       param: "email"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Internal server error"
 *               error: "Failed to process password reset request"
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     description: |
 *       Reset user password using the token received from the forgot password email.
 *       The token must be valid and not expired. After successful reset, the token is invalidated and cannot be reused.
 *       Password must meet strength requirements:
 *       - At least 8 characters
 *       - At least one uppercase letter
 *       - At least one lowercase letter
 *       - At least one number
 *       - At least one special character (@$!%*?&)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 minLength: 64
 *                 maxLength: 64
 *                 example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
 *                 description: Reset token received from the forgot password email (64 hex characters)
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "NewSecurePass123!@#"
 *                 description: |
 *                   New password. Must contain:
 *                   - At least 8 characters
 *                   - At least one uppercase letter (A-Z)
 *                   - At least one lowercase letter (a-z)
 *                   - At least one number (0-9)
 *                   - At least one special character (@$!%*?&)
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: "Password reset successful"
 *             example:
 *               success: true
 *               message: "Password reset successful"
 *       400:
 *         description: Validation error or invalid/expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   error: "Token and new password are required"
 *               invalid_token_format:
 *                 summary: Invalid token format
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     - msg: "Invalid token format"
 *                       param: "token"
 *               invalid_token:
 *                 summary: Invalid or expired token
 *                 value:
 *                   success: false
 *                   message: "Invalid or expired reset token"
 *                   error: "Invalid or expired reset token"
 *               expired_token:
 *                 summary: Expired token
 *                 value:
 *                   success: false
 *                   message: "Reset token has expired"
 *                   error: "Reset token has expired"
 *               weak_password:
 *                 summary: Weak password
 *                 value:
 *                   success: false
 *                   message: "Password is too weak"
 *                   error: "Password must contain at least one special character (@$!%*?&)"
 *               password_validation:
 *                 summary: Password validation error
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     - msg: "Password must be at least 8 characters long"
 *                       param: "newPassword"
 *                     - msg: "Password must contain at least one uppercase letter"
 *                       param: "newPassword"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Internal server error"
 *               error: "Failed to reset password"
 */

