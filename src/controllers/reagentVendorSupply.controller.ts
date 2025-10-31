import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ReagentVendorSupplyService } from '../services/reagentVendorSupply.service';

let service: ReagentVendorSupplyService | null = null;

const getService = () => {
  if (!service) {
    service = new ReagentVendorSupplyService();
  }
  return service;
};

// Create vendor supply history record
export const createVendorSupply = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getService().create(req.body);

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
      error: error instanceof Error ? error.message : 'Failed to create reagent vendor supply history'
    });
  }
};

// Get all vendor supply history with filters
export const getAllVendorSupply = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const reagent_name = req.query.reagent_name as string | undefined;
    const vendor_name = req.query.vendor_name as string | undefined;
    const lot_number = req.query.lot_number as string | undefined;
    
    // Parse date filters
    const start_date = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
    const end_date = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

    const result = await getService().findAll({
      page,
      limit,
      reagent_name,
      vendor_name,
      lot_number,
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
      error: error instanceof Error ? error.message : 'Failed to get reagent vendor supply history'
    });
  }
};

// Get vendor supply history by ID
export const getVendorSupplyById = async (req: Request, res: Response): Promise<void> => {
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
      error: error instanceof Error ? error.message : 'Failed to get reagent vendor supply history'
    });
  }
};

