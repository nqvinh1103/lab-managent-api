import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ReagentService } from '../services/reagent.service';

let reagentService: ReagentService | null = null;

const getReagentService = () => {
  if (!reagentService) {
    reagentService = new ReagentService();
  }
  return reagentService;
};

// Get all reagents (read-only for all users)
export const getAllReagents = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getReagentService().findAll();

    if (!result.success) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: result.error || MESSAGES.DB_QUERY_ERROR,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: result.data || []
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get reagents'
    });
  }
};

// Get reagent by ID (read-only for all users)
export const getReagentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getReagentService().findById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: result.error || MESSAGES.NOT_FOUND,
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
      error: error instanceof Error ? error.message : 'Failed to get reagent'
    });
  }
};

// Update reagent metadata (ADMIN only)
export const updateReagentMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    const result = await getReagentService().updateMetadata(id, req.body);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || MESSAGES.DB_UPDATE_ERROR,
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
      error: error instanceof Error ? error.message : 'Failed to update reagent metadata'
    });
  }
};

