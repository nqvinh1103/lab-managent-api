import { Request, Response } from 'express';
import { getCollection } from '../config/database';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { PrivilegeDocument } from '../models/Privilege';
import { RoleService } from '../services/role.service';

let roleService: RoleService | null = null;

const getRoleService = () => {
  if (!roleService) {
    roleService = new RoleService();
  }
  return roleService;
};

// Create role
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getRoleService().create(req.body);

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
      error: error instanceof Error ? error.message : 'Failed to create role'
    });
  }
};

// Get all roles with pagination
export const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getRoleService().findAll(page, limit);
    const countResult = await getRoleService().count();

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
      error: error instanceof Error ? error.message : 'Failed to get roles'
    });
  }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getRoleService().findById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NOT_FOUND,
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
      error: error instanceof Error ? error.message : 'Failed to get role'
    });
  }
};

// Get role with populated privileges
export const getRoleWithPrivileges = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const roleResult = await getRoleService().findById(id);

    if (!roleResult.success || !roleResult.data) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NOT_FOUND,
        error: 'Role not found'
      });
      return;
    }

    const role = roleResult.data;
    
    // Fetch privileges
    const privilegeCollection = getCollection<PrivilegeDocument>('privileges');
    const privileges = await privilegeCollection
      .find({ _id: { $in: role.privilege_ids } })
      .toArray();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: {
        ...role,
        privileges
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get role with privileges'
    });
  }
};

// Update role
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getRoleService().findByIdAndUpdate(id, req.body);

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
      error: error instanceof Error ? error.message : 'Failed to update role'
    });
  }
};

// Delete role
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getRoleService().deleteById(id);

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
      error: error instanceof Error ? error.message : 'Failed to delete role'
    });
  }
};

// Assign privilege to role
export const assignPrivilege = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { privilegeId } = req.body;

    const result = await getRoleService().assignPrivilege(id, privilegeId);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Failed to assign privilege',
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Privilege assigned successfully',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to assign privilege'
    });
  }
};

// Remove privilege from role
export const removePrivilege = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, privilegeId } = req.params;

    const result = await getRoleService().removePrivilege(id, privilegeId);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Failed to remove privilege',
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Privilege removed successfully',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to remove privilege'
    });
  }
};
