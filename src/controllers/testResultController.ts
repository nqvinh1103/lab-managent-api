import { Request, Response } from 'express';
import {
  createTestResult,
  getAllTestResults,
  getTestResultById,
  updateTestResult,
  deleteTestResult,
} from '../services/testResult.service';
import { CreateTestResultInput, UpdateTestResultInput } from '../models/TestOrder';
import { MESSAGES } from '../constants/messages';

/**
 * CREATE - Tạo kết quả xét nghiệm mới
 */
export const createTestResultController = async (req: Request, res: Response) => {
  try {
    const data: CreateTestResultInput = req.body;
    const created = await createTestResult(data);
    res.status(201).json({ success: true, message: MESSAGES.CREATED, data: created });
  } catch (error) {
    console.error('❌ createTestResultController error:', error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

/**
 * GET ALL - Lấy tất cả kết quả xét nghiệm
 */
export const getAllTestResultsController = async (_req: Request, res: Response) => {
  try {
    const results = await getAllTestResults();
    res.status(200).json({ success: true, message: MESSAGES.SUCCESS, data: results });
  } catch (error) {
    console.error('❌ getAllTestResultsController error:', error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

/**
 * GET BY ID - Lấy kết quả xét nghiệm theo ID
 */
export const getTestResultByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getTestResultById(id);
    if (!result) {
      return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
    }
    res.status(200).json({ success: true, message: MESSAGES.SUCCESS, data: result });
  } catch (error) {
    console.error('❌ getTestResultByIdController error:', error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

/**
 * UPDATE - Cập nhật kết quả xét nghiệm
 */
export const updateTestResultController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateTestResultInput = req.body;
    const updated = await updateTestResult(id, data);
    if (!updated) {
      return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
    }
    res.status(200).json({ success: true, message: MESSAGES.UPDATED, data: updated });
  } catch (error) {
    console.error('❌ updateTestResultController error:', error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

/**
 * DELETE - Xóa kết quả xét nghiệm
 */
export const deleteTestResultController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTestResult(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
    }
    res.status(200).json({ success: true, message: MESSAGES.DELETED });
  } catch (error) {
    console.error('❌ deleteTestResultController error:', error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};
