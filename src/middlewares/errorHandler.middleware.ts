import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '../constants/httpStatus'
import { MESSAGES } from '../constants/messages'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
  let message = error.message || MESSAGES.INTERNAL_ERROR

  if (error.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST
    message = MESSAGES.VALIDATION_ERROR
  }

  // Mongoose duplicate key error
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT
    message = MESSAGES.CONFLICT
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST
    message = 'Invalid ID format'
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED
    message = MESSAGES.TOKEN_INVALID
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED
    message = MESSAGES.TOKEN_EXPIRED
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error)
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found'
  })
}
