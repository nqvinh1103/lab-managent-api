import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { CreateTestOrderInput, UpdateTestOrderWithPatientInput } from '../models/TestOrder';
import {
  addComment,
  addTestResults,
  completeTestOrder,
  createTestOrder,
  deleteComment,
  deleteTestOrder,
  exportToExcel,
  getAllTestOrders,
  getTestOrderById,
  printToPDF,
  processSample,
  updateComment,
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
    if (!items || items.length === 0) {
      return res.json({ success: true, data: [], message: 'No Data' });
    }
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
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test order not found or does not contain any data to display' 
      });
    }
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
    const data: UpdateTestOrderWithPatientInput = req.body;
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

/**
 * @openapi
 * /test-orders/{id}/comments:
 *   post:
 *     tags:
 *       - TestOrders
 *     summary: Add comment to test order
 *     description: Add a comment to a test order (3.5.3)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment_text
 *             properties:
 *               comment_text:
 *                 type: string
 *                 description: Comment text
 *           example:
 *             comment_text: "Sample hemolyzed, retest recommended"
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       404:
 *         description: Test order not found
 *       500:
 *         description: Server error
 */
export const addCommentToOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment_text } = req.body;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = new ObjectId(user.id);
    const updated = await addComment(id, comment_text, userId);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found or failed to add comment' });
    }

    // Log event
    await logEvent(
      'UPDATE',
      'TestOrder',
      id,
      userId,
      `Added comment to test order #${updated.order_number}`,
      { order_number: updated.order_number, comment: comment_text }
    );

    res.json({ success: true, message: 'Comment added', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
};

/**
 * @openapi
 * /test-orders/{id}/comments/{commentIndex}:
 *   put:
 *     tags:
 *       - TestOrders
 *     summary: Update comment in test order
 *     description: Update a specific comment in a test order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID
 *       - in: path
 *         name: commentIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment index in array
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment_text
 *             properties:
 *               comment_text:
 *                 type: string
 *           example:
 *             comment_text: "Updated: Sample reprocessed successfully"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Test order not found
 */
export const updateCommentInOrder = async (req: Request, res: Response) => {
  try {
    const { id, commentIndex } = req.params;
    const { comment_text } = req.body;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = new ObjectId(user.id);
    const index = parseInt(commentIndex);
    
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ success: false, error: 'Invalid comment index' });
    }

    const updated = await updateComment(id, index, comment_text, userId);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found or failed to update comment' });
    }

    // Log event
    await logEvent(
      'UPDATE',
      'TestOrder',
      id,
      userId,
      `Updated comment ${index} in test order #${updated.order_number}`,
      { order_number: updated.order_number, comment_index: index }
    );

    res.json({ success: true, message: 'Comment updated', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update comment' });
  }
};

/**
 * @openapi
 * /test-orders/{id}/comments/{commentIndex}:
 *   delete:
 *     tags:
 *       - TestOrders
 *     summary: Delete comment from test order
 *     description: Soft delete a comment (set deleted_at field)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test order ID
 *       - in: path
 *         name: commentIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment index in array
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Test order not found
 */
export const deleteCommentFromOrder = async (req: Request, res: Response) => {
  try {
    const { id, commentIndex } = req.params;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = new ObjectId(user.id);
    const index = parseInt(commentIndex);
    
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ success: false, error: 'Invalid comment index' });
    }

    const updated = await deleteComment(id, index, userId);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found or failed to delete comment' });
    }

    // Log event
    await logEvent(
      'DELETE',
      'TestOrder',
      id,
      userId,
      `Deleted comment ${index} from test order #${updated.order_number}`,
      { order_number: updated.order_number, comment_index: index }
    );

    res.json({ success: true, message: 'Comment deleted', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to delete comment' });
  }
};

/**
 * @openapi
 * /test-orders/process-sample:
 *   post:
 *     tags:
 *       - TestOrders
 *     summary: Process blood sample by barcode
 *     description: |
 *       Create or find test order by barcode (3.6.1.2)
 *       - If barcode exists, returns existing order
 *       - If not, auto-creates new order with pending status
 *       - Checks instrument mode = 'ready'
 *       - Validates reagent levels
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
 *             properties:
 *               barcode:
 *                 type: string
 *               instrument_id:
 *                 type: string
 *           example:
 *             barcode: "BC-SAMPLE001"
 *             instrument_id: "64f9e2c2b1a5d4f6e8c11111"
 *     responses:
 *       200:
 *         description: Sample processed successfully
 *       400:
 *         description: Validation error (instrument not ready, insufficient reagents)
 *       500:
 *         description: Server error
 */
export const processSampleOrder = async (req: Request, res: Response) => {
  try {
    const { barcode, instrument_id } = req.body;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    if (!barcode || !instrument_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'barcode and instrument_id are required' 
      });
    }

    const userId = new ObjectId(user.id);
    const result = await processSample(barcode, instrument_id, userId);
    
    if (!result) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to process sample. Check instrument status and reagent levels.' 
      });
    }

    // Log event only if new order created
    if (result.isNew) {
      await logEvent(
        'CREATE',
        'TestOrder',
        result.order._id,
        userId,
        `Auto-created test order #${result.order.order_number} from sample barcode: ${barcode}`,
        { order_number: result.order.order_number, barcode, is_auto_created: true }
      );
    }

    res.json({ 
      success: true, 
      message: result.isNew ? 'Test order created from barcode' : 'Existing test order found',
      data: result.order,
      isNew: result.isNew
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process sample' 
    });
  }
};

/**
 * @openapi
 * /test-orders/{id}/results:
 *   put:
 *     tags:
 *       - TestOrders
 *     summary: Add test results to order
 *     description: Add test results with automatic flagging based on parameter normal ranges
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
 *             type: object
 *             properties:
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     parameter_id:
 *                       type: string
 *                     result_value:
 *                       type: number
 *                     unit:
 *                       type: string
 *     responses:
 *       200:
 *         description: Results added successfully
 */
export const addResultsToOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { results } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = new ObjectId(user.id);
    const updated = await addTestResults(id, results, userId);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Failed to add results' });
    }

    res.json({ success: true, message: 'Results added', data: updated });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Failed to add results' });
  }
};

/**
 * @openapi
 * /test-orders/{id}/complete:
 *   post:
 *     tags:
 *       - TestOrders
 *     summary: Complete test order
 *     description: Mark order as completed and track reagent usage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reagent_usage:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     reagent_lot_number:
 *                       type: string
 *                     quantity_used:
 *                       type: number
 *     responses:
 *       200:
 *         description: Order completed successfully
 */
export const completeOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reagent_usage } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = new ObjectId(user.id);
    const updated = await completeTestOrder(id, userId, reagent_usage);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Failed to complete order' });
    }

    await logEvent('UPDATE', 'TestOrder', id, userId, `Completed test order #${updated.order_number}`, { order_number: updated.order_number });

    res.json({ success: true, message: 'Order completed', data: updated });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Failed to complete order' });
  }
};

/**
 * @openapi
 * /test-orders/export:
 *   get:
 *     tags:
 *       - TestOrders
 *     summary: Export test orders to Excel
 *     description: Export test orders with filtering (3.5.4.1)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: "2025-10"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: patient_name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Excel file downloaded
 */
export const exportOrdersToExcel = async (req: Request, res: Response) => {
  try {
    const { month, status, patient_name } = req.query;
    
    const buffer = await exportToExcel({
      month: month as string,
      status: status as string,
      patient_name: patient_name as string
    });

    const filename = `Test Orders-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Failed to export Excel' });
  }
};

/**
 * @openapi
 * /test-orders/{id}/print:
 *   get:
 *     tags:
 *       - TestOrders
 *     summary: Print test order results as PDF
 *     description: Generate PDF report for completed test order (3.5.4.2)
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
 *         description: PDF generated successfully
 *       400:
 *         description: Order not completed or not found
 */
export const printOrderToPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const html = await printToPDF(id);

    // In production, use puppeteer or pdfkit to convert HTML to PDF
    // For MVP, return HTML that can be printed
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message || 'Failed to generate PDF' });
  }
};
