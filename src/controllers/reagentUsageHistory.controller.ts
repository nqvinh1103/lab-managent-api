import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  createReagentUsageHistory,
  getAllReagentUsageHistory,
  getReagentUsageHistoryById,
  updateReagentUsageHistory,
  deleteReagentUsageHistory,
} from '../services/reagentUsageHistory.service';
import { CreateReagentUsageHistoryInput } from '../models/ReagentUsageHistory';

/**
 * CREATE
 */
export const createUsage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, error: 'User not authenticated' });

  // Ensure clients cannot submit test_order_id directly via the create form.
  const payload: CreateReagentUsageHistoryInput & { reagent_lot_number: string } = req.body;
  // Remove test_order_id if present in the body (defensive) — we only accept test_order_barcode from clients
  if ((payload as any).test_order_id) delete (payload as any).test_order_id;
  const created = await createReagentUsageHistory(payload, new ObjectId(user.id));
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    console.error('createUsage error', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to create reagent usage history' });
  }
};

export const getUsages = async (_req: Request, res: Response) => {
  try {
    const items = await getAllReagentUsageHistory();
    res.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch reagent usage history' });
  }
};

export const getUsageById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = await getReagentUsageHistoryById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch reagent usage history' });
  }
};

export const updateUsage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const updated = await updateReagentUsageHistory(id, data);
    if (!updated) return res.status(404).json({ success: false, message: 'Not found or update failed' });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update reagent usage history' });
  }
};

export const deleteUsage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const ok = await deleteReagentUsageHistory(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Not found or delete failed' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to delete reagent usage history' });
  }
};
