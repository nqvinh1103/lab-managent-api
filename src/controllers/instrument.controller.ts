import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { InstrumentService } from '../services/instrument.service';
import { logEvent } from '../utils/eventLog.helper';

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
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const result = await getInstrumentService().create(req.body, req.user.id);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || MESSAGES.DB_SAVE_ERROR,
        error: result.error
      });
      return;
    }

    // Log instrument creation
    await logEvent(
      'CREATE',
      'Instrument',
      result.data!._id.toString(),
      req.user.id,
      `Created instrument: ${result.data!.instrument_name}`,
      { 
        instrument_name: result.data!.instrument_name,
        instrument_type: result.data!.instrument_type,
        serial_number: result.data!.serial_number
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
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const { id } = req.params;
    const result = await getInstrumentService().findByIdAndUpdate(id, req.body, req.user.id);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || MESSAGES.DB_UPDATE_ERROR,
        error: result.error
      });
      return;
    }

    // Log the update
    const changedFields = Object.keys(req.body);
    await logEvent(
      'UPDATE',
      'Instrument',
      id,
      req.user.id,
      `Updated instrument: ${result.data!.instrument_name}`,
      { 
        changed_fields: changedFields,
        instrument_name: result.data!.instrument_name
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
      error: error instanceof Error ? error.message : 'Failed to update instrument'
    });
  }
};

// Delete instrument
export const deleteInstrument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Get instrument details before deletion for logging
    const instrumentToDelete = await getInstrumentService().findById(id);
    if (!instrumentToDelete.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NOT_FOUND,
        error: 'Instrument not found'
      });
      return;
    }

    const result = await getInstrumentService().deleteById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: result.error || MESSAGES.DB_DELETE_ERROR,
        error: result.error
      });
      return;
    }

    // Log the deletion
    await logEvent(
      'DELETE',
      'Instrument',
      id,
      req.user?.id,
      `Deleted instrument: ${instrumentToDelete.data!.instrument_name}`,
      { 
        instrument_name: instrumentToDelete.data!.instrument_name,
        instrument_type: instrumentToDelete.data!.instrument_type
      }
    );

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

    // Log activation
    await logEvent(
      'UPDATE',
      'Instrument',
      id,
      req.user.id,
      `Activated instrument: ${result.data!.instrument_name}`,
      { 
        instrument_name: result.data!.instrument_name,
        action: 'activate'
      }
    );

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

    // Log deactivation
    await logEvent(
      'UPDATE',
      'Instrument',
      id,
      req.user.id,
      `Deactivated instrument: ${result.data!.instrument_name}`,
      { 
        instrument_name: result.data!.instrument_name,
        action: 'deactivate'
      }
    );

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

/**
 * @openapi
 * /instruments/{id}/change-mode:
 *   post:
 *     tags:
 *       - Instruments
 *     summary: Change instrument operational mode
 *     description: |
 *       Change instrument mode to ready, maintenance, or inactive (3.6.1.1)
 *       - ready: Requires QC check within last 24 hours
 *       - maintenance/inactive: Requires mode_reason
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instrument ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mode
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [ready, maintenance, inactive]
 *               mode_reason:
 *                 type: string
 *                 description: Required for maintenance/inactive modes
 *           examples:
 *             ready:
 *               value:
 *                 mode: ready
 *             maintenance:
 *               value:
 *                 mode: maintenance
 *                 mode_reason: Scheduled calibration
 *     responses:
 *       200:
 *         description: Mode changed successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Instrument not found
 */
export const changeModeInstrument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { mode, mode_reason } = req.body;

    if (!mode || !['ready', 'maintenance', 'inactive'].includes(mode)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid mode',
        error: 'mode must be one of: ready, maintenance, inactive'
      });
      return;
    }

    const updatedBy = req.user?.id ? new ObjectId(req.user.id) : undefined;
    const result = await getInstrumentService().changeMode(id, mode, mode_reason, updatedBy);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || 'Failed to change instrument mode',
        error: result.error
      });
      return;
    }

    // Log mode change
    await logEvent(
      'UPDATE',
      'Instrument',
      id,
      req.user?.id,
      `Changed instrument mode: ${result.data!.instrument_name} to ${mode}`,
      { 
        instrument_name: result.data!.instrument_name,
        mode: mode,
        mode_reason: mode_reason,
        action: 'change_mode'
      }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Instrument mode changed to ${mode}`,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to change instrument mode'
    });
  }
};

