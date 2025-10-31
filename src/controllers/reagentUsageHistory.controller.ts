import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ReagentUsageHistoryService } from '../services/reagentUsageHistory.service';

let service: ReagentUsageHistoryService | null = null;

const getService = () => {
  if (!service) {
    service = new ReagentUsageHistoryService();
  }
  return service;
};

/**
 * @openapi
 * /reagent-usage-history:
 *   get:
 *     tags:
 *       - ReagentUsageHistory
 *     summary: Get all reagent usage history with filters
 *     description: View reagent usage history with optional filters (3.3.2.2)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: reagent_lot_number
 *         schema:
 *           type: string
 *         description: Filter by reagent lot number
 *       - in: query
 *         name: instrument_id
 *         schema:
 *           type: string
 *         description: Filter by instrument ID
 *       - in: query
 *         name: test_order_id
 *         schema:
 *           type: string
 *         description: Filter by test order ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by usage start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by usage end date
 *     responses:
 *       200:
 *         description: List of reagent usage history
 *       500:
 *         description: Server error
 */
export const getAllUsageHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const reagent_lot_number = req.query.reagent_lot_number as string | undefined;
    const instrument_id = req.query.instrument_id as string | undefined;
    const test_order_id = req.query.test_order_id as string | undefined;
    
    // Parse date filters
    const start_date = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
    const end_date = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

    const result = await getService().findAll({
      page,
      limit,
      reagent_lot_number,
      instrument_id,
      test_order_id,
      start_date,
      end_date
    });

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
      data: result.data!.history,
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
      error: error instanceof Error ? error.message : 'Failed to get reagent usage history'
    });
  }
};

/**
 * @openapi
 * /reagent-usage-history/{id}:
 *   get:
 *     tags:
 *       - ReagentUsageHistory
 *     summary: Get reagent usage history by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Usage history record ID
 *     responses:
 *       200:
 *         description: Usage history found
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export const getUsageHistoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getService().findById(id);

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
      error: error instanceof Error ? error.message : 'Failed to get reagent usage history'
    });
  }
};

