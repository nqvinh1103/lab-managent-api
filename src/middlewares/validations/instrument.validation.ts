import { body, param, query } from 'express-validator';

export const createInstrumentValidation = [
  body('instrument_name')
    .notEmpty().withMessage('Instrument name is required')
    .trim()
    .isLength({ min: 2 }).withMessage('Instrument name must be at least 2 characters'),
  body('instrument_type')
    .notEmpty().withMessage('Instrument type is required')
    .trim()
    .isLength({ min: 2 }).withMessage('Instrument type must be at least 2 characters'),
  body('serial_number')
    .notEmpty().withMessage('Serial number is required')
    .trim()
    .isLength({ min: 1 }).withMessage('Serial number is required'),
  body('mode')
    .notEmpty().withMessage('Mode is required')
    .isIn(['ready', 'maintenance', 'inactive']).withMessage('Mode must be one of: ready, maintenance, inactive'),
  body('mode_reason')
    .optional()
    .trim()
    .isLength({ min: 1 }).withMessage('Mode reason cannot be empty if provided'),
  body('last_qc_check')
    .optional()
    .isISO8601().withMessage('Invalid date format for last_qc_check'),
  body('deactivated_at')
    .optional()
    .isISO8601().withMessage('Invalid date format for deactivated_at'),
  body('auto_delete_scheduled_at')
    .optional()
    .isISO8601().withMessage('Invalid date format for auto_delete_scheduled_at'),
];

export const updateInstrumentValidation = [
  param('id')
    .notEmpty().withMessage('Instrument ID is required')
    .isMongoId().withMessage('Invalid instrument ID format'),
  body('instrument_name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Instrument name must be at least 2 characters'),
  body('instrument_type')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Instrument type must be at least 2 characters'),
  body('serial_number')
    .optional()
    .trim()
    .isLength({ min: 1 }).withMessage('Serial number cannot be empty'),
  body('mode')
    .optional()
    .isIn(['ready', 'maintenance', 'inactive']).withMessage('Mode must be one of: ready, maintenance, inactive'),
  body('mode_reason')
    .optional()
    .trim()
    .isLength({ min: 1 }).withMessage('Mode reason cannot be empty if provided'),
  body('last_qc_check')
    .optional()
    .isISO8601().withMessage('Invalid date format for last_qc_check'),
  body('deactivated_at')
    .optional()
    .isISO8601().withMessage('Invalid date format for deactivated_at'),
  body('auto_delete_scheduled_at')
    .optional()
    .isISO8601().withMessage('Invalid date format for auto_delete_scheduled_at'),
];

export const instrumentIdValidation = [
  param('id')
    .notEmpty().withMessage('Instrument ID is required')
    .isMongoId().withMessage('Invalid instrument ID format')
];

export const listInstrumentsValidation = [
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

export const changeModeValidation = [
  param('id')
    .notEmpty().withMessage('Instrument ID is required')
    .isMongoId().withMessage('Invalid instrument ID format'),
  body('mode')
    .notEmpty().withMessage('Mode is required')
    .isIn(['ready', 'maintenance', 'inactive']).withMessage('Mode must be one of: ready, maintenance, inactive'),
  body('mode_reason')
    .optional()
    .trim()
    .isLength({ min: 1 }).withMessage('Mode reason cannot be empty if provided'),
];

