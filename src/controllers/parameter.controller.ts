import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ParameterService } from '../services/parameter.service';

let parameterService: ParameterService | null = null;

const getParameterService = () => {
  if (!parameterService) {
    parameterService = new ParameterService();
  }
  return parameterService;
};

/**
 * @openapi
 * /parameters:
 *   get:
 *     tags:
 *       - Parameters
 *     summary: Get all parameters
 *     description: Get list of all parameters (read-only master data). Supports pagination and search.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by parameter name, code, or abbreviation
 *     responses:
 *       200:
 *         description: List of parameters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Parameter'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
// Get all parameters with pagination and search
export const getAllParameters = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const result = await getParameterService().findAll(page, limit, search);

    if (!result.success) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.DB_QUERY_ERROR,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: result.data!.parameters,
      pagination: {
        page,
        limit,
        total: result.data!.total,
        totalPages: Math.ceil(result.data!.total / limit)
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get parameters'
    });
  }
};

/**
 * @openapi
 * /parameters/{id}:
 *   get:
 *     tags:
 *       - Parameters
 *     summary: Get parameter by ID
 *     description: Get a specific parameter by its ID (read-only master data)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parameter ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Parameter retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   $ref: '#/components/schemas/Parameter'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Parameter not found
 *       500:
 *         description: Server error
 */
// Get parameter by ID
export const getParameterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getParameterService().findById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NOT_FOUND,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get parameter'
    });
  }
};

