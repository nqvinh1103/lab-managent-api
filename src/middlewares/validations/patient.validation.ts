import { body, param, query } from 'express-validator';

export const createPatientValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('full_name')
    .notEmpty().withMessage('Full name is required')
    .trim()
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('date_of_birth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('phone_number')
    .notEmpty().withMessage('Phone number is required')
    .trim(),
  body('identity_number')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
];

export const updatePatientValidation = [
  param('id')
    .notEmpty().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID format'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('gender')
    .optional()
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('phone_number')
    .optional()
    .trim(),
  body('identity_number')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
];

export const patientIdValidation = [
  param('id')
    .notEmpty().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID format'),
];

export const listPatientsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim(),
];

