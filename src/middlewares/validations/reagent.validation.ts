import { param, body } from 'express-validator';

export const reagentIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Reagent ID is required')
    .isMongoId()
    .withMessage('Invalid reagent ID format')
];

export const updateReagentMetadataValidation = [
  param('id')
    .notEmpty()
    .withMessage('Reagent ID is required')
    .isMongoId()
    .withMessage('Invalid reagent ID format'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('usage_per_run_min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Usage per run minimum must be a positive number'),
  body('usage_per_run_max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Usage per run maximum must be a positive number'),
  body('usage_unit')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Usage unit cannot be empty'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

