import { body, param } from 'express-validator';

export const createTestOrderValidation = [
  body('patient_email')
    .notEmpty().withMessage('Patient email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('instrument_id')
    .optional()
    .isMongoId().withMessage('Invalid instrument ID format'),
  body('instrument_name')
    .optional()
    .trim()
    .isLength({ min: 1 }).withMessage('Instrument name cannot be empty'),
];

export const updateTestOrderValidation = [
  param('id')
    .notEmpty().withMessage('Test order ID is required')
    .isMongoId().withMessage('Invalid test order ID format'),
  body('instrument_id')
    .optional()
    .isMongoId().withMessage('Invalid instrument ID format'),
  body('status')
    .optional()
    .isIn(['pending', 'running', 'completed', 'cancelled', 'failed'])
    .withMessage('Invalid status value'),
  // Patient info fields (for updating patient through test order)
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
  body('address')
    .optional()
    .trim(),
];

export const testOrderIdValidation = [
  param('id')
    .notEmpty().withMessage('Test order ID is required')
    .isMongoId().withMessage('Invalid test order ID format'),
];

export const addCommentValidation = [
  param('id')
    .notEmpty().withMessage('Test order ID is required')
    .isMongoId().withMessage('Invalid test order ID format'),
  body('comment_text')
    .notEmpty().withMessage('Comment text is required')
    .trim()
    .isLength({ min: 1 }).withMessage('Comment text cannot be empty'),
];

export const updateCommentValidation = [
  param('id')
    .notEmpty().withMessage('Test order ID is required')
    .isMongoId().withMessage('Invalid test order ID format'),
  param('commentIndex')
    .notEmpty().withMessage('Comment index is required')
    .isInt({ min: 0 }).withMessage('Comment index must be a non-negative integer'),
  body('comment_text')
    .notEmpty().withMessage('Comment text is required')
    .trim()
    .isLength({ min: 1 }).withMessage('Comment text cannot be empty'),
];

export const deleteCommentValidation = [
  param('id')
    .notEmpty().withMessage('Test order ID is required')
    .isMongoId().withMessage('Invalid test order ID format'),
  param('commentIndex')
    .notEmpty().withMessage('Comment index is required')
    .isInt({ min: 0 }).withMessage('Comment index must be a non-negative integer'),
];

export const addResultsValidation = [
  param('id')
    .notEmpty().withMessage('Test order ID is required')
    .isMongoId().withMessage('Invalid test order ID format'),
  body('results')
    .notEmpty().withMessage('Results array is required')
    .isArray({ min: 1 }).withMessage('Results must be a non-empty array'),
  body('results.*.parameter_id')
    .notEmpty().withMessage('Parameter ID is required for each result')
    .isMongoId().withMessage('Invalid parameter ID format'),
  body('results.*.result_value')
    .notEmpty().withMessage('Result value is required for each result')
    .isNumeric().withMessage('Result value must be a number'),
  body('results.*.unit')
    .notEmpty().withMessage('Unit is required for each result')
    .trim()
    .isLength({ min: 1 }).withMessage('Unit cannot be empty'),
];

export const completeTestOrderValidation = [
  param('id')
    .notEmpty().withMessage('Test order ID is required')
    .isMongoId().withMessage('Invalid test order ID format'),
  body('reagent_usage')
    .optional()
    .isArray().withMessage('Reagent usage must be an array'),
  body('reagent_usage.*.reagent_lot_number')
    .optional()
    .trim()
    .isLength({ min: 1 }).withMessage('Reagent lot number cannot be empty'),
  body('reagent_usage.*.quantity_used')
    .optional()
    .isNumeric().withMessage('Quantity used must be a number'),
];

export const processSampleValidation = [
  body('barcode')
    .notEmpty().withMessage('Barcode is required')
    .trim()
    .isLength({ min: 1 }).withMessage('Barcode cannot be empty'),
  body('instrument_id')
    .notEmpty().withMessage('Instrument ID is required')
    .isMongoId().withMessage('Invalid instrument ID format'),
];

export const printTestOrderValidation = [
  param('id')
    .notEmpty().withMessage('Test order ID is required')
    .isMongoId().withMessage('Invalid test order ID format'),
];

