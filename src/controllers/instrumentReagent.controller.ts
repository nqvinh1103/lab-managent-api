import { Request, Response } from 'express';
import {
  createInstrumentReagent,
  deleteInstrumentReagent,
  getAllInstrumentReagents,
  getInstrumentReagentById,
  updateInstrumentReagent,
  updateReagentStatus
} from '../services/instrumentReagent.service';
import { logEvent } from '../utils/eventLog.helper';

// Note: Swagger documentation is in src/docs/endpoints/instrumentReagent.docs.ts and src/docs/schemas/instrumentReagent.schema.ts

export const createReagentController = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const result = await createInstrumentReagent(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error(error);
    const statusCode = error.message.includes('Invalid user ID') 
      ? 400 
      : error.message.includes('not authenticated') 
        ? 401 
        : 500;
    res.status(statusCode).json({ success: false, error: error.message || 'Failed to create instrument reagent' });
  }
};

export const getReagentsController = async (_req: Request, res: Response) => {
  try {
    const items = await getAllInstrumentReagents();
    res.json({ success: true, data: items });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getReagentByIdController = async (req: Request, res: Response) => {
  try {
    const item = await getInstrumentReagentById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error: any) {
    if (error.message === 'Invalid ObjectId') return res.status(400).json({ success: false, error: 'Invalid id format' });
    if (error.message === 'Document not found') return res.status(404).json({ success: false, error: 'Not found' });
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateReagentController = async (req: Request, res: Response) => {
  try {
    const updated = await updateInstrumentReagent(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === 'Invalid ObjectId') return res.status(400).json({ success: false, error: 'Invalid id format' });
    if (error.message === 'Document not found') return res.status(404).json({ success: false, error: 'Not found' });
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update reagent status (3.6.2.2)
export const updateReagentStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['in_use', 'not_in_use', 'expired'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be one of: in_use, not_in_use, expired' 
      });
    }

    const updated = await updateReagentStatus(id, status);

    // Log event
    const user = (req as any).user;
    const userId = user && user.id ? user.id : undefined;
    await logEvent(
      'UPDATE',
      'InstrumentReagent',
      id,
      userId,
      `Updated reagent status to "${status}" - Lot: ${updated.reagent_lot_number}`,
      { reagent_lot_number: updated.reagent_lot_number, new_status: status }
    );

    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === 'Invalid ObjectId') {
      return res.status(400).json({ success: false, error: 'Invalid id format' });
    }
    if (error.message === 'Reagent not found' || error.message === 'Document not found') {
      return res.status(404).json({ success: false, error: 'Reagent not found' });
    }
    if (error.message.includes('already marked as')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete reagent with event logging (3.6.2.3)
export const deleteReagentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get reagent info before delete for logging
    const reagent = await getInstrumentReagentById(id);

    await deleteInstrumentReagent(id);

    // Log event
    const user = (req as any).user;
    const userId = user && user.id ? user.id : undefined;
    await logEvent(
      'DELETE',
      'InstrumentReagent',
      id,
      userId,
      `Deleted reagent - Lot: ${reagent.reagent_lot_number}, Name: ${reagent.reagent_name}`,
      { reagent_lot_number: reagent.reagent_lot_number, reagent_name: reagent.reagent_name }
    );

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Invalid ObjectId') return res.status(400).json({ success: false, error: 'Invalid id format' });
    if (error.message === 'Document not found') return res.status(404).json({ success: false, error: 'Not found' });
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
