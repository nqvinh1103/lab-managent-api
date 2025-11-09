import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ApiResponse, PaginatedResponse } from '../type.d';
import { QueryResult, OperationResult } from './database.helper';

/**
 * Send success response
 */
export const sendSuccessResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  pagination?: PaginatedResponse<T>['pagination']
): void => {
  const response: ApiResponse<T> | PaginatedResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination })
  };
  res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  error?: string
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error && { error })
  };
  res.status(statusCode).json(response);
};

/**
 * Handle service result and send appropriate response
 * Automatically handles success/error cases from QueryResult or OperationResult
 */
export const handleServiceResult = <T>(
  res: Response,
  result: QueryResult<T> | OperationResult,
  options?: {
    successMessage?: string;
    successStatusCode?: number;
    defaultErrorMessage?: string;
    defaultErrorStatusCode?: number;
  }
): void => {
  if (result.success) {
    // Success case
    const statusCode = options?.successStatusCode || HTTP_STATUS.OK;
    const message = options?.successMessage || MESSAGES.SUCCESS;
    
    // Check if result has data (QueryResult) or operation counts (OperationResult)
    if ('data' in result && result.data !== undefined) {
      sendSuccessResponse(res, statusCode, message, result.data);
    } else {
      // OperationResult - just send success message
      sendSuccessResponse(res, statusCode, message);
    }
    return;
  }

  // Error case
  const statusCode = result.statusCode || options?.defaultErrorStatusCode || HTTP_STATUS.BAD_REQUEST;
  const message = options?.defaultErrorMessage || result.error || MESSAGES.INTERNAL_ERROR;
  const error = result.error || message;

  sendErrorResponse(res, statusCode, message, error);
};

/**
 * Handle service result for creation operations (returns 201)
 */
export const handleCreateResult = <T>(
  res: Response,
  result: QueryResult<T>,
  options?: {
    successMessage?: string;
    defaultErrorMessage?: string;
  }
): void => {
  handleServiceResult(res, result, {
    successMessage: options?.successMessage || MESSAGES.CREATED,
    successStatusCode: HTTP_STATUS.CREATED,
    defaultErrorMessage: options?.defaultErrorMessage || MESSAGES.DB_SAVE_ERROR
  });
};

/**
 * Handle service result for update operations
 */
export const handleUpdateResult = <T>(
  res: Response,
  result: QueryResult<T> | OperationResult,
  options?: {
    successMessage?: string;
    defaultErrorMessage?: string;
  }
): void => {
  handleServiceResult(res, result, {
    successMessage: options?.successMessage || MESSAGES.UPDATED,
    successStatusCode: HTTP_STATUS.OK,
    defaultErrorMessage: options?.defaultErrorMessage || MESSAGES.DB_UPDATE_ERROR
  });
};

/**
 * Handle service result for delete operations
 */
export const handleDeleteResult = (
  res: Response,
  result: OperationResult,
  options?: {
    successMessage?: string;
    defaultErrorMessage?: string;
  }
): void => {
  handleServiceResult(res, result, {
    successMessage: options?.successMessage || MESSAGES.DELETED,
    successStatusCode: HTTP_STATUS.OK,
    defaultErrorMessage: options?.defaultErrorMessage || MESSAGES.DB_DELETE_ERROR
  });
};

/**
 * Handle service result for get operations (handles 404 for not found)
 */
export const handleGetResult = <T>(
  res: Response,
  result: QueryResult<T>,
  options?: {
    successMessage?: string;
    defaultErrorMessage?: string;
    notFoundMessage?: string;
  }
): void => {
  if (!result.success) {
    // Check if it's a not found case
    const isNotFound = 
      result.statusCode === HTTP_STATUS.NOT_FOUND ||
      result.error?.toLowerCase().includes('not found') ||
      result.error?.toLowerCase().includes('not found');

    if (isNotFound) {
      sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        options?.notFoundMessage || MESSAGES.NOT_FOUND,
        result.error
      );
      return;
    }
  }

  handleServiceResult(res, result, {
    successMessage: options?.successMessage || MESSAGES.SUCCESS,
    successStatusCode: HTTP_STATUS.OK,
    defaultErrorMessage: options?.defaultErrorMessage || MESSAGES.DB_QUERY_ERROR
  });
};

