import { body, param, query } from 'express-validator';

export const createRoleValidation = [
  body('role_name')
    .notEmpty().withMessage('Role name is required')
    .trim()
    .isLength({ min: 2 }).withMessage('Role name must be at least 2 characters'),
  body('role_code')
    .notEmpty().withMessage('Role code is required')
    .trim()
    .isUppercase().withMessage('Role code must be uppercase')
    .matches(/^[A-Z0-9_]+$/).withMessage('Role code must contain only uppercase letters, numbers, and underscores'),
  body('role_description')
    .optional()
    .trim(),
  body('privilege_ids')
    .optional()
    .isArray().withMessage('privilege_ids must be an array'),
  body('created_by')
    .notEmpty().withMessage('created_by is required'),
  body('updated_by')
    .notEmpty().withMessage('updated_by is required')
];

export const updateRoleValidation = [
  param('id')
    .notEmpty().withMessage('Role ID is required')
    .isMongoId().withMessage('Invalid role ID format'),
  body('role_name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Role name must be at least 2 characters'),
  body('role_code')
    .optional()
    .trim()
    .isUppercase().withMessage('Role code must be uppercase')
    .matches(/^[A-Z0-9_]+$/).withMessage('Role code must contain only uppercase letters, numbers, and underscores'),
  body('role_description')
    .optional()
    .trim(),
  body('updated_by')
    .notEmpty().withMessage('updated_by is required')
];

export const roleIdValidation = [
  param('id')
    .notEmpty().withMessage('Role ID is required')
    .isMongoId().withMessage('Invalid role ID format')
];

export const assignPrivilegeValidation = [
  param('id')
    .notEmpty().withMessage('Role ID is required')
    .isMongoId().withMessage('Invalid role ID format'),
  body('privilegeId')
    .notEmpty().withMessage('Privilege ID is required')
    .isMongoId().withMessage('Invalid privilege ID format')
];

export const searchRoleValidation = [
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
