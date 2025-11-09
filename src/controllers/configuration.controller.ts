import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ConfigurationService } from '../services/configuration.service';
import { logEvent } from '../utils/eventLog.helper';
import { handleCreateResult, handleGetResult, handleUpdateResult, handleDeleteResult, sendSuccessResponse, sendErrorResponse } from '../utils/response.helper';

let configurationService: ConfigurationService | null = null;

const getConfigurationService = () => {
  if (!configurationService) {
    configurationService = new ConfigurationService();
  }
  return configurationService;
};

// Create configuration
export const createConfiguration = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    const configData = {
      ...req.body,
      created_by: new ObjectId(req.user.id),
      updated_by: new ObjectId(req.user.id)
    };
    
    const result = await getConfigurationService().create(configData);

    if (!result.success) {
      handleCreateResult(res, result);
      return;
    }

    // Log event
    await logEvent(
      'CREATE',
      'Configuration',
      result.data!._id.toString(),
      req.user.id,
      `Created configuration: ${result.data!.config_name}`,
      { 
        config_key: result.data!.config_key,
        category: result.data!.category,
        instrument_type: result.data!.instrument_type
      }
    );

    sendSuccessResponse(res, HTTP_STATUS.CREATED, MESSAGES.CREATED, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to create configuration'
    );
  }
};

// Get all configurations
export const getAllConfigurations = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string | undefined;
    const instrument_type = req.query.instrument_type as string | undefined;

    const result = await getConfigurationService().findAll(page, limit, category, instrument_type);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        MESSAGES.DB_QUERY_ERROR,
        result.error
      );
      return;
    }

    const { configurations, total } = result.data!;

    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      MESSAGES.SUCCESS,
      configurations,
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
      error instanceof Error ? error.message : 'Failed to get configurations'
    );
  }
};

// Get configuration by ID
export const getConfigurationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getConfigurationService().findById(id);

    if (!result.success) {
      handleGetResult(res, result, {
        notFoundMessage: result.error || 'Configuration not found'
      });
      return;
    }

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.SUCCESS, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to get configuration'
    );
  }
};

// Update configuration
export const updateConfiguration = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: new ObjectId(req.user.id)
    };

    const result = await getConfigurationService().findByIdAndUpdate(id, updateData);

    if (!result.success) {
      handleUpdateResult(res, result);
      return;
    }

    // Log event
    const changedFields = Object.keys(req.body).filter(key => !['updated_by'].includes(key));
    await logEvent(
      'UPDATE',
      'Configuration',
      id,
      req.user.id,
      `Updated configuration: ${result.data!.config_name} - changed: ${changedFields.join(', ')}`,
      { 
        changed_fields: changedFields,
        config_key: result.data!.config_key,
        category: result.data!.category,
        instrument_type: result.data!.instrument_type
      }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.UPDATED, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to update configuration'
    );
  }
};

// Delete configuration
export const deleteConfiguration = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    const { id } = req.params;

    // Get configuration info before deletion
    const configResult = await getConfigurationService().findById(id);
    const configInfo = configResult.data;

    const result = await getConfigurationService().deleteById(id);

    if (!result.success) {
      handleDeleteResult(res, result);
      return;
    }

    // Log event
    await logEvent(
      'DELETE',
      'Configuration',
      id,
      req.user.id,
      `Deleted configuration: ${configInfo?.config_name}`,
      { 
        config_key: configInfo?.config_key,
        category: configInfo?.category,
        instrument_type: configInfo?.instrument_type
      }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.DELETED, { deletedCount: result.deletedCount });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to delete configuration'
    );
  }
};