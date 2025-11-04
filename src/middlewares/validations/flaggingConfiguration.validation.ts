import { body, param, query } from 'express-validator';

export const createFlaggingConfigurationValidation = [
  body('parameter_id')
    .notEmpty().withMessage('parameter_id is required')
    .isMongoId().withMessage('Invalid parameter_id format'),
  body('reference_range_min')
    .notEmpty().withMessage('reference_range_min is required')
    .isNumeric().withMessage('reference_range_min must be a number'),
  body('reference_range_max')
    .notEmpty().withMessage('reference_range_max is required')
    .isNumeric().withMessage('reference_range_max must be a number')
    .custom((value, { req }) => {
      if (req.body.reference_range_min !== undefined && value <= req.body.reference_range_min) {
        throw new Error('reference_range_max must be greater than reference_range_min');
      }
      return true;
    }),
  body('flag_type')
    .notEmpty().withMessage('flag_type is required')
    .isIn(['critical', 'warning', 'info']).withMessage('flag_type must be one of: critical, warning, info'),
  body('is_active')
    .notEmpty().withMessage('is_active is required')
    .isBoolean().withMessage('is_active must be a boolean'),
  body('gender')
    .optional()
    .isIn(['male', 'female']).withMessage('gender must be either male or female'),
  body('age_group')
    .optional()
    .trim()
    .isString().withMessage('age_group must be a string'),
  body('created_by')
    .notEmpty().withMessage('created_by is required')
    .isMongoId().withMessage('Invalid created_by format'),
  body('updated_by')
    .notEmpty().withMessage('updated_by is required')
    .isMongoId().withMessage('Invalid updated_by format')
];

export const updateFlaggingConfigurationValidation = [
  param('id')
    .notEmpty().withMessage('Flagging configuration ID is required')
    .isMongoId().withMessage('Invalid flagging configuration ID format'),
  body('parameter_id')
    .optional()
    .isMongoId().withMessage('Invalid parameter_id format'),
  body('reference_range_min')
    .optional()
    .isNumeric().withMessage('reference_range_min must be a number'),
  body('reference_range_max')
    .optional()
    .isNumeric().withMessage('reference_range_max must be a number')
    .custom((value, { req }) => {
      // Only validate if both min and max are provided
      if (req.body.reference_range_min !== undefined && value !== undefined) {
        if (value <= req.body.reference_range_min) {
          throw new Error('reference_range_max must be greater than reference_range_min');
        }
      }
      return true;
    }),
  body('flag_type')
    .optional()
    .isIn(['critical', 'warning', 'info']).withMessage('flag_type must be one of: critical, warning, info'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean'),
  body('gender')
    .optional()
    .isIn(['male', 'female']).withMessage('gender must be either male or female'),
  body('age_group')
    .optional()
    .trim()
    .isString().withMessage('age_group must be a string'),
  body('updated_by')
    .notEmpty().withMessage('updated_by is required')
    .isMongoId().withMessage('Invalid updated_by format')
];

export const flaggingConfigurationIdValidation = [
  param('id')
    .notEmpty().withMessage('Flagging configuration ID is required')
    .isMongoId().withMessage('Invalid flagging configuration ID format')
];

export const searchFlaggingConfigurationValidation = [
  query('parameter_id')
    .optional()
    .isMongoId().withMessage('Invalid parameter_id format'),
  query('gender')
    .optional()
    .isIn(['male', 'female']).withMessage('gender must be either male or female'),
  query('age_group')
    .optional()
    .trim(),
  query('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

export const syncFlaggingConfigurationValidation = [
  body('configurations')
    .notEmpty().withMessage('configurations array is required')
    .isArray({ min: 1 }).withMessage('configurations must be a non-empty array'),
  body('configurations.*.parameter_id')
    .notEmpty().withMessage('parameter_id is required for each configuration')
    .isMongoId().withMessage('Invalid parameter_id format'),
  body('configurations.*.reference_range_min')
    .notEmpty().withMessage('reference_range_min is required for each configuration')
    .isNumeric().withMessage('reference_range_min must be a number'),
  body('configurations.*.reference_range_max')
    .notEmpty().withMessage('reference_range_max is required for each configuration')
    .isNumeric().withMessage('reference_range_max must be a number')
    .custom((value, { req, path }) => {
      // Extract index from path (e.g., "configurations.0.reference_range_max")
      const match = path.match(/configurations\.(\d+)\.reference_range_max/);
      if (match && req.body.configurations) {
        const index = parseInt(match[1]);
        const config = req.body.configurations[index];
        if (config.reference_range_min !== undefined && value <= config.reference_range_min) {
          throw new Error('reference_range_max must be greater than reference_range_min');
        }
      }
      return true;
    }),
  body('configurations.*.flag_type')
    .notEmpty().withMessage('flag_type is required for each configuration')
    .isIn(['critical', 'warning', 'info']).withMessage('flag_type must be one of: critical, warning, info'),
  body('configurations.*.is_active')
    .notEmpty().withMessage('is_active is required for each configuration')
    .isBoolean().withMessage('is_active must be a boolean'),
  body('configurations.*.gender')
    .optional()
    .isIn(['male', 'female']).withMessage('gender must be either male or female'),
  body('configurations.*.age_group')
    .optional()
    .trim()
    .isString().withMessage('age_group must be a string')
];

