import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { HTTP_STATUS } from '../constants/httpStatus'
import { MESSAGES } from '../constants/messages'

export const validationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }))

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      error: 'Validation failed',
      details: errorMessages
    })
    return
  }

  next()
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
