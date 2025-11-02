export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
    // Capture stack trace where available
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor as any);
    }
  }
}

export const badRequest = (message: string, details?: any) => new ApiError(400, message, details);
export const internal = (message: string, details?: any) => new ApiError(500, message, details);
