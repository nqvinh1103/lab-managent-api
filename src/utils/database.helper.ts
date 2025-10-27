import { ObjectId } from 'mongodb';

/**
 * Safely convert a string to ObjectId
 * @param id - String ID to convert
 * @returns ObjectId instance or null if invalid
 */
export const toObjectId = (id: string | ObjectId): ObjectId | null => {
  try {
    if (id instanceof ObjectId) {
      return id;
    }
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      return new ObjectId(id);
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Validate if a string is a valid ObjectId
 * @param id - String to validate
 * @returns boolean indicating if the string is a valid ObjectId
 */
export const validateObjectId = (id: string): boolean => {
  return ObjectId.isValid(id);
};

/**
 * Convert ObjectId to string safely
 * @param id - ObjectId to convert
 * @returns string representation of ObjectId
 */
export const objectIdToString = (id: ObjectId | string): string => {
  if (typeof id === 'string') {
    return id;
  }
  return id.toString();
};

/**
 * Helper type for MongoDB query results
 */
export type QueryResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Helper type for MongoDB operation results
 */
export type OperationResult = {
  success: boolean;
  modifiedCount?: number;
  deletedCount?: number;
  upsertedId?: ObjectId;
  error?: string;
};

/**
 * Soft delete helper - sets deleted_at timestamp
 * @param userId - User ID performing the deletion
 * @returns MongoDB update object for soft delete
 */
export const setSoftDelete = (userId: ObjectId): object => {
  return {
    $set: {
      deleted_at: new Date(),
      updated_by: userId,
      updated_at: new Date()
    }
  };
};

/**
 * Push value to array field
 * @param field - Array field name
 * @param value - Value to push
 * @returns MongoDB update object
 */
export const pushToArray = (field: string, value: any): object => {
  return {
    $push: {
      [field]: value
    }
  };
};

/**
 * Pull value from array field
 * @param field - Array field name
 * @param condition - Condition to match for removal
 * @returns MongoDB update object
 */
export const pullFromArray = (field: string, condition: any): object => {
  return {
    $pull: {
      [field]: condition
    }
  };
};

/**
 * Create aggregation lookup stage
 * @param from - Collection to lookup from
 * @param localField - Field in current collection
 * @param foreignField - Field in foreign collection
 * @param as - Output field name
 * @returns MongoDB aggregation lookup stage
 */
export const createLookupStage = (from: string, localField: string, foreignField: string, as: string): object => {
  return {
    $lookup: {
      from,
      localField,
      foreignField,
      as
    }
  };
};

/**
 * Validate JSON field value
 * @param value - Value to validate
 * @returns boolean indicating if value is valid JSON
 */
export const validateJsonField = (value: any): boolean => {
  try {
    if (typeof value === 'object' && value !== null) {
      return true;
    }
    if (typeof value === 'string') {
      JSON.parse(value);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Create pagination options
 * @param page - Page number (1-based)
 * @param limit - Items per page
 * @returns MongoDB skip and limit values
 */
export const createPaginationOptions = (page: number = 1, limit: number = 10): { skip: number; limit: number } => {
  const skip = Math.max(0, (page - 1) * limit);
  return { skip, limit };
};

/**
 * Create sort options
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order (1 for ascending, -1 for descending)
 * @returns MongoDB sort object
 */
export const createSortOptions = (sortBy: string = 'created_at', sortOrder: 1 | -1 = -1): object => {
  return { [sortBy]: sortOrder };
};

/**
 * Create text search filter
 * @param searchTerm - Search term
 * @param fields - Fields to search in
 * @returns MongoDB text search filter
 */
export const createTextSearchFilter = (searchTerm: string, fields: string[]): object => {
  if (!searchTerm || !fields.length) {
    return {};
  }
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

/**
 * Create date range filter
 * @param startDate - Start date
 * @param endDate - End date
 * @param field - Date field name
 * @returns MongoDB date range filter
 */
export const createDateRangeFilter = (startDate?: Date, endDate?: Date, field: string = 'created_at'): object => {
  const filter: any = {};
  
  if (startDate || endDate) {
    filter[field] = {};
    if (startDate) {
      filter[field].$gte = startDate;
    }
    if (endDate) {
      filter[field].$lte = endDate;
    }
  }
  
  return filter;
};