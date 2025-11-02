import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { CreateTestOrderInput, TestOrderDocument, UpdateTestOrderInput } from '../models/TestOrder';
import {
  createTestOrder,
  deleteTestOrder,
  getAllTestOrders,
  getTestOrderById,
  updateTestOrder,
  processSample,
  addComment,
  updateComment,
  deleteComment,
  addTestResults,
  completeTestOrder,
  exportToExcel,
  printToPDF
} from '../services/testOrder.service';
import { logEvent } from '../utils/eventLog.helper';
import { ApiError } from '../utils/apiError';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check authentication
    if (!req.user) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, MESSAGES.UNAUTHORIZED);
      return;
    }

    // Validate required fields
    const { patient_email, instrument_name } = req.body;
    if (!patient_email) {
      sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, MESSAGES.REQUIRED_FIELD);
      return;
    }

    // Call service to create test order with QueryResult return
    try {
      const result = await createTestOrder(
        {
          patient_email,
          instrument_name
        },
        new ObjectId(req.user.id)
      );

      // Handle service result
      if (!result.success) {
        console.log('Service returned error:', result.error);
        sendResponse(
          res, 
          result.statusCode || HTTP_STATUS.BAD_REQUEST,
          false,
          result.error || MESSAGES.DB_SAVE_ERROR
        );
        return;
      }

      // Log successful creation
      await logEvent(
        'CREATE',
        'TestOrder',
        result.data!._id.toString(),
        req.user.id,
        'Created new test order',
        { patient_email, instrument_name }
      );

      // Send success response
      sendResponse(
        res,
        HTTP_STATUS.CREATED,
        true,
        MESSAGES.CREATED,
        result.data
      );
    } catch (serviceError) {
      console.error('Service error creating test order:', serviceError);
      throw serviceError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error creating test order:', error);
    sendResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      false,
      error instanceof Error ? error.message : MESSAGES.INTERNAL_ERROR
    );
  }
};

const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  error?: string,
  pagination?: ApiResponse['pagination']
): void => {
  const response: ApiResponse<T> = {
    success,
    message,
  ...(data && { data }),
    ...(error && { error }),
    ...(pagination && { pagination })
  };
  res.status(statusCode).json(response);
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
export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        false,
        MESSAGES.UNAUTHORIZED
      );
      return;
    }

    const result = await getAllTestOrders();
    
    sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      MESSAGES.SUCCESS,
      result
    );

    // Skip logging for read operations since they don't modify data
  } catch (error) {
    console.error('Error fetching test orders:', error);
    
    sendResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      false,
      MESSAGES.INTERNAL_ERROR,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

// Process Sample (auto-create from barcode) controller
export const processSampleOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, MESSAGES.UNAUTHORIZED);
      return;
    }

    const { barcode, instrument_id } = req.body;
    try {
      const result = await processSample(barcode, instrument_id, new ObjectId(req.user.id));
      sendResponse(res, HTTP_STATUS.OK, true, MESSAGES.SUCCESS, result);
    } catch (err) {
      console.error('Error in processSampleOrder:', err);
      if ((err as any)?.name === 'ApiError' || (err as any)?.statusCode) {
        const status = (err as any).statusCode || HTTP_STATUS.BAD_REQUEST;
        sendResponse(res, status, false, (err as any).message || MESSAGES.INTERNAL_ERROR);
        return;
      }
      sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, err instanceof Error ? err.message : String(err));
    }
  } catch (error) {
    console.error('Error processing sample (outer):', error);
    sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Add comment to order
export const addCommentToOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, MESSAGES.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    const { comment_text } = req.body;

    const created = await addComment(id, comment_text, new ObjectId(req.user.id));
    if (!created) {
      sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, MESSAGES.DB_SAVE_ERROR);
      return;
    }

    await logEvent('CREATE', 'TestOrderComment', id, req.user.id, 'Added comment to test order', { comment_text });

    sendResponse(res, HTTP_STATUS.OK, true, MESSAGES.CREATED, created);
  } catch (error) {
    console.error('Error adding comment to order:', error);
    sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Update comment in order
export const updateCommentInOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, MESSAGES.UNAUTHORIZED);
      return;
    }

    const { id, commentIndex } = req.params;
    const { comment_text } = req.body;
    const idx = Number(commentIndex);

    const updated = await updateComment(id, idx, comment_text, new ObjectId(req.user.id));
    if (!updated) {
      sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, MESSAGES.DB_SAVE_ERROR);
      return;
    }

    await logEvent('UPDATE', 'TestOrderComment', id, req.user.id, `Updated comment #${idx}`, { comment_text });

    sendResponse(res, HTTP_STATUS.OK, true, MESSAGES.UPDATED, updated);
  } catch (error) {
    console.error('Error updating comment in order:', error);
    sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Delete comment from order
export const deleteCommentFromOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, MESSAGES.UNAUTHORIZED);
      return;
    }

    const { id, commentIndex } = req.params;
    const idx = Number(commentIndex);

    const updated = await deleteComment(id, idx, new ObjectId(req.user.id));
    if (!updated) {
      sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, MESSAGES.DB_DELETE_ERROR);
      return;
    }

    await logEvent('DELETE', 'TestOrderComment', id, req.user.id, `Deleted comment #${idx}`, { comment_index: idx });

    sendResponse(res, HTTP_STATUS.OK, true, MESSAGES.DELETED, updated);
  } catch (error) {
    console.error('Error deleting comment from order:', error);
    sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Add test results to order
export const addResultsToOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, MESSAGES.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    const { results } = req.body;

    const updated = await addTestResults(id, results, new ObjectId(req.user.id));
    if (!updated) {
      sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, MESSAGES.DB_SAVE_ERROR);
      return;
    }

    await logEvent('UPDATE', 'TestOrder', id, req.user.id, 'Added test results', { results_count: results.length });

    sendResponse(res, HTTP_STATUS.OK, true, MESSAGES.UPDATED, updated);
  } catch (error) {
    console.error('Error adding results to order:', error);
    sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Complete test order
export const completeOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, MESSAGES.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    const { reagent_usage } = req.body;

    try {
      const updated = await completeTestOrder(id, new ObjectId(req.user.id), reagent_usage);
      if (!updated) {
        sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, MESSAGES.DB_SAVE_ERROR);
        return;
      }

      await logEvent('UPDATE', 'TestOrder', id, req.user.id, 'Completed test order', { reagent_usage });

      sendResponse(res, HTTP_STATUS.OK, true, MESSAGES.UPDATED, updated);
    } catch (err) {
      console.error('Error completing order:', err);
      if ((err as any)?.name === 'ApiError' || (err as any)?.statusCode) {
        const status = (err as any).statusCode || HTTP_STATUS.BAD_REQUEST;
        sendResponse(res, status, false, (err as any).message || MESSAGES.INTERNAL_ERROR);
        return;
      }
      sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, err instanceof Error ? err.message : String(err));
    }
  } catch (error) {
    console.error('Error in completeOrder (outer):', error);
    sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Export orders to Excel
export const exportOrdersToExcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, MESSAGES.UNAUTHORIZED);
      return;
    }

    const filters = {
      month: req.query.month as string | undefined,
      status: req.query.status as string | undefined,
      patient_name: req.query.patient_name as string | undefined
    };

    try {
      const buffer = await exportToExcel(filters);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="test_orders.xlsx"`);
      res.status(200).send(buffer);
    } catch (err) {
      console.error('Error exporting orders to Excel:', err);
      sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, err instanceof Error ? err.message : String(err));
    }
  } catch (error) {
    console.error('Error in exportOrdersToExcel (outer):', error);
    sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Print order to PDF (returns HTML for now)
export const printOrderToPDF = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, false, MESSAGES.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;

    try {
      const html = await printToPDF(id);
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (err) {
      console.error('Error printing order to PDF:', err);
      sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, err instanceof Error ? err.message : String(err));
    }
  } catch (error) {
    console.error('Error in printOrderToPDF (outer):', error);
    sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, MESSAGES.INTERNAL_ERROR, undefined, error instanceof Error ? error.message : 'Unknown error');
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
export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        false,
        MESSAGES.UNAUTHORIZED
      );
      return;
    }

    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        MESSAGES.INVALID_FORMAT
      );
      return;
    }

    const result = await getTestOrderById(id);

    if (!result) {
      sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        MESSAGES.NOT_FOUND
      );
      return;
    }

    sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      MESSAGES.SUCCESS,
      result
    );

    // Skip logging for read operations since they don't modify data
  } catch (error) {
    console.error('Error fetching test order:', error);
    
    sendResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      false,
      MESSAGES.INTERNAL_ERROR,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
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
export const updateOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        false,
        MESSAGES.UNAUTHORIZED
      );
      return;
    }

    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        MESSAGES.INVALID_FORMAT
      );
      return;
    }

    const data: UpdateTestOrderInput = req.body;
    const result = await updateTestOrder(id, data);

    if (!result) {
      sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        MESSAGES.NOT_FOUND
      );
      return;
    }

    const changedFields = Object.keys(data);
    await logEvent(
      'UPDATE',
      'TestOrder',
      id,
      req.user.id,
      `Updated test order fields: ${changedFields.join(', ')}`,
      { changed_fields: changedFields }
    );

    sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      MESSAGES.UPDATED,
      result
    );
  } catch (error) {
    console.error('Error updating test order:', error);
    
    sendResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      false,
      MESSAGES.INTERNAL_ERROR,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
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
export const deleteOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        false,
        MESSAGES.UNAUTHORIZED
      );
      return;
    }

    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        MESSAGES.INVALID_FORMAT
      );
      return;
    }

    // Fetch test order info before delete
    const testOrder = await getTestOrderById(id);
    if (!testOrder) {
      sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        MESSAGES.NOT_FOUND
      );
      return;
    }

    const result = await deleteTestOrder(id);

    if (!result) {
      sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        MESSAGES.DB_DELETE_ERROR
      );
      return;
    }

    await logEvent(
      'DELETE',
      'TestOrder',
      id,
      req.user.id,
      `Deleted test order`,
      { test_order_id: id }
    );

    sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      MESSAGES.DELETED
    );
  } catch (error) {
    console.error('Error deleting test order:', error);
    
    sendResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      false,
      MESSAGES.INTERNAL_ERROR,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
