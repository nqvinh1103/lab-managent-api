export const MESSAGES = {
  // Success messages
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',

  // Error messages
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  USER_NOT_FOUND: 'User not found',
  INVALID_EMAIL: 'Invalid email format',
  WEAK_PASSWORD: 'Password is too weak',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USER_LOCKED: 'User account is locked',
  ACCOUNT_LOCKED: 'Account is locked. Please contact administrator',
  LOGIN_FAILED: 'Login failed',
  INSUFFICIENT_PRIVILEGES: 'Insufficient privileges to access this resource',

  // Database messages
  DB_CONNECTION_ERROR: 'Database connection failed',
  DB_QUERY_ERROR: 'Database query failed',
  DB_SAVE_ERROR: 'Failed to save data',
  DB_UPDATE_ERROR: 'Failed to update data',
  DB_DELETE_ERROR: 'Failed to delete data',

  // Validation messages
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  MIN_LENGTH: 'Minimum length not met',
  MAX_LENGTH: 'Maximum length exceeded',
  INVALID_RANGE: 'Value is out of valid range'
} as const
