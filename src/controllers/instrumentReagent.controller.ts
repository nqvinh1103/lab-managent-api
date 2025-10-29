import { Request, Response } from 'express';
import {
  createInstrumentReagent,
  getAllInstrumentReagents,
  getInstrumentReagentById,
  updateInstrumentReagent,
  deleteInstrumentReagent
} from '../services/instrumentReagent.service';


/**
 * @openapi
 * components:
 *   schemas:
 *     InstrumentReagent:
 *       type: object
 *       required:
 *         - instrument_id
 *         - reagent_lot_number
 *         - installed_at
 *         - installed_by
 *         - status
 *         - created_by
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         instrument_id:
 *           type: string
 *           description: ID of the instrument
 *         reagent_lot_number:
 *           type: string
 *         installed_at:
 *           type: string
 *           format: date-time
 *         installed_by:
 *           type: string
 *         removed_at:
 *           type: string
 *           format: date-time
 *         removed_by:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, removed, expired]
 *         created_at:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: string
 *       example:
 *         _id: "64f9e2c2b1a5d4f6e8c12345"
 *         instrument_id: "64f9e2c2b1a5d4f6e8c11111"
 *         reagent_lot_number: "LOT123"
 *         installed_at: "2025-10-29T12:00:00.000Z"
 *         installed_by: "64f9e2c2b1a5d4f6e8c22222"
 *         status: "active"
 *         created_at: "2025-10-29T12:00:00.000Z"
 *         created_by: "64f9e2c2b1a5d4f6e8c33333"
 */

/**
 * @openapi
 * /instrument-reagents:
 *   post:
 *     tags:
 *       - InstrumentReagents
 *     summary: Create a new instrument reagent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstrumentReagent'
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
 *       500:
 *         description: Failed to create
 *
 *   get:
 *     tags:
 *       - InstrumentReagents
 *     summary: Get all instrument reagents
 *     responses:
 *       200:
 *         description: OK
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
 *         description: Failed to fetch
 *
 * /instrument-reagents/{id}:
 *   get:
 *     tags:
 *       - InstrumentReagents
 *     summary: Get an instrument reagent by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InstrumentReagent'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Not found
 *
 *   put:
 *     tags:
 *       - InstrumentReagents
 *     summary: Update an instrument reagent
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InstrumentReagent'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Not found
 *
 *   delete:
 *     tags:
 *       - InstrumentReagents
 *     summary: Delete an instrument reagent
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Not found
 */


export const createReagentController = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const created = await createInstrumentReagent(data);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

export const getReagentsController = async (_req: Request, res: Response) => {
  try {
    const items = await getAllInstrumentReagents();
    res.json({ success: true, data: items });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
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

export const deleteReagentController = async (req: Request, res: Response) => {
  try {
    await deleteInstrumentReagent(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Invalid ObjectId') return res.status(400).json({ success: false, error: 'Invalid id format' });
    if (error.message === 'Document not found') return res.status(404).json({ success: false, error: 'Not found' });
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
