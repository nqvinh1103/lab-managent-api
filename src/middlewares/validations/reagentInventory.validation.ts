import { body, param, query } from 'express-validator';

export const reagentInventoryIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Inventory ID is required')
    .isMongoId()
    .withMessage('Invalid inventory ID format')
];

export const createReagentInventoryValidation = [
  body('reagent_id')
    .notEmpty()
    .withMessage('Reagent ID is required')
    .isMongoId()
    .withMessage('Invalid reagent ID format'),
  body('vendor_name')
    .notEmpty()
    .withMessage('Vendor name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Vendor name must be at least 2 characters'),
  body('receipt_date')
    .notEmpty()
    .withMessage('Receipt date is required')
    .isISO8601()
    .withMessage('Receipt date must be a valid ISO8601 date'),
  body('quantity_received')
    .notEmpty()
    .withMessage('Quantity received is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity received must be greater than zero'),
  body('unit_of_measure')
    .notEmpty()
    .withMessage('Unit of measure is required')
    .trim(),
  body('lot_number')
    .notEmpty()
    .withMessage('Lot number is required')
    .trim(),
  body('expiration_date')
    .notEmpty()
    .withMessage('Expiration date is required')
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO8601 date')
    .custom((value: string) => {
      const expDate = new Date(value);
      const now = new Date();
      if (expDate <= now) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Received', 'Partial Shipment', 'Returned'])
    .withMessage('Status must be one of: Received, Partial Shipment, Returned'),
  body('returned_reason')
    .optional()
    .trim()
    .custom((value: string, { req }) => {
      if (req.body.status === 'Returned' && !value) {
        throw new Error('returned_reason is required when status is "Returned"');
      }
      return true;
    }),
  body('quantity_ordered')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Quantity ordered must be greater than zero'),
  body('po_number')
    .optional()
    .trim(),
  body('order_date')
    .optional()
    .isISO8601()
    .withMessage('Order date must be a valid ISO8601 date'),
  body('catalog_number')
    .optional()
    .trim(),
  body('manufacturer')
    .optional()
    .trim(),
  body('cas_number')
    .optional()
    .trim(),
  body('initial_storage_location')
    .optional()
    .trim()
];

export const updateReagentInventoryValidation = [
  param('id')
    .notEmpty()
    .withMessage('Inventory ID is required')
    .isMongoId()
    .withMessage('Invalid inventory ID format'),
  body('expiration_date')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO8601 date')
    .custom((value: string) => {
      const expDate = new Date(value);
      const now = new Date();
      if (expDate <= now) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),
  body('quantity_received')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Quantity received must be greater than zero'),
  body('status')
    .optional()
    .isIn(['Received', 'Partial Shipment', 'Returned'])
    .withMessage('Status must be one of: Received, Partial Shipment, Returned'),
  body('returned_reason')
    .optional()
    .trim()
    .custom((value: string, { req }) => {
      if (req.body.status === 'Returned' && !value) {
        throw new Error('returned_reason is required when status is "Returned"');
      }
      return true;
    })
];

export const updateReagentInventoryStockValidation = [
  param('id')
    .notEmpty()
    .withMessage('Inventory ID is required')
    .isMongoId()
    .withMessage('Invalid inventory ID format'),
  body('quantity_in_stock')
    .notEmpty()
    .withMessage('Quantity in stock is required')
    .isFloat({ min: 0 })
    .withMessage('Quantity in stock must be a non-negative number')
];

export const updateReagentInventoryStatusValidation = [
  param('id')
    .notEmpty()
    .withMessage('Inventory ID is required')
    .isMongoId()
    .withMessage('Invalid inventory ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Received', 'Partial Shipment', 'Returned'])
    .withMessage('Status must be one of: Received, Partial Shipment, Returned'),
  body('returned_reason')
    .optional()
    .trim()
    .custom((value: string, { req }) => {
      if (req.body.status === 'Returned' && !value) {
        throw new Error('returned_reason is required when status is "Returned"');
      }
      return true;
    })
];

