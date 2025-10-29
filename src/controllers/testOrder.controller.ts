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
 *     TestOrder:
 *       type: object
 *       required:
 *         - patient_id
 *         - instrument_id
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the test order
 *         patient_id:
 *           type: string
 *           description: ID of the patient
 *         instrument_id:
 *           type: string
 *           description: ID of the instrument
 *         barcode:
 *           type: string
 *           description: Generated barcode for the order
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *           default: pending
 *         created_by:
 *           type: string
 *           description: ID of the user who created this order
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         _id: "671f8a36e9e9f84ef4a12345"
 *         patient_id: "671f8a36e9e9f84ef4a22222"
 *         instrument_id: "671f8a36e9e9f84ef4a33333"
 *         barcode: "BAR-1729933200000-100"
 *         status: "pending"
 *         created_by: "671f8a36e9e9f84ef4a44444"
 *         created_at: "2025-10-29T12:00:00.000Z"
 *         updated_at: "2025-10-29T12:00:00.000Z"
 */

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
 *             $ref: '#/components/schemas/TestOrder'
 *           example:
 *             patient_id: "671f8a36e9e9f84ef4a22222"
 *             instrument_id: "671f8a36e9e9f84ef4a33333"
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
 *                   $ref: '#/components/schemas/TestOrder'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: User not authenticated
 *       500:
 *         description: Failed to create test order
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Failed to create test order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log('Authorization header:', req.headers.authorization);
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, error: 'User not authenticated' });

    const userId = new ObjectId(user.id);
    const orderData: CreateTestOrderInput = req.body;
    const result = await createTestOrder(orderData, userId);

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
    const ok = await deleteTestOrder(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Order not found or delete failed' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to delete test order' });
  }
};
