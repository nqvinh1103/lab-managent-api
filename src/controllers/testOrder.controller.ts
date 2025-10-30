import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { CreateTestOrderInput, UpdateTestOrderInput } from '../models/TestOrder';
import {
  createTestOrder,
  deleteTestOrder,
  getAllTestOrders,
  getTestOrderById,
  updateTestOrder
} from '../services/testOrder.service';
import { logEvent } from '../utils/eventLog.helper';

/**
 * @openapi
 * /test-orders:
 *   post:
 *     tags:
 *       - TestOrders
 *     summary: Create a new test order
 *     description: Create a new test order. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_email:
 *                 type: string
 *               instrument_name:
 *                 type: string
 *           example:
 *             patient_email: "nguyevana@email.com"
 *             instrument_name: "Analyzer A"
 *     responses:
 *       201:
 *         description: Created successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Failed to create test order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, error: 'User not authenticated' });

    // Validate patient_email
    if (!req.body.patient_email) {
      return res.status(400).json({ success: false, error: 'patient_email is required' });
    }

    const userId = new ObjectId(user.id);
    const orderData: CreateTestOrderInput & { patient_email: string } = req.body;
    const result = await createTestOrder(orderData, userId);

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
  } catch (error: any) {
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all test orders
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
 *                     $ref: '#/components/schemas/TestOrder'
 *       500:
 *         description: Server error
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
 *     summary: Get a test order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "671f8a36e9e9f84ef4a12345"
 *     responses:
 *       200:
 *         description: Test order found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TestOrder'
 *       404:
 *         description: Test order not found
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
 *             $ref: '#/components/schemas/TestOrder'
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Test order not found
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
 *         description: Test order not found
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
