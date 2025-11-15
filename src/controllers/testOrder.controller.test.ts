import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import {
  createOrder,
  getOrders,
  getMyTestOrders,
  processSampleOrder,
  addCommentToOrder,
  updateCommentInOrder,
  deleteCommentFromOrder,
  addResultsToOrder,
  completeOrder,
  exportOrdersToExcel,
  printOrderToPDF,
  getOrderById,
  updateOrder,
  deleteOrder,
  syncRawTestResultController,
  reviewOrder,
  aiPreviewOrder,
  aiReviewOrder
} from './testOrder.controller'
import * as testOrderService from '../services/testOrder.service'
import * as testOrderReviewService from '../services/testOrderReview.service'
import { PatientService } from '../services/patient.service'
import * as eventLogHelper from '../utils/eventLog.helper'
import { HTTP_STATUS } from '../constants/httpStatus'
import { MESSAGES } from '../constants/messages'

// Mock dependencies
jest.mock('../services/testOrder.service')
jest.mock('../services/testOrderReview.service')
jest.mock('../services/patient.service')
jest.mock('../utils/eventLog.helper')

// Mock database with proper collection support
const mockCollection = {
  findOne: jest.fn()
}
jest.mock('../config/database', () => ({
  getCollection: jest.fn(() => mockCollection)
}))

// Mock response helper
jest.mock('../utils/response.helper', () => ({
  sendSuccessResponse: jest.fn((res, status, message, data) => {
    res.status(status).json({ success: true, message, data })
  }),
  sendErrorResponse: jest.fn((res, status, message, error) => {
    res.status(status).json({ success: false, error: message, details: error })
  }),
  handleCreateResult: jest.fn(),
  handleUpdateResult: jest.fn(),
  handleGetResult: jest.fn(),
  handleDeleteResult: jest.fn()
}))

// Create mock Request and Response objects
const createMockRequest = (overrides?: any): any => {
  return {
    body: {},
    params: {},
    query: {},
    user: {
      id: new ObjectId().toString(),
      email: 'test@example.com',
      roles: ['doctor']
    },
    ...overrides
  }
}

const createMockResponse = (): any => {
  const response: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis()
  }
  return response
}

describe('TestOrderController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCollection.findOne.mockReset()
  })

  describe('createOrder', () => {
    it('should create a test order successfully', async () => {
      const req = createMockRequest({
        body: {
          patient_email: 'patient@example.com',
          instrument_name: 'Instrument1'
        }
      })
      const res = createMockResponse()

      const mockTestOrder = {
        _id: new ObjectId(),
        order_number: 'ORD-123456',
        patient_id: new ObjectId(),
        barcode: 'BC-ABC123',
        status: 'pending',
        created_at: new Date(),
        created_by: new ObjectId(req.user.id)
      }

      ;(testOrderService.createTestOrder as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTestOrder
      })

      await createOrder(req, res)

      expect(testOrderService.createTestOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          patient_email: 'patient@example.com',
          instrument_name: 'Instrument1'
        }),
        expect.any(ObjectId)
      )
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({ user: undefined })
      const res = createMockResponse()

      await createOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should return 400 when patient_email is missing', async () => {
      const req = createMockRequest({
        body: { instrument_name: 'Instrument1' }
      })
      const res = createMockResponse()

      await createOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should handle service errors gracefully', async () => {
      const req = createMockRequest({
        body: {
          patient_email: 'patient@example.com',
          instrument_name: 'Instrument1'
        }
      })
      const res = createMockResponse()

      ;(testOrderService.createTestOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Patient not found'
      })

      await createOrder(req, res)

      expect(testOrderService.createTestOrder).toHaveBeenCalled()
    })
  })

  describe('getOrders', () => {
    it('should return all test orders', async () => {
      const req = createMockRequest()
      const res = createMockResponse()

      const mockOrders = [
        { _id: new ObjectId(), order_number: 'ORD-1', status: 'pending' },
        { _id: new ObjectId(), order_number: 'ORD-2', status: 'completed' }
      ]

      ;(testOrderService.getAllTestOrders as jest.Mock).mockResolvedValue(mockOrders)

      await getOrders(req, res)

      expect(testOrderService.getAllTestOrders).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({ user: undefined })
      const res = createMockResponse()

      await getOrders(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should handle service errors', async () => {
      const req = createMockRequest()
      const res = createMockResponse()

      ;(testOrderService.getAllTestOrders as jest.Mock).mockRejectedValue(new Error('Database error'))

      await getOrders(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    })
  })

  describe('getMyTestOrders', () => {
    it('should return authenticated patient test orders', async () => {
      const patientId = new ObjectId()
      const req = createMockRequest()
      const res = createMockResponse()

      const mockPatient = { _id: patientId, email: 'patient@example.com' }
      const mockOrders = [{ _id: new ObjectId(), order_number: 'ORD-1', patient_id: patientId }]

      const mockPatientService = {
        getByUserId: jest.fn().mockResolvedValue({
          success: true,
          data: mockPatient
        })
      }

      ;(PatientService as jest.Mock).mockImplementation(() => mockPatientService)
      ;(testOrderService.getTestOrdersByPatientId as jest.Mock).mockResolvedValue(mockOrders)

      await getMyTestOrders(req, res)

      expect(mockPatientService.getByUserId).toHaveBeenCalledWith(req.user.id)
      expect(testOrderService.getTestOrdersByPatientId).toHaveBeenCalledWith(patientId)
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({ user: undefined })
      const res = createMockResponse()

      await getMyTestOrders(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should return 404 when patient profile not found', async () => {
      const req = createMockRequest()
      const res = createMockResponse()

      const mockPatientService = {
        getByUserId: jest.fn().mockResolvedValue({
          success: false,
          error: 'Patient not found'
        })
      }

      ;(PatientService as jest.Mock).mockImplementation(() => mockPatientService)

      await getMyTestOrders(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
    })
  })

  describe('processSampleOrder', () => {
    it('should process sample successfully', async () => {
      const req = createMockRequest({
        body: {
          barcode: 'BC-SAMPLE001',
          instrument_id: new ObjectId().toString()
        }
      })
      const res = createMockResponse()

      const mockResult = {
        order: { _id: new ObjectId(), barcode: 'BC-SAMPLE001' },
        isNew: true
      }

      ;(testOrderService.processSample as jest.Mock).mockResolvedValue(mockResult)

      await processSampleOrder(req, res)

      expect(testOrderService.processSample).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        body: {
          barcode: 'BC-SAMPLE001',
          instrument_id: new ObjectId().toString()
        }
      })
      const res = createMockResponse()

      await processSampleOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should handle API errors from service', async () => {
      const req = createMockRequest({
        body: {
          barcode: 'BC-SAMPLE001',
          instrument_id: new ObjectId().toString()
        }
      })
      const res = createMockResponse()

      const error = new Error('Instrument not ready')
      ;(error as any).statusCode = HTTP_STATUS.BAD_REQUEST
      ;(error as any).name = 'ApiError'
      ;(testOrderService.processSample as jest.Mock).mockRejectedValue(error)

      await processSampleOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })
  })

  describe('addCommentToOrder', () => {
    it('should add comment successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId },
        body: { comment_text: 'Test comment' }
      })
      const res = createMockResponse()

      const mockUpdated = {
        _id: new ObjectId(orderId),
        comments: [{ comment_text: 'Test comment' }]
      }

      ;(testOrderService.addComment as jest.Mock).mockResolvedValue(mockUpdated)

      await addCommentToOrder(req, res)

      expect(testOrderService.addComment).toHaveBeenCalledWith(orderId, 'Test comment', expect.any(ObjectId))
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString() },
        body: { comment_text: 'Test comment' }
      })
      const res = createMockResponse()

      await addCommentToOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should return 400 when comment addition fails', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId },
        body: { comment_text: 'Test comment' }
      })
      const res = createMockResponse()

      ;(testOrderService.addComment as jest.Mock).mockResolvedValue(null)

      await addCommentToOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })
  })

  describe('updateCommentInOrder', () => {
    it('should update comment successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId, commentIndex: '0' },
        body: { comment_text: 'Updated comment' }
      })
      const res = createMockResponse()

      const mockUpdated = {
        _id: new ObjectId(orderId),
        comments: [{ comment_text: 'Updated comment' }]
      }

      ;(testOrderService.updateComment as jest.Mock).mockResolvedValue(mockUpdated)

      await updateCommentInOrder(req, res)

      expect(testOrderService.updateComment).toHaveBeenCalledWith(orderId, 0, 'Updated comment', expect.any(ObjectId))
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString(), commentIndex: '0' },
        body: { comment_text: 'Updated comment' }
      })
      const res = createMockResponse()

      await updateCommentInOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('deleteCommentFromOrder', () => {
    it('should delete comment successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId, commentIndex: '0' }
      })
      const res = createMockResponse()

      const mockUpdated = {
        _id: new ObjectId(orderId),
        comments: []
      }

      ;(testOrderService.deleteComment as jest.Mock).mockResolvedValue(mockUpdated)

      await deleteCommentFromOrder(req, res)

      expect(testOrderService.deleteComment).toHaveBeenCalledWith(orderId, 0, expect.any(ObjectId))
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString(), commentIndex: '0' }
      })
      const res = createMockResponse()

      await deleteCommentFromOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('addResultsToOrder', () => {
    it('should add test results successfully', async () => {
      const req = createMockRequest({
        body: {
          barcode: 'BC-SAMPLE001',
          results: [
            {
              parameter_id: new ObjectId().toString(),
              result_value: 100,
              unit: 'mg/dL',
              is_flagged: false
            }
          ]
        }
      })
      const res = createMockResponse()

      const mockTestOrder = {
        _id: new ObjectId(),
        barcode: 'BC-SAMPLE001'
      }

      const mockUpdated = {
        _id: mockTestOrder._id,
        test_results: [
          {
            parameter_id: new ObjectId(),
            result_value: 100,
            unit: 'mg/dL'
          }
        ]
      }

      // Setup mocks
      mockCollection.findOne.mockResolvedValue(mockTestOrder)
      ;(testOrderService.addTestResults as jest.Mock).mockResolvedValue(mockUpdated)

      await addResultsToOrder(req, res)

      expect(mockCollection.findOne).toHaveBeenCalledWith({ barcode: 'BC-SAMPLE001' })
      expect(testOrderService.addTestResults).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 when barcode is missing', async () => {
      const req = createMockRequest({
        body: {
          results: [{ parameter_id: new ObjectId().toString(), result_value: 100 }]
        }
      })
      const res = createMockResponse()

      await addResultsToOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 400 when results array is empty', async () => {
      const req = createMockRequest({
        body: {
          barcode: 'BC-SAMPLE001',
          results: []
        }
      })
      const res = createMockResponse()

      await addResultsToOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        body: {
          barcode: 'BC-SAMPLE001',
          results: [{ parameter_id: new ObjectId().toString(), result_value: 100 }]
        }
      })
      const res = createMockResponse()

      await addResultsToOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('completeOrder', () => {
    it('should complete order successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId },
        body: { reagent_usage: [{ reagent_id: new ObjectId().toString(), quantity: 10 }] }
      })
      const res = createMockResponse()

      const mockUpdated = {
        _id: new ObjectId(orderId),
        status: 'completed'
      }

      ;(testOrderService.completeTestOrder as jest.Mock).mockResolvedValue(mockUpdated)

      await completeOrder(req, res)

      expect(testOrderService.completeTestOrder).toHaveBeenCalledWith(orderId, expect.any(ObjectId), expect.any(Array))
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString() }
      })
      const res = createMockResponse()

      await completeOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('exportOrdersToExcel', () => {
    it('should export orders to Excel', async () => {
      const req = createMockRequest({
        query: {
          month: '11',
          status: 'completed'
        }
      })
      const res = createMockResponse()

      const mockBuffer = Buffer.from('test')

      ;(testOrderService.exportToExcel as jest.Mock).mockResolvedValue(mockBuffer)

      await exportOrdersToExcel(req, res)

      expect(testOrderService.exportToExcel).toHaveBeenCalled()
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      expect(res.send).toHaveBeenCalledWith(mockBuffer)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({ user: undefined })
      const res = createMockResponse()

      await exportOrdersToExcel(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('printOrderToPDF', () => {
    it('should print order to PDF', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId }
      })
      const res = createMockResponse()

      const mockHtml = '<html><body>Test Order</body></html>'

      ;(testOrderService.printToPDF as jest.Mock).mockResolvedValue(mockHtml)

      await printOrderToPDF(req, res)

      expect(testOrderService.printToPDF).toHaveBeenCalledWith(orderId)
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html')
      expect(res.send).toHaveBeenCalledWith(mockHtml)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString() }
      })
      const res = createMockResponse()

      await printOrderToPDF(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('getOrderById', () => {
    it('should get order by ID successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId }
      })
      const res = createMockResponse()

      const mockOrder = {
        _id: new ObjectId(orderId),
        order_number: 'ORD-123',
        status: 'pending'
      }

      ;(testOrderService.getTestOrderById as jest.Mock).mockResolvedValue(mockOrder)

      await getOrderById(req, res)

      expect(testOrderService.getTestOrderById).toHaveBeenCalledWith(orderId)
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 for invalid ObjectId', async () => {
      const req = createMockRequest({
        params: { id: 'invalid-id' }
      })
      const res = createMockResponse()

      await getOrderById(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 404 when order not found', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId }
      })
      const res = createMockResponse()

      ;(testOrderService.getTestOrderById as jest.Mock).mockResolvedValue(null)

      await getOrderById(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString() }
      })
      const res = createMockResponse()

      await getOrderById(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('updateOrder', () => {
    it('should update order successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId },
        body: { status: 'completed' }
      })
      const res = createMockResponse()

      const mockUpdated = {
        _id: new ObjectId(orderId),
        status: 'completed',
        order_number: 'ORD-123'
      }

      ;(testOrderService.updateTestOrder as jest.Mock).mockResolvedValue(mockUpdated)

      await updateOrder(req, res)

      expect(testOrderService.updateTestOrder).toHaveBeenCalledWith(
        orderId,
        { status: 'completed' },
        expect.any(ObjectId)
      )
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 for invalid ObjectId', async () => {
      const req = createMockRequest({
        params: { id: 'invalid-id' },
        body: { status: 'completed' }
      })
      const res = createMockResponse()

      await updateOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 404 when order not found', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId },
        body: { status: 'completed' }
      })
      const res = createMockResponse()

      ;(testOrderService.updateTestOrder as jest.Mock).mockResolvedValue(null)

      await updateOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString() },
        body: { status: 'completed' }
      })
      const res = createMockResponse()

      await updateOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId }
      })
      const res = createMockResponse()

      const mockOrder = {
        _id: new ObjectId(orderId),
        order_number: 'ORD-123'
      }

      ;(testOrderService.getTestOrderById as jest.Mock).mockResolvedValue(mockOrder)
      ;(testOrderService.deleteTestOrder as jest.Mock).mockResolvedValue(true)

      await deleteOrder(req, res)

      expect(testOrderService.deleteTestOrder).toHaveBeenCalledWith(orderId)
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 for invalid ObjectId', async () => {
      const req = createMockRequest({
        params: { id: 'invalid-id' }
      })
      const res = createMockResponse()

      await deleteOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 404 when order not found', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId }
      })
      const res = createMockResponse()

      ;(testOrderService.getTestOrderById as jest.Mock).mockResolvedValue(null)

      await deleteOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString() }
      })
      const res = createMockResponse()

      await deleteOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('syncRawTestResultController', () => {
    it('should sync raw test result successfully', async () => {
      const rawResultId = new ObjectId().toString()
      const req = createMockRequest({
        params: { rawResultId }
      })
      const res = createMockResponse()

      const mockUpdated = {
        _id: new ObjectId(),
        order_number: 'ORD-123',
        status: 'completed'
      }

      ;(testOrderService.syncRawTestResult as jest.Mock).mockResolvedValue(mockUpdated)

      await syncRawTestResultController(req, res)

      expect(testOrderService.syncRawTestResult).toHaveBeenCalledWith(rawResultId, expect.any(ObjectId))
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 for invalid raw result ID', async () => {
      const req = createMockRequest({
        params: { rawResultId: 'invalid-id' }
      })
      const res = createMockResponse()

      await syncRawTestResultController(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { rawResultId: new ObjectId().toString() }
      })
      const res = createMockResponse()

      await syncRawTestResultController(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('reviewOrder', () => {
    it('should review order successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId },
        body: {
          adjustments: [{ test_result_id: new ObjectId().toString(), new_value: 150 }],
          comment: 'Reviewed'
        }
      })
      const res = createMockResponse()

      const mockUpdated = {
        _id: new ObjectId(orderId),
        status: 'reviewed'
      }

      ;(testOrderReviewService.reviewTestOrder as jest.Mock).mockResolvedValue(mockUpdated)

      await reviewOrder(req, res)

      expect(testOrderReviewService.reviewTestOrder).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 for invalid ObjectId', async () => {
      const req = createMockRequest({
        params: { id: 'invalid-id' },
        body: { adjustments: [], comment: 'Reviewed' }
      })
      const res = createMockResponse()

      await reviewOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString() },
        body: { adjustments: [], comment: 'Reviewed' }
      })
      const res = createMockResponse()

      await reviewOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('aiPreviewOrder', () => {
    it('should preview AI review successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId }
      })
      const res = createMockResponse()

      const mockResult = {
        predictions: [{ parameter: 'glucose', suggestion: 'flag', reason: 'High value' }]
      }

      jest.doMock('../services/testOrderReview.service', () => ({
        aiPreviewTestOrder: jest.fn().mockResolvedValue(mockResult)
      }))

      await aiPreviewOrder(req, res)

      expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 for invalid ObjectId', async () => {
      const req = createMockRequest({
        params: { id: 'invalid-id' }
      })
      const res = createMockResponse()

      await aiPreviewOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString() }
      })
      const res = createMockResponse()

      await aiPreviewOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('aiReviewOrder', () => {
    it('should AI review order successfully', async () => {
      const orderId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: orderId }
      })
      const res = createMockResponse()

      const mockResult = {
        status: 'ai_reviewed',
        suggestions: []
      }

      ;(testOrderReviewService.aiReviewTestOrder as jest.Mock).mockResolvedValue(mockResult)

      await aiReviewOrder(req, res)

      expect(testOrderReviewService.aiReviewTestOrder).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 for invalid ObjectId', async () => {
      const req = createMockRequest({
        params: { id: 'invalid-id' }
      })
      const res = createMockResponse()

      await aiReviewOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { id: new ObjectId().toString() }
      })
      const res = createMockResponse()

      await aiReviewOrder(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })
})
