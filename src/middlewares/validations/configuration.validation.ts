import { body, param, query } from 'express-validator';

export const createConfigurationValidation = [
  body('config_key')
    .notEmpty().withMessage('Configuration key is required')
    .trim()
    .matches(/^[A-Z0-9_]+$/).withMessage('Configuration key must contain only uppercase letters, numbers, and underscores'),
  body('config_name')
    .notEmpty().withMessage('Configuration name is required')
    .trim()
    .isLength({ min: 2 }).withMessage('Configuration name must be at least 2 characters'),
  body('config_value')
    .notEmpty().withMessage('Configuration value is required'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .trim(),
  body('instrument_type')
    .optional()
    .trim(),
  body('created_by')
    .notEmpty().withMessage('created_by is required'),
  body('updated_by')
    .notEmpty().withMessage('updated_by is required')
];

export const updateConfigurationValidation = [
  param('id')
    .notEmpty().withMessage('Configuration ID is required')
    .isMongoId().withMessage('Invalid configuration ID format'),
  body('config_key')
    .optional()
    .trim()
    .matches(/^[A-Z0-9_]+$/).withMessage('Configuration key must contain only uppercase letters, numbers, and underscores'),
  body('config_name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Configuration name must be at least 2 characters'),
  body('config_value')
    .optional(),
  body('category')
    .optional()
    .trim(),
  body('instrument_type')
    .optional()
    .trim(),
  body('updated_by')
    .notEmpty().withMessage('updated_by is required')
];

export const configurationIdValidation = [
  param('id')
    .notEmpty().withMessage('Configuration ID is required')
    .isMongoId().withMessage('Invalid configuration ID format')
];

export const searchConfigurationValidation = [
  query('category')
    .optional()
    .trim(),
  query('instrument_type')
    .optional()
    .trim(),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

