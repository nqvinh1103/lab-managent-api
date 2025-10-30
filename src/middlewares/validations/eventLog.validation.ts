import { param, query } from 'express-validator';

export const eventLogIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event log ID format')
];

export const eventLogQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('entity_type')
    .optional()
    .isString()
    .withMessage('Entity type must be a string'),
  query('action_type')
    .optional()
    .isIn(['CREATE', 'UPDATE', 'DELETE'])
    .withMessage('Action type must be CREATE, UPDATE, or DELETE'),
  query('performed_by')
    .optional()
    .isMongoId()
    .withMessage('Performed by must be a valid MongoDB ID'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

