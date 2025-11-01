import { body, param } from 'express-validator';

export const instrumentReagentIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Instrument Reagent ID is required')
    .isMongoId()
    .withMessage('Invalid Instrument Reagent ID format')
];

export const createInstrumentReagentValidation = [
  body('instrument_id')
    .notEmpty()
    .withMessage('Instrument ID is required')
    .isMongoId()
    .withMessage('Invalid instrument ID format'),
  body('reagent_inventory_id')
    .notEmpty()
    .withMessage('Reagent Inventory ID is required')
    .isMongoId()
    .withMessage('Invalid reagent inventory ID format'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than zero'),
  // Note: quantity_remaining will be automatically set to quantity when first installed
  // Note: installed_at and installed_by are automatically set by the system
  // Note: reagent_lot_number and other fields are populated from ReagentInventory
];

export const updateInstrumentReagentValidation = [
  param('id')
    .notEmpty()
    .withMessage('Instrument Reagent ID is required')
    .isMongoId()
    .withMessage('Invalid Instrument Reagent ID format'),
  body('quantity')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than zero'),
  body('quantity_remaining')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity remaining must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['in_use', 'not_in_use', 'expired'])
    .withMessage('Status must be one of: in_use, not_in_use, expired')
];

export const updateReagentStatusValidation = [
  param('id')
    .notEmpty()
    .withMessage('Instrument Reagent ID is required')
    .isMongoId()
    .withMessage('Invalid Instrument Reagent ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['in_use', 'not_in_use', 'expired'])
    .withMessage('Status must be one of: in_use, not_in_use, expired')
];

