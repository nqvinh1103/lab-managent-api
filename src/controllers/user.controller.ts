import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { UserService } from '../services/user.service';

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
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.DB_SAVE_ERROR,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.CREATED,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to create user'
    });
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
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.DB_QUERY_ERROR,
        error: result.error
      });
      return;
    }

    const total = countResult.data || 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: result.data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get users'
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getUserService().findById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get user'
    });
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
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.DB_UPDATE_ERROR,  
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.UPDATED,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to update user'
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getUserService().deleteById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.DB_DELETE_ERROR,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.DELETED,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to delete user'
    });
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
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Failed to assign role',
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Role assigned successfully',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to assign role'
    });
  }
};

// Remove role from user
export const removeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, roleId } = req.params;

    const result = await getUserService().removeRole(id, roleId);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Failed to remove role',
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Role removed successfully',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to remove role'
    });
  }
};

// Lock user
export const lockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getUserService().lockUser(id);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Failed to lock user',
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User locked successfully',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to lock user'
    });
  }
};

// Unlock user
export const unlockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getUserService().unlockUser(id);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Failed to unlock user',
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User unlocked successfully',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to unlock user'
    });
  }
};
