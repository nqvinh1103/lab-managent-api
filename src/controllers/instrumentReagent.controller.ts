import { Request, Response } from 'express';
import {
  createInstrumentReagent,
  getAllInstrumentReagents,
  getInstrumentReagentById,
  updateInstrumentReagent,
  updateReagentStatus,
  deleteInstrumentReagent
} from '../services/instrumentReagent.service';
import { ObjectId } from 'mongodb';
import { logEvent } from '../utils/eventLog.helper';

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     InstrumentReagent:
 *       type: object
 *       required:
 *         - instrument_id
 *         - reagent_lot_number
 *         - installed_at
 *         - installed_by
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         instrument_id:
 *           type: string
 *           description: ID of the instrument
 *         reagent_lot_number:
 *           type: string
 *           description: Reagent lot number
 *         installed_at:
 *           type: string
 *           format: date-time
 *           description: Time the reagent was installed
 *         installed_by:
 *           type: string
 *           description: ID of the staff who installed it
 *         removed_at:
 *           type: string
 *           format: date-time
 *           description: Time the reagent was removed
 *         removed_by:
 *           type: string
 *           description: ID of the staff who removed it
 *         status:
 *           type: string
 *           enum: [active, removed, expired]
 *           default: active
 *         created_by:
 *           type: string
 *           description: ID of the user who created this record
 *         created_at:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "64f9e2c2b1a5d4f6e8c12345"
 *         instrument_id: "64f9e2c2b1a5d4f6e8c11111"
 *         reagent_lot_number: "LOT123"
 *         installed_at: "2025-10-29T12:00:00.000Z"
 *         installed_by: "64f9e2c2b1a5d4f6e8c22222"
 *         status: "active"
 *         created_by: "64f9e2c2b1a5d4f6e8c33333"
 *         created_at: "2025-10-29T12:00:00.000Z"
 *
 * /instrument-reagents:
 *   post:
 *     tags:
 *       - InstrumentReagents
 *     summary: Create a new instrument reagent
 *     security:
 *       - bearerAuth: []
 *     description: Create a reagent installation record for an instrument. The authenticated user will be set as `created_by`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstrumentReagent'
 *           example:
 *             instrument_id: "64f9e2c2b1a5d4f6e8c11111"
 *             reagent_lot_number: "LOT123"
 *             installed_at: "2025-10-29T12:00:00.000Z"
 *             installed_by: "64f9e2c2b1a5d4f6e8c22222"
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InstrumentReagent'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: User not authenticated
 *       500:
 *         description: Failed to create reagent
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Failed to create instrument reagent
 *
 *   get:
 *     tags:
 *       - InstrumentReagents
 *     summary: Get all instrument reagents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all instrument reagents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InstrumentReagent'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Failed to fetch instrument reagents
 *
 * /instrument-reagents/{id}:
 *   get:
 *     tags:
 *       - InstrumentReagents
 *     summary: Get an instrument reagent by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f9e2c2b1a5d4f6e8c12345"
 *     responses:
 *       200:
 *         description: Instrument reagent found
 *       400:
 *         description: Invalid ObjectId format
 *       404:
 *         description: Reagent not found
 *
 *   put:
 *     tags:
 *       - InstrumentReagents
 *     summary: Update an instrument reagent by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstrumentReagent'
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Not found
 *
 *   delete:
 *     tags:
 *       - InstrumentReagents
 *     summary: Delete an instrument reagent by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Reagent not found
 */

export const createReagentController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    console.log('Authenticated user:', user);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = new ObjectId(user.id);
    const reagentData = req.body;
    reagentData.created_by = userId;

    const result = await createInstrumentReagent(reagentData);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create instrument reagent' });
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
