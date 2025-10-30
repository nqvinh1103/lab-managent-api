import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  createTestOrder,
  getAllTestOrders,
  getTestOrderById,
  updateTestOrder,
  deleteTestOrder
} from '../services/testOrder.service';
import { CreateTestOrderInput, UpdateTestOrderInput } from '../models/TestOrder';
import { logEvent } from '../utils/eventLog.helper';
/**
 * @openapi
 * /test-orders:
 *   post:
 *     tags:
 *       - TestOrders
 *     summary: Create a new test order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: string
 *                 description: ID of the patient
 *               instrument_id:
 *                 type: string
 *                 description: ID of the instrument
 *             required:
 *               - patient_id
 *               - instrument_id
 *     responses:
 *       '201':
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: The created test order
 *       '500':
 *         description: Failed to create test order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
  // JWT middleware should attach user id to req.user
  const user = (req as any).user;
  const userId = user && user.id ? new ObjectId(user.id) : undefined;

    const orderData: CreateTestOrderInput = req.body;
    const result = await createTestOrder(orderData, userId ?? new ObjectId());
    console.log('Order created:', result);

    // Log event
    await logEvent(
      'CREATE',
      'TestOrder',
      result._id,
      userId,
      `Created test order #${result.order_number} for patient ${result.patient_id}`,
      { order_number: result.order_number, patient_id: result.patient_id.toString() }
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create test order' });
  }
};

/**
 * @openapi
 * /test-orders:
 *   get:
 *     tags:
 *       - TestOrders
 *     summary: Get all test orders
 *     responses:
 *       '200':
 *         description: OK
 */
export const getOrders = async (_req: Request, res: Response) => {
  try {
    const items = await getAllTestOrders();
    res.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch test orders' });
  }
};

/**
 * @openapi
 * /test-orders/{id}:
 *   get:
 *     tags:
 *       - TestOrders
 *     summary: Get a test order by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Not Found
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = await getTestOrderById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch test order' });
  }
};

/**
 * @openapi
 * /test-orders/{id}:
 *   put:
 *     tags:
 *       - TestOrders
 *     summary: Update a test order
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
 *             type: object
 *     responses:
 *       '200':
 *         description: Updated
 *       '404':
 *         description: Not Found
 */
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data: UpdateTestOrderInput = req.body;
    const updated = await updateTestOrder(id, data);
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found or update failed' });
    
    // Log event
    const user = (req as any).user;
    const userId = user && user.id ? user.id : undefined;
    const changedFields = Object.keys(data);
    await logEvent(
      'UPDATE',
      'TestOrder',
      id,
      userId,
      `Updated test order ${id} - changed: ${changedFields.join(', ')}`,
      { changed_fields: changedFields }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update test order' });
  }
};

/**
 * @openapi
 * /test-orders/{id}:
 *   delete:
 *     tags:
 *       - TestOrders
 *     summary: Delete a test order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Deleted
 *       '404':
 *         description: Not Found
 */
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    
    // Fetch test order info before delete
    const testOrder = await getTestOrderById(id);
    
    const ok = await deleteTestOrder(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Order not found or delete failed' });
    
    // Log event
    const user = (req as any).user;
    const userId = user && user.id ? user.id : undefined;
    await logEvent(
      'DELETE',
      'TestOrder',
      id,
      userId,
      `Deleted test order #${testOrder?.order_number}`,
      { order_number: testOrder?.order_number }
    );

    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to delete test order' });
  }
};

