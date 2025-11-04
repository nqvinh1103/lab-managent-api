import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { FlaggingConfigurationService } from '../services/flaggingConfiguration.service';
import { logEvent } from '../utils/eventLog.helper';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

let flaggingConfigurationService: FlaggingConfigurationService | null = null;

const getFlaggingConfigurationService = () => {
  if (!flaggingConfigurationService) {
    flaggingConfigurationService = new FlaggingConfigurationService();
  }
  return flaggingConfigurationService;
};

// Create flagging configuration
export const createFlaggingConfiguration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const configData = {
      ...req.body,
      created_by: new ObjectId(req.user.id),
      updated_by: new ObjectId(req.user.id)
    };

    const result = await getFlaggingConfigurationService().create(configData);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.DB_SAVE_ERROR,
        error: result.error
      });
      return;
    }

    // Log event
    await logEvent(
      'CREATE',
      'FlaggingConfiguration',
      result.data!._id,
      req.user.id,
      `Created flagging configuration for parameter ${result.data!.parameter_id} (${result.data!.flag_type})`,
      { 
        parameter_id: result.data!.parameter_id.toString(), 
        flag_type: result.data!.flag_type,
        gender: result.data!.gender,
        age_group: result.data!.age_group
      }
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.CREATED,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to create flagging configuration'
    });
  }
};

// Get all flagging configurations with pagination and filters
export const getAllFlaggingConfigurations = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const parameter_id = req.query.parameter_id as string | undefined;
    const gender = req.query.gender as 'male' | 'female' | undefined;
    const age_group = req.query.age_group as string | undefined;
    const is_active = req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined;

    const result = await getFlaggingConfigurationService().findAll(page, limit, parameter_id, gender, age_group, is_active);

    if (!result.success) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.DB_QUERY_ERROR,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: result.data!.flagging_configurations,
      pagination: {
        page,
        limit,
        total: result.data!.total,
        totalPages: Math.ceil(result.data!.total / limit)
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get flagging configurations'
    });
  }
};

// Get flagging configuration by ID
export const getFlaggingConfigurationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getFlaggingConfigurationService().findById(id);

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
      error: error instanceof Error ? error.message : 'Failed to get flagging configuration'
    });
  }
};

// Update flagging configuration
export const updateFlaggingConfiguration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: new ObjectId(req.user.id)
    };

    const result = await getFlaggingConfigurationService().findByIdAndUpdate(id, updateData);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.DB_UPDATE_ERROR,
        error: result.error
      });
      return;
    }

    // Log event - track changed fields
    const changedFields = Object.keys(req.body).filter(key => key !== 'updated_by');
    await logEvent(
      'UPDATE',
      'FlaggingConfiguration',
      result.data!._id,
      req.user.id,
      `Updated flagging configuration for parameter ${result.data!.parameter_id} (${result.data!.flag_type}) - changed: ${changedFields.join(', ')}`,
      { 
        parameter_id: result.data!.parameter_id.toString(), 
        flag_type: result.data!.flag_type,
        changed_fields: changedFields
      }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.UPDATED,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to update flagging configuration'
    });
  }
};

// Delete flagging configuration
export const deleteFlaggingConfiguration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { id } = req.params;
    
    // Get configuration info before delete for logging
    const configResult = await getFlaggingConfigurationService().findById(id);
    if (!configResult.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NOT_FOUND,
        error: configResult.error
      });
      return;
    }

    const result = await getFlaggingConfigurationService().deleteById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.DB_DELETE_ERROR,
        error: result.error
      });
      return;
    }

    // Log event
    await logEvent(
      'DELETE',
      'FlaggingConfiguration',
      id,
      req.user.id,
      `Deleted flagging configuration for parameter ${configResult.data!.parameter_id} (${configResult.data!.flag_type})`,
      { 
        parameter_id: configResult.data!.parameter_id.toString(), 
        flag_type: configResult.data!.flag_type
      }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.DELETED
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to delete flagging configuration'
    });
  }
};

// Sync-up flagging configurations (bulk create/update)
export const syncFlaggingConfigurations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { configurations } = req.body;

    if (!Array.isArray(configurations) || configurations.length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'configurations must be a non-empty array'
      });
      return;
    }

    // Add created_by and updated_by to each configuration
    const configsWithUser = configurations.map((config: any) => ({
      ...config,
      created_by: new ObjectId(req.user!.id),
      updated_by: new ObjectId(req.user!.id)
    }));

    const result = await getFlaggingConfigurationService().sync(configsWithUser);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.DB_SAVE_ERROR,
        error: result.error
      });
      return;
    }

    // Log event
    await logEvent(
      'SYNC',
      'FlaggingConfiguration',
      null,
      req.user.id,
      `Synced flagging configurations: ${result.data!.created} created, ${result.data!.updated} updated, ${result.data!.failed} failed`,
      { 
        created: result.data!.created,
        updated: result.data!.updated,
        failed: result.data!.failed,
        errors: result.data!.errors
      }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Flagging configurations synced successfully',
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to sync flagging configurations'
    });
  }
};

