import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ConfigurationService } from '../services/configuration.service';
import { logEvent } from '../utils/eventLog.helper';

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
    const result = await getConfigurationService().create(req.body);

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
      'Configuration',
      result.data!._id,
      req.body.created_by,
      `Created configuration: ${result.data!.config_name} (${result.data!.config_key})`,
      { config_key: result.data!.config_key, config_name: result.data!.config_name, category: result.data!.category }
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
      error: error instanceof Error ? error.message : 'Failed to create configuration'
    });
  }
};

// Get all configurations with pagination and filters
export const getAllConfigurations = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string | undefined;
    const instrument_type = req.query.instrument_type as string | undefined;

    const result = await getConfigurationService().findAll(page, limit, category, instrument_type);

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
      data: result.data!.configurations,
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
      error: error instanceof Error ? error.message : 'Failed to get configurations'
    });
  }
};

// Get configuration by ID
export const getConfigurationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getConfigurationService().findById(id);

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
      error: error instanceof Error ? error.message : 'Failed to get configuration'
    });
  }
};

// Update configuration
export const updateConfiguration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getConfigurationService().findByIdAndUpdate(id, req.body);

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
      'Configuration',
      result.data!._id,
      req.body.updated_by,
      `Updated configuration: ${result.data!.config_name} (${result.data!.config_key}) - changed: ${changedFields.join(', ')}`,
      { config_key: result.data!.config_key, changed_fields: changedFields }
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
      error: error instanceof Error ? error.message : 'Failed to update configuration'
    });
  }
};

// Delete configuration
export const deleteConfiguration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Get configuration info before delete for logging
    const configResult = await getConfigurationService().findById(id);
    if (!configResult.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NOT_FOUND,
        error: configResult.error
      });
      return;
    }

    const result = await getConfigurationService().deleteById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.DB_DELETE_ERROR,
        error: result.error
      });
      return;
    }

    // Log event
    const user = (req as any).user;
    const userId = user && user.id ? user.id : undefined;
    await logEvent(
      'DELETE',
      'Configuration',
      id,
      userId,
      `Deleted configuration: ${configResult.data!.config_name} (${configResult.data!.config_key})`,
      { config_key: configResult.data!.config_key, config_name: configResult.data!.config_name }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.DELETED
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to delete configuration'
    });
  }
};

