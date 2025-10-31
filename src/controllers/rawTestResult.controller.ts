import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { RawTestResultService } from '../services/rawTestResult.service';
import { logEvent } from '../utils/eventLog.helper';

const service = new RawTestResultService();

/**
 * @openapi
 * /monitoring/raw-results:
 *   post:
 *     tags:
 *       - Monitoring
 *     summary: Store raw HL7 message
 *     description: Store HL7 message from instrument (3.6.1.3)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - barcode
 *               - instrument_id
 *               - hl7_message
 *               - sent_at
 *             properties:
 *               barcode:
 *                 type: string
 *               instrument_id:
 *                 type: string
 *               hl7_message:
 *                 type: string
 *               sent_at:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [pending, processed, synced]
 *     responses:
 *       201:
 *         description: Raw result stored successfully
 */
export const storeRawResult = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = new ObjectId(user.id);
    const { barcode, instrument_id, hl7_message, sent_at, status = 'pending' } = req.body;

    const result = await service.create({
      barcode,
      instrument_id: new ObjectId(instrument_id),
      hl7_message,
      sent_at: new Date(sent_at),
      status,
      created_by: userId,
      can_delete: false
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Failed to store raw result' });
  }
};

/**
 * @openapi
 * /monitoring/raw-results:
 *   get:
 *     tags:
 *       - Monitoring
 *     summary: View all raw results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: barcode
 *         schema:
 *           type: string
 *       - in: query
 *         name: instrument_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Raw results retrieved successfully
 */
export const getAllRawResults = async (req: Request, res: Response) => {
  try {
    const { barcode, instrument_id, status } = req.query;
    const result = await service.findAll({
      barcode: barcode as string,
      instrument_id: instrument_id as string,
      status: status as string
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch raw results' });
  }
};

/**
 * @openapi
 * /monitoring/raw-results/{id}:
 *   get:
 *     tags:
 *       - Monitoring
 *     summary: View raw result by ID
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
 *         description: Raw result retrieved successfully
 */
export const getRawResultById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await service.findById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch raw result' });
  }
};

/**
 * @openapi
 * /monitoring/raw-results/{id}:
 *   delete:
 *     tags:
 *       - Monitoring
 *     summary: Manual delete raw result
 *     description: Delete raw result only if backed up (can_delete=true) (3.6.1.5)
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
 *         description: Raw result deleted successfully
 *       400:
 *         description: Cannot delete (not backed up)
 */
export const deleteRawResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = new ObjectId(user.id);
    const result = await service.manualDelete(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Log event
    await logEvent('DELETE', 'RawTestResult', id, userId, `Manually deleted raw test result`, {});

    res.json({ success: true, message: 'Raw result deleted' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Failed to delete raw result' });
  }
};

