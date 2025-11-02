import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { addTestResults } from '../services/testOrder.service';
import * as testResultService from '../services/testResult.service';
import { UpdateTestResultInput } from '../models/TestOrder';
import { MESSAGES } from '../constants/messages';

interface TestOrderDocument {
  _id: ObjectId;
  barcode: string;
  test_results: any[];
}

// Create Test Result
export const createTestResult = async (req: Request, res: Response) => {
  try {
    const { barcode, results } = req.body;

    if (!barcode) {
      return res.status(400).json({ success: false, message: "Barcode is required" });
    }

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: "Test results are required" });
    }

    const collection = getCollection('test_orders');
    const testOrder = await collection.findOne({ barcode });
    
    if (!testOrder) {
      return res.status(404).json({ success: false, message: "No test order found with this barcode" });
    }

  const order = await addTestResults(testOrder._id.toString(), results, new ObjectId(String(req.user?.id)));
    if (!order) {
      return res.status(400).json({ success: false, message: MESSAGES.DB_SAVE_ERROR });
    }

    res.status(201).json({ 
      success: true, 
      message: MESSAGES.CREATED, 
      data: {
        _id: order._id,
        barcode: order.barcode,
        test_results: order.test_results
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

// Get all Test Results
export const getAllTestResults = async (_req: Request, res: Response) => {
  try {
    const results = await testResultService.getAllTestResults();
    res.status(200).json({ success: true, message: MESSAGES.SUCCESS, data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

// Get Test Result by ID
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

// Update Test Result
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

// Delete Test Result
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
