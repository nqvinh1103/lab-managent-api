import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { UserService } from '../services/user.service';
import { logEvent } from '../utils/eventLog.helper';
import { handleCreateResult, handleGetResult, handleUpdateResult, handleDeleteResult, sendSuccessResponse, sendErrorResponse } from '../utils/response.helper';

let userService: UserService | null = null;

const getUserService = () => {
  if (!userService) {
    userService = new UserService();
  }
  return userService;
};
// Create user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = {
      ...req.body,
      created_by: req.user?.id ? new ObjectId(req.user.id) : undefined,
    };
    const result = await getUserService().create(userData);

    if (!result.success) {
      handleCreateResult(res, result);
      return;
    }

    // Log event
    await logEvent(
      'CREATE',
      'User',
      result.data!._id,
      req.user?.id,
      `Created user: ${result.data!.email} (${result.data!.full_name})`,
      { email: result.data!.email, full_name: result.data!.full_name }
    );

    sendSuccessResponse(res, HTTP_STATUS.CREATED, MESSAGES.CREATED, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to create user'
    );
  }
};

// Get all users with pagination
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getUserService().findAll((page - 1) * limit, limit);
    const countResult = await getUserService().count();

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        MESSAGES.DB_QUERY_ERROR,
        result.error
      );
      return;
    }

    const total = countResult.data || 0;

    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      MESSAGES.SUCCESS,
      result.data,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    );
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to get users'
    );
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getUserService().findById(id);

    if (!result.success) {
      handleGetResult(res, result, {
        notFoundMessage: MESSAGES.USER_NOT_FOUND
      });
      return;
    }

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.SUCCESS, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to get user'
    );
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.user?.id ? new ObjectId(req.user.id) : undefined
    };
    const result = await getUserService().findByIdAndUpdate(id, updateData);

    if (!result.success) {
      handleUpdateResult(res, result);
      return;
    }

    // Log event
    const changedFields = Object.keys(req.body).filter(key => !['updated_by'].includes(key));
    await logEvent(
      'UPDATE',
      'User',
      id,
      req.user?.id,
      `Updated user: ${result.data!.email} - changed: ${changedFields.join(', ')}`,
      { 
        changed_fields: changedFields,
        email: result.data!.email 
      }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.UPDATED, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to update user'
    );
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Fetch user info before delete
    const userResult = await getUserService().findById(id);
    const userInfo = userResult.data;
    
    const result = await getUserService().deleteById(id);

    if (!result.success) {
      handleDeleteResult(res, result);
      return;
    }

    // Log event
    await logEvent(
      'DELETE',
      'User',
      id,
      req.user?.id,
      `Deleted user: ${userInfo?.email} (${userInfo?.full_name})`,
      { email: userInfo?.email, full_name: userInfo?.full_name }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.DELETED, { deletedCount: result.deletedCount });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to delete user'
    );
  }
};

// Assign role to user
export const assignRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    const createdBy = req.user?.id ? new ObjectId(req.user.id) : undefined;

    const result = await getUserService().assignRole(id, roleId, createdBy);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        'Failed to assign role',
        result.error
      );
      return;
    }

    // Log event
    const userResult = await getUserService().findById(id);
    await logEvent(
      'UPDATE',
      'User',
      id,
      req.user?.id,
      `Assigned role to user: ${userResult.data?.email}`,
      { roleId, email: userResult.data?.email }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, 'Role assigned successfully', { modifiedCount: result.modifiedCount });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to assign role'
    );
  }
};

// Remove role from user
export const removeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, roleId } = req.params;

    const result = await getUserService().removeRole(id, roleId);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        'Failed to remove role',
        result.error
      );
      return;
    }

    // Log event
    const userResult = await getUserService().findById(id);
    await logEvent(
      'UPDATE',
      'User',
      id,
      req.user?.id,
      `Removed role from user: ${userResult.data?.email}`,
      { roleId, email: userResult.data?.email }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, 'Role removed successfully', { modifiedCount: result.modifiedCount });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to remove role'
    );
  }
};

// Lock user
export const lockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getUserService().lockUser(id);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        'Failed to lock user',
        result.error
      );
      return;
    }

    // Log event
    const userResult = await getUserService().findById(id);
    await logEvent(
      'UPDATE',
      'User',
      id,
      req.user?.id,
      `Locked user: ${userResult.data?.email}`,
      { email: userResult.data?.email }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, 'User locked successfully', { modifiedCount: result.modifiedCount });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to lock user'
    );
  }
};

// Unlock user
export const unlockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getUserService().unlockUser(id);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        'Failed to unlock user',
        result.error
      );
      return;
    }

    // Log event
    const userResult = await getUserService().findById(id);
    await logEvent(
      'UPDATE',
      'User',
      id,
      req.user?.id,
      `Unlocked user: ${userResult.data?.email}`,
      { email: userResult.data?.email }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, 'User unlocked successfully', { modifiedCount: result.modifiedCount });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to unlock user'
    );
  }
};
