import { body, param, query } from 'express-validator';
import { InstrumentType } from '../../models/Configuration';

// Validation for configuration ID in params
export const configurationIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid configuration ID format')
];

// Validation for creating a new configuration
export const createConfigurationValidation = [
  body('config_key')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Configuration key is required'),
  body('config_name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Configuration name is required'),
  body('config_value')
    .exists()
    .withMessage('Configuration value is required')
    .bail()
    .isFloat()
    .withMessage('Configuration value must be a number')
    .toFloat(),
  body('category')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('instrument_type')
    .optional()
    .isString()
    .trim()
    .custom((value) => {
      if (!Object.values(InstrumentType).includes(value)) {
        throw new Error('Invalid instrument type. Must be one of: ' + Object.values(InstrumentType).join(', '));
      }
      return true;
    }),
  body('created_by').optional(),
  body('updated_by').optional()
];

// Validation for updating a configuration
export const updateConfigurationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid configuration ID format'),
  body('config_key')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Configuration key cannot be empty if providedddddddddddddddddddddddddddddddddddd'),
  body('config_name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Configuration name cannot be empty if provided'),
  body('config_value')
    .optional()
    .isFloat()
    .withMessage('Configuration value must be a number')
    .toFloat(),
  body('category')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty if provided'),
  body('instrument_type')
    .optional()
    .isString()
    .trim()
    .custom((value) => {
      if (value && !Object.values(InstrumentType).includes(value)) {
        throw new Error('Invalid instrument type. Must be one of: ' + Object.values(InstrumentType).join(', '));
      }
      return true;
    }),
  body('created_by').optional(),
  body('updated_by').optional()
];

// Validation for search/filter parameters
export const searchConfigurationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive integer')
    .toInt(),
  query('category')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty if provided'),
  query('instrument_type')
    .optional()
    .isString()
    .trim()
    .isIn(Object.values(InstrumentType))
    .withMessage('Invalid instrument type. Must be one of: ' + Object.values(InstrumentType).join(', '))
];