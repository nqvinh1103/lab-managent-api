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

export const forgotPasswordValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isString().withMessage('Email must be a string')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Reset token is required')
    .isString().withMessage('Token must be a string')
    .isLength({ min: 64 }).withMessage('Invalid token format'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)')
];

