import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import * as instrumentService from '../services/instrument.service'
import { HTTP_STATUS } from '../constants/httpStatus'
import { sendSuccessResponse, sendErrorResponse } from '../utils/response.helper'

export const createInstrument = async (req: Request, res: Response) => {
  try {
    const { name, model } = req.body

    // Validate required fields
    if (!name || !model) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Name and model are required')
    }

    const userId = req.user?.id
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
    }

    const result = await instrumentService.createInstrument({ name, model }, new ObjectId(userId))

    if (!result.success) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, result.error || 'Failed to create instrument')
    }

    return sendSuccessResponse(res, HTTP_STATUS.CREATED, 'Instrument created successfully', result.data)
  } catch (error) {
    return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create instrument', error)
  }
}

export const getInstruments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
    }

    const instruments = await instrumentService.getAllInstruments()

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Instruments retrieved successfully', instruments)
  } catch (error) {
    return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve instruments', error)
  }
}

export const getInstrumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Invalid instrument ID')
    }

    const instrument = await instrumentService.getInstrumentById(id)

    if (!instrument) {
      return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Instrument not found')
    }

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Instrument retrieved successfully', instrument)
  } catch (error) {
    return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve instrument', error)
  }
}

export const updateInstrument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, model } = req.body

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Invalid instrument ID')
    }

    // Validate required fields
    if (!name && !model) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'At least one field (name or model) is required')
    }

    const userId = req.user?.id
    if (!userId) {
      return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
    }

    const updatedInstrument = await instrumentService.updateInstrument(id, { name, model }, new ObjectId(userId))

    if (!updatedInstrument) {
      return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Instrument not found')
    }

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Instrument updated successfully', updatedInstrument)
  } catch (error) {
    return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update instrument', error)
  }
}

export const deleteInstrument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Invalid instrument ID')
    }

    const instrument = await instrumentService.getInstrumentById(id)

    if (!instrument) {
      return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Instrument not found')
    }

    const result = await instrumentService.deleteInstrument(id)

    if (!result) {
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete instrument')
    }

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Instrument deleted successfully')
  } catch (error) {
    return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete instrument', error)
  }
}

/**
 * @openapi
 * /instruments/{id}/change-mode:
 *   post:
 *     tags:
 *       - Instruments
 *     summary: Change instrument operational mode
 *     description: |
 *       Change instrument mode to ready, maintenance, or inactive.
 *       - ready: Requires QC check within last 24 hours. Clears deactivated_at.
 *       - maintenance/inactive: Requires mode_reason. Sets deactivated_at when mode='inactive'.
 *
 *       Note: This replaces the old activate/deactivate endpoints. Use mode='ready' to activate and mode='inactive' to deactivate.
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
    const { id } = req.params
    const { mode, mode_reason } = req.body

    if (!req.user?.id) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated')
      return
    }

    const updatedBy = new ObjectId(req.user.id)
    const result = await getInstrumentService().changeMode(id, mode, mode_reason, updatedBy)

    if (!result.success) {
      const statusCode = result.statusCode || HTTP_STATUS.BAD_REQUEST
      const errorMessage = result.error || 'Failed to change instrument mode'
      sendErrorResponse(res, statusCode, errorMessage, errorMessage)
      return
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
    )

    sendSuccessResponse(res, HTTP_STATUS.OK, `Instrument mode changed to ${mode}`, result.data)
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to change instrument mode'
    )
  }
}
