import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { HTTP_STATUS } from '../constants/httpStatus'
import { sendErrorResponse } from '../utils/response.helper'

export const validationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    // Get the first error message (most specific)
    const firstError = errors.array()[0]
    const errorMessage = firstError?.msg || 'Validation failed'

    // Send error response with consistent format
    sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, errorMessage, errorMessage)
    return
  }

  next()
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
