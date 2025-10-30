import { Request, Response } from 'express';
import * as testResultService from '../services/testResult.service';
import { CreateTestResultInput, UpdateTestResultInput } from '../models/TestOrder';
import { MESSAGES } from '../constants/messages';

/**
 * @openapi
 * components:
 *   schemas:
 *     TestResult:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         parameter_id:
 *           type: string
 *         result_value:
 *           type: number
 *         unit:
 *           type: string
 *         reference_range_text:
 *           type: string
 *         is_flagged:
 *           type: boolean
 *         reagent_lot_number:
 *           type: string
 *         measured_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /test-results:
 *   post:
 *     tags:
 *       - TestResults
 *     summary: Create a new test result
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestResult'
 *     responses:
 *       201:
 *         description: Test result created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TestResult'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export const createTestResult = async (req: Request, res: Response) => {
  try {
    const data: CreateTestResultInput = req.body;
console.log('🔍 testResultService =', testResultService);

    const created = await testResultService.createTestResult(data);

    res.status(201).json({ success: true, message: MESSAGES.CREATED, data: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

/**
 * @openapi
 * /test-results:
 *   get:
 *     tags:
 *       - TestResults
 *     summary: Get all test results
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestResult'
 *       500:
 *         description: Internal server error
 */
export const getAllTestResults = async (_req: Request, res: Response) => {
  try {
    const results = await testResultService.getAllTestResults();
    res.status(200).json({ success: true, message: MESSAGES.SUCCESS, data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

/**
 * @openapi
 * /test-results/{id}:
 *   get:
 *     tags:
 *       - TestResults
 *     summary: Get a test result by ID
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
 *         description: Test result found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TestResult'
 *       404:
 *         description: Test result not found
 *       500:
 *         description: Internal server error
 */
export const getTestResultById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await testResultService.getTestResultById(id);
    if (!result) return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
    res.status(200).json({ success: true, message: MESSAGES.SUCCESS, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

/**
 * @openapi
 * /test-results/{id}:
 *   put:
 *     tags:
 *       - TestResults
 *     summary: Update a test result
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
 *             $ref: '#/components/schemas/TestResult'
 *     responses:
 *       200:
 *         description: Test result updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TestResult'
 *       404:
 *         description: Test result not found
 *       500:
 *         description: Internal server error
 */
export const updateTestResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateTestResultInput = req.body;
    const updated = await testResultService.updateTestResult(id, data);
    if (!updated) return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
    res.status(200).json({ success: true, message: MESSAGES.UPDATED, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

/**
 * @openapi
 * /test-results/{id}:
 *   delete:
 *     tags:
 *       - TestResults
 *     summary: Delete a test result
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
 *         description: Test result deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Test result not found
 *       500:
 *         description: Internal server error
 */
export const deleteTestResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await testResultService.deleteTestResult(id);
    if (!deleted) return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
    res.status(200).json({ success: true, message: MESSAGES.DELETED });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};
