import { body, param, query } from 'express-validator';

export const createUserValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password_hash')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('full_name')
    .notEmpty().withMessage('Full name is required')
    .trim()
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('identity_number')
    .notEmpty().withMessage('Identity number is required')
    .trim(),
  body('phone_number')
    .notEmpty().withMessage('Phone number is required')
    .trim(),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('date_of_birth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format'),
  body('address')
    .optional()
    .trim(),
  body('is_locked')
    .optional()
    .isBoolean().withMessage('is_locked must be boolean'),
];

export const updateUserValidation = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password_hash')
    .optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('phone_number')
    .optional()
    .trim(),
  body('gender')
    .optional()
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('address')
    .optional()
    .trim(),
  body('is_locked')
    .optional()
    .isBoolean().withMessage('is_locked must be boolean'),
];

export const userIdValidation = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format')
];

export const assignRoleValidation = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format'),
  body('roleId')
    .notEmpty().withMessage('Role ID is required')
    .isMongoId().withMessage('Invalid role ID format')
];

export const searchUserValidation = [
  query('search')
    .optional()
    .trim(),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];
