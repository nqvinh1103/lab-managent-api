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
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Patient:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the patient
 *         full_name:
 *           type: string
 *           description: Full name of the patient
 *         identity_number:
 *           type: string
 *           description: Identity number of the patient
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *           description: Date of birth
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: Gender of the patient
 *         address:
 *           type: string
 *           description: Address of the patient
 *         phone_number:
 *           type: string
 *           description: Phone number of the patient
 *         email:
 *           type: string
 *           description: Email of the patient
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     TestOrder:
 *       type: object
 *       required:
 *         - instrument_id
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the test order
 *         order_number:
 *           type: string
 *           description: Order number
 *         patient:
 *           oneOf:
 *             - $ref: '#/components/schemas/Patient'
 *             - type: "null"
 *           description: Patient information (null if patient not found or deleted)
 *         instrument_id:
 *           type: string
 *           description: ID of the instrument
 *         barcode:
 *           type: string
 *           description: Generated barcode for the order
 *         status:
 *           type: string
 *           enum: [pending, running, completed, cancelled, failed]
 *           default: pending
 *         test_results:
 *           type: array
 *           items:
 *             type: object
 *           description: Test results array
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *           description: Comments array
 *         run_by:
 *           type: string
 *           description: ID of the user who ran this order
 *         run_at:
 *           type: string
 *           format: date-time
 *           description: When the order was run
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
 *         order_number: "ORD-1729933200000"
 *         patient:
 *           _id: "671f8a36e9e9f84ef4a22222"
 *           full_name: "Nguyen Van A"
 *           identity_number: "123456789"
 *           date_of_birth: "1990-01-01T00:00:00.000Z"
 *           gender: "male"
 *           address: "123 Main St"
 *           phone_number: "0123456789"
 *           email: "patient@example.com"
 *         instrument_id: "671f8a36e9e9f84ef4a33333"
 *         barcode: "BC-ABC123XYZ"
 *         status: "pending"
 *         test_results: []
 *         comments: []
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
 *             patient_email: "nguyevana@email.com"
 *             instrument_id: "671f8a36e9e9f84ef4a33333"
 *           note: |
 *             Note: When creating a test order, use patient_id.
 *             The API response will include the full patient object instead of patient_id.
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

     // ✅ Validate patient_email
     if (!req.body.patient_email) {
      return res.status(400).json({ 
        success: false, 
        error: 'patient_email is required' 
      });
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
