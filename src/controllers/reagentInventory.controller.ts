import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ReagentInventoryService } from '../services/reagentInventory.service';
import { UpdateReagentInventoryStockInput, UpdateReagentInventoryStatusInput } from '../models/ReagentInventory';

let reagentInventoryService: ReagentInventoryService | null = null;

const getReagentInventoryService = () => {
  if (!reagentInventoryService) {
    reagentInventoryService = new ReagentInventoryService();
  }
  return reagentInventoryService;
};

// Create reagent inventory (warehouse management)
export const createReagentInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const result = await getReagentInventoryService().create(req.body, req.user.id);

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
      error: error instanceof Error ? error.message : 'Failed to create reagent inventory'
    });
  }
};

// Get all reagent inventory with filters
export const getAllReagentInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const reagent_name = req.query.reagent_name as string | undefined;
    const vendor_name = req.query.vendor_name as string | undefined;
    const lot_number = req.query.lot_number as string | undefined;
    const status = req.query.status as 'Received' | 'Partial Shipment' | 'Returned' | undefined;
    
    // Parse date filters
    const start_date = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
    const end_date = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

    const result = await getReagentInventoryService().findAll({
      page,
      limit,
      reagent_name,
      vendor_name,
      lot_number,
      status,
      start_date,
      end_date
    });

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
      data: result.data!.inventory,
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
      error: error instanceof Error ? error.message : 'Failed to get reagent inventory'
    });
  }
};

// Get reagent inventory by ID
export const getReagentInventoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getReagentInventoryService().findById(id);

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
      error: error instanceof Error ? error.message : 'Failed to get reagent inventory'
    });
  }
};

// Update reagent inventory
export const updateReagentInventory = async (req: Request, res: Response): Promise<void> => {
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
    const result = await getReagentInventoryService().update(id, req.body);

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
      error: error instanceof Error ? error.message : 'Failed to update reagent inventory'
    });
  }
};

// Update reagent inventory stock
export const updateReagentInventoryStock = async (req: Request, res: Response): Promise<void> => {
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
    const stockData: UpdateReagentInventoryStockInput = req.body;
    
    const result = await getReagentInventoryService().updateStock(id, stockData);

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
      message: 'Stock updated successfully',
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to update stock'
    });
  }
};

// Update reagent inventory status
export const updateReagentInventoryStatus = async (req: Request, res: Response): Promise<void> => {
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
    const statusData: UpdateReagentInventoryStatusInput = req.body;
    
    const result = await getReagentInventoryService().updateStatus(id, statusData);

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
      message: 'Status updated successfully',
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to update status'
    });
  }
};

