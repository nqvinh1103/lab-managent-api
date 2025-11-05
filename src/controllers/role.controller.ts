import { Request, Response } from 'express';
import { getCollection } from '../config/database';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { PrivilegeDocument } from '../models/Privilege';
import { RoleService } from '../services/role.service';
import { logEvent } from '../utils/eventLog.helper';
import { handleCreateResult, handleGetResult, handleUpdateResult, handleDeleteResult, sendSuccessResponse, sendErrorResponse } from '../utils/response.helper';

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
    if (!req.user?.id) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    const result = await getRoleService().create(req.body, req.user.id);

    if (!result.success) {
      handleCreateResult(res, result);
      return;
    }

    // Log event
    await logEvent(
      'CREATE',
      'Role',
      result.data!._id,
      req.user.id,
      `Created role: ${result.data!.role_name} (${result.data!.role_code})`,
      { role_name: result.data!.role_name, role_code: result.data!.role_code }
    );

    sendSuccessResponse(res, HTTP_STATUS.CREATED, MESSAGES.CREATED, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to create role'
    );
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
      error instanceof Error ? error.message : 'Failed to get roles'
    );
  }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getRoleService().findById(id);

    if (!result.success) {
      handleGetResult(res, result);
      return;
    }

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.SUCCESS, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to get role'
    );
  }
};

// Get role with populated privileges
export const getRoleWithPrivileges = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const roleResult = await getRoleService().findById(id);

    if (!roleResult.success || !roleResult.data) {
      handleGetResult(res, roleResult, {
        notFoundMessage: 'Role not found'
      });
      return;
    }

    const role = roleResult.data;
    
    // Fetch privileges
    const privilegeCollection = getCollection<PrivilegeDocument>('privileges');
    const privileges = await privilegeCollection
      .find({ _id: { $in: role.privilege_ids } })
      .toArray();

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.SUCCESS, {
      ...role,
      privileges
    });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to get role with privileges'
    );
  }
};

// Update role
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    const { id } = req.params;
    const result = await getRoleService().findByIdAndUpdate(id, req.body, req.user.id);

    if (!result.success) {
      handleUpdateResult(res, result);
      return;
    }

    // Log event
    const changedFields = Object.keys(req.body).filter(key => !['updated_by'].includes(key));
    await logEvent(
      'UPDATE',
      'Role',
      id,
      req.user.id,
      `Updated role: ${result.data!.role_name} - changed: ${changedFields.join(', ')}`,
      { changed_fields: changedFields, role_name: result.data!.role_name }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.UPDATED, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to update role'
    );
  }
};

// Delete role
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Fetch role info before delete
    const roleResult = await getRoleService().findById(id);
    const roleInfo = roleResult.data;
    
    const result = await getRoleService().deleteById(id);

    if (!result.success) {
      handleDeleteResult(res, result);
      return;
    }

    // Log event
    await logEvent(
      'DELETE',
      'Role',
      id,
      (req as any).user?.id,
      `Deleted role: ${roleInfo?.role_name} (${roleInfo?.role_code})`,
      { role_name: roleInfo?.role_name, role_code: roleInfo?.role_code }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.DELETED, { deletedCount: result.deletedCount });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to delete role'
    );
  }
};

// Assign privilege to role
export const assignPrivilege = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { privilegeId } = req.body;

    const result = await getRoleService().assignPrivilege(id, privilegeId);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        'Failed to assign privilege',
        result.error
      );
      return;
    }

    // Log event
    const roleResult = await getRoleService().findById(id);
    await logEvent(
      'UPDATE',
      'Role',
      id,
      (req as any).user?.id,
      `Assigned privilege to role: ${roleResult.data?.role_name}`,
      { privilegeId, role_name: roleResult.data?.role_name }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, 'Privilege assigned successfully', { modifiedCount: result.modifiedCount });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to assign privilege'
    );
  }
};

// Remove privilege from role
export const removePrivilege = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, privilegeId } = req.params;

    const result = await getRoleService().removePrivilege(id, privilegeId);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        'Failed to remove privilege',
        result.error
      );
      return;
    }

    // Log event
    const roleResult = await getRoleService().findById(id);
    await logEvent(
      'UPDATE',
      'Role',
      id,
      (req as any).user?.id,
      `Removed privilege from role: ${roleResult.data?.role_name}`,
      { privilegeId, role_name: roleResult.data?.role_name }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, 'Privilege removed successfully', { modifiedCount: result.modifiedCount });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to remove privilege'
    );
  }
};
