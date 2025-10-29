import { body } from 'express-validator';

export const changePasswordValidation = [
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

