import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { InstrumentService } from '../services/instrument.service';

let instrumentService: InstrumentService | null = null;

const getInstrumentService = () => {
  if (!instrumentService) {
    instrumentService = new InstrumentService();
  }
  return instrumentService;
};

// Create instrument
export const createInstrument = async (req: Request, res: Response): Promise<void> => {
  try {
    const instrumentData = {
      ...req.body,
      created_by: req.user?.id ? new ObjectId(req.user.id) : undefined,
      updated_by: req.user?.id ? new ObjectId(req.user.id) : undefined,
    };

    const result = await getInstrumentService().create(instrumentData);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || MESSAGES.DB_SAVE_ERROR,
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
      error: error instanceof Error ? error.message : 'Failed to create instrument'
    });
  }
};

// Get all instruments with pagination
export const getAllInstruments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await getInstrumentService().findAll(page, limit, search);

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
      data: result.data?.instruments || [],
      pagination: {
        page: result.data?.page || page,
        limit: result.data?.limit || limit,
        total: result.data?.total || 0,
        totalPages: Math.ceil((result.data?.total || 0) / (result.data?.limit || limit))
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get instruments'
    });
  }
};

// Get instrument by ID
export const getInstrumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getInstrumentService().findById(id);

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
      error: error instanceof Error ? error.message : 'Failed to get instrument'
    });
  }
};

// Update instrument
export const updateInstrument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.user?.id ? new ObjectId(req.user.id) : undefined
    };

    const result = await getInstrumentService().findByIdAndUpdate(id, updateData);

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
      error: error instanceof Error ? error.message : 'Failed to update instrument'
    });
  }
};

// Delete instrument
export const deleteInstrument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getInstrumentService().deleteById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: result.error || MESSAGES.DB_DELETE_ERROR,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.DELETED,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to delete instrument'
    });
  }
};

// Activate instrument
export const activateInstrument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const updatedBy = new ObjectId(req.user.id);
    const result = await getInstrumentService().activateInstrument(id, updatedBy);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || 'Failed to activate instrument',
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Instrument activated successfully',
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to activate instrument'
    });
  }
};

// Deactivate instrument
export const deactivateInstrument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const updatedBy = new ObjectId(req.user.id);
    const result = await getInstrumentService().deactivateInstrument(id, updatedBy);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || 'Failed to deactivate instrument',
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Instrument deactivated successfully',
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to deactivate instrument'
    });
  }
};

