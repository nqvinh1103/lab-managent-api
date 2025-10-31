import { body, param, query } from 'express-validator';

export const createVendorSupplyValidation = [
  body('reagent_name')
    .notEmpty().withMessage('Reagent name is required')
    .trim(),
  body('vendor_name')
    .notEmpty().withMessage('Vendor name is required')
    .trim(),
  body('receipt_date')
    .notEmpty().withMessage('Receipt date is required')
    .isISO8601().withMessage('Receipt date must be a valid date'),
  body('quantity_received')
    .notEmpty().withMessage('Quantity received is required')
    .isNumeric().withMessage('Quantity received must be a number')
    .custom((value) => value > 0).withMessage('Quantity received must be greater than 0'),
  body('lot_number')
    .notEmpty().withMessage('Lot number is required')
    .trim(),
  body('expiration_date')
    .notEmpty().withMessage('Expiration date is required')
    .isISO8601().withMessage('Expiration date must be a valid date'),
  body('received_by')
    .notEmpty().withMessage('received_by is required')
    .isMongoId().withMessage('received_by must be a valid MongoDB ID')
];

export const vendorSupplyIdValidation = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID format')
];

export const searchVendorSupplyValidation = [
  query('reagent_name')
    .optional()
    .trim(),
  query('vendor_name')
    .optional()
    .trim(),
  query('lot_number')
    .optional()
    .trim(),
  query('start_date')
    .optional()
    .isISO8601().withMessage('start_date must be a valid date'),
  query('end_date')
    .optional()
    .isISO8601().withMessage('end_date must be a valid date'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

