// Print minimal runtime info to terminal when running `npm test`
console.log('npm test -> running patient.controller tests', {
  time: new Date().toISOString(),
  pid: process.pid,
  argv: process.argv.slice(2)
})

// Ensure test env and critical mocks are set before other imports to avoid side-effects
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key'

jest.mock('../services/testOrderReview.service', () => ({
  reviewTestOrder: jest.fn(),
  aiPreviewTestOrder: jest.fn().mockResolvedValue({ predictions: [] }),
  aiReviewTestOrder: jest.fn().mockResolvedValue({ status: 'ai_reviewed', suggestions: [] })
}))

jest.mock('../services/openai.service', () => ({
  callOpenAI: jest.fn().mockResolvedValue({})
}))

import { ObjectId } from 'mongodb'
import {
  createPatient,
  getPatient,
  getMyProfile,
  updatePatient,
  deletePatient,
  listPatients,
  getPatientTestOrders
} from './patient.controller'
import { PatientService } from '../services/patient.service'
import * as eventLogHelper from '../utils/eventLog.helper'
import { HTTP_STATUS } from '../constants/httpStatus'
import { MESSAGES } from '../constants/messages'

// Mock dependencies
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
  handleCreateResult: jest.fn((res, result) => {
    if (!result.success) {
      res.status(result.statusCode || HTTP_STATUS.BAD_REQUEST).json({ success: false, error: result.error })
    }
  }),
  handleUpdateResult: jest.fn((res, result) => {
    if (!result.success) {
      res.status(result.statusCode || HTTP_STATUS.BAD_REQUEST).json({ success: false, error: result.error })
    }
  }),
  handleGetResult: jest.fn((res, result, options) => {
    if (!result.success) {
      res.status(result.statusCode || HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: options?.notFoundMessage || result.error
      })
    }
  })
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

describe('PatientController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createPatient', () => {
    it('should create a patient successfully', async () => {
      const req = createMockRequest({
        body: {
          email: 'patient@example.com',
          full_name: 'John Doe',
          phone: '1234567890',
          date_of_birth: '1990-01-01'
        }
      })
      const res = createMockResponse()

      const mockPatient = {
        _id: new ObjectId(),
        email: 'patient@example.com',
        full_name: 'John Doe',
        phone: '1234567890',
        date_of_birth: '1990-01-01',
        created_by: new ObjectId(req.user.id)
      }

      ;(PatientService.prototype.create as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPatient
      })

      await createPatient(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED)
      expect(res.json).toHaveBeenCalled()
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
    })

    it('should handle service error when creating patient', async () => {
      const req = createMockRequest({
        body: { email: 'patient@example.com', full_name: 'John Doe' }
      })
      const res = createMockResponse()

      ;(PatientService.prototype.create as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Email already exists'
      })

      await createPatient(req, res)

      expect(res.status).toHaveBeenCalled()
    })

    it('should handle exception during patient creation', async () => {
      const req = createMockRequest({
        body: { email: 'patient@example.com', full_name: 'John Doe' }
      })
      const res = createMockResponse()

      ;(PatientService.prototype.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      await createPatient(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    })
  })

  describe('getPatient', () => {
    it('should get patient by ID successfully', async () => {
      const patientId = new ObjectId().toString()
      const req = createMockRequest({ params: { id: patientId } })
      const res = createMockResponse()

      const mockPatient = {
        _id: patientId,
        email: 'patient@example.com',
        full_name: 'John Doe'
      }

      ;(PatientService.prototype.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPatient
      })

      await getPatient(req, res)

      expect(PatientService.prototype.getById).toHaveBeenCalledWith(patientId)
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 404 when patient not found', async () => {
      const req = createMockRequest({ params: { id: new ObjectId().toString() } })
      const res = createMockResponse()

      ;(PatientService.prototype.getById as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Patient not found'
      })

      await getPatient(req, res)

      expect(res.status).toHaveBeenCalled()
    })

    it('should handle exception when getting patient', async () => {
      const req = createMockRequest({ params: { id: new ObjectId().toString() } })
      const res = createMockResponse()

      ;(PatientService.prototype.getById as jest.Mock).mockRejectedValue(new Error('Database error'))

      await getPatient(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    })
  })

  describe('getMyProfile', () => {
    it('should get logged-in patient profile', async () => {
      const userId = new ObjectId().toString()
      const req = createMockRequest({ user: { id: userId, email: 'test@example.com', roles: ['patient'] } })
      const res = createMockResponse()

      const mockProfile = {
        _id: new ObjectId(),
        user_id: userId,
        email: 'test@example.com',
        full_name: 'John Doe'
      }

      ;(PatientService.prototype.getByUserId as jest.Mock).mockResolvedValue({
        success: true,
        data: mockProfile
      })

      await getMyProfile(req, res)

      expect(PatientService.prototype.getByUserId).toHaveBeenCalledWith(userId)
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({ user: undefined })
      const res = createMockResponse()

      await getMyProfile(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should handle when patient profile not found', async () => {
      const req = createMockRequest({
        user: { id: new ObjectId().toString(), email: 'test@example.com', roles: ['patient'] }
      })
      const res = createMockResponse()

      ;(PatientService.prototype.getByUserId as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Patient profile not found'
      })

      await getMyProfile(req, res)

      expect(res.status).toHaveBeenCalled()
    })

    it('should handle exception when getting profile', async () => {
      const req = createMockRequest({
        user: { id: new ObjectId().toString(), email: 'test@example.com', roles: ['patient'] }
      })
      const res = createMockResponse()

      ;(PatientService.prototype.getByUserId as jest.Mock).mockRejectedValue(new Error('Database error'))

      await getMyProfile(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    })
  })

  describe('updatePatient', () => {
    it('should update patient successfully', async () => {
      const patientId = new ObjectId().toString()
      const userId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: patientId },
        body: { full_name: 'Jane Doe', phone: '9876543210' },
        user: { id: userId, email: 'admin@example.com', roles: ['admin'] }
      })
      const res = createMockResponse()

      const mockUpdated = {
        _id: patientId,
        email: 'patient@example.com',
        full_name: 'Jane Doe',
        phone: '9876543210'
      }

      ;(PatientService.prototype.update as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUpdated
      })

      await updatePatient(req, res)

      expect(PatientService.prototype.update).toHaveBeenCalled()
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        params: { id: new ObjectId().toString() },
        body: { full_name: 'Jane Doe' },
        user: undefined
      })
      const res = createMockResponse()

      await updatePatient(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should handle update failure', async () => {
      const patientId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: patientId },
        body: { full_name: 'Jane Doe' }
      })
      const res = createMockResponse()

      ;(PatientService.prototype.update as jest.Mock).mockResolvedValue({
        success: false,
        statusCode: HTTP_STATUS.NOT_FOUND,
        error: 'Patient not found'
      })

      await updatePatient(req, res)

      expect(res.status).toHaveBeenCalled()
    })

    it('should handle exception when updating patient', async () => {
      const req = createMockRequest({
        params: { id: new ObjectId().toString() },
        body: { full_name: 'Jane Doe' }
      })
      const res = createMockResponse()

      ;(PatientService.prototype.update as jest.Mock).mockRejectedValue(new Error('Database error'))

      await updatePatient(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    })
  })

  describe('deletePatient', () => {
    it('should delete patient successfully', async () => {
      const patientId = new ObjectId().toString()
      const userId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: patientId },
        user: { id: userId, email: 'admin@example.com', roles: ['admin'] }
      })
      const res = createMockResponse()

      const mockPatient = {
        _id: patientId,
        email: 'patient@example.com',
        full_name: 'John Doe'
      }

      ;(PatientService.prototype.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPatient
      })
      ;(PatientService.prototype.delete as jest.Mock).mockResolvedValue({
        success: true
      })

      await deletePatient(req, res)

      expect(PatientService.prototype.delete).toHaveBeenCalled()
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        params: { id: new ObjectId().toString() },
        user: undefined
      })
      const res = createMockResponse()

      await deletePatient(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should handle delete failure', async () => {
      const patientId = new ObjectId().toString()
      const req = createMockRequest({
        params: { id: patientId }
      })
      const res = createMockResponse()

      ;(PatientService.prototype.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: { _id: patientId, email: 'patient@example.com' }
      })
      ;(PatientService.prototype.delete as jest.Mock).mockResolvedValue({
        success: false,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        error: 'Cannot delete patient'
      })

      await deletePatient(req, res)

      expect(res.status).toHaveBeenCalled()
    })

    it('should handle exception when deleting patient', async () => {
      const req = createMockRequest({
        params: { id: new ObjectId().toString() }
      })
      const res = createMockResponse()

      ;(PatientService.prototype.getById as jest.Mock).mockResolvedValue({
        success: true,
        data: { _id: req.params.id, email: 'patient@example.com' }
      })
      ;(PatientService.prototype.delete as jest.Mock).mockRejectedValue(new Error('Database error'))

      await deletePatient(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    })
  })

  describe('listPatients', () => {
    it('should list patients with pagination', async () => {
      const req = createMockRequest({
        query: { page: '1', limit: '10', search: '' }
      })
      const res = createMockResponse()

      const mockPatients = [
        { _id: new ObjectId(), email: 'patient1@example.com', full_name: 'Patient 1' },
        { _id: new ObjectId(), email: 'patient2@example.com', full_name: 'Patient 2' }
      ]

      ;(PatientService.prototype.list as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          patients: mockPatients,
          page: 1,
          limit: 10,
          total: 2
        }
      })

      await listPatients(req, res)

      expect(PatientService.prototype.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: ''
      })
      expect(res.json).toHaveBeenCalled()
    })

    it('should use default pagination when not provided', async () => {
      const req = createMockRequest({ query: {} })
      const res = createMockResponse()

      ;(PatientService.prototype.list as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          patients: [],
          page: 1,
          limit: 10,
          total: 0
        }
      })

      await listPatients(req, res)

      expect(PatientService.prototype.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined
      })
    })

    it('should handle list failure', async () => {
      const req = createMockRequest({ query: {} })
      const res = createMockResponse()

      ;(PatientService.prototype.list as jest.Mock).mockResolvedValue({
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error: 'Database query failed'
      })

      await listPatients(req, res)

      expect(res.status).toHaveBeenCalled()
    })

    it('should handle exception when listing patients', async () => {
      const req = createMockRequest({ query: {} })
      const res = createMockResponse()

      ;(PatientService.prototype.list as jest.Mock).mockRejectedValue(new Error('Database error'))

      await listPatients(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    })
  })

  describe('getPatientTestOrders', () => {
    it('should get patient test orders successfully', async () => {
      const patientId = new ObjectId().toString()
      const req = createMockRequest({ params: { id: patientId } })
      const res = createMockResponse()

      const mockTestOrders = [
        { _id: new ObjectId(), order_number: 'ORD-001', status: 'pending' },
        { _id: new ObjectId(), order_number: 'ORD-002', status: 'completed' }
      ]

      ;(PatientService.prototype.getTestOrders as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTestOrders
      })

      await getPatientTestOrders(req, res)

      expect(PatientService.prototype.getTestOrders).toHaveBeenCalledWith(patientId)
      expect(res.json).toHaveBeenCalled()
    })

    it('should return empty array when no test orders found', async () => {
      const patientId = new ObjectId().toString()
      const req = createMockRequest({ params: { id: patientId } })
      const res = createMockResponse()

      ;(PatientService.prototype.getTestOrders as jest.Mock).mockResolvedValue({
        success: true,
        data: []
      })

      await getPatientTestOrders(req, res)

      expect(res.json).toHaveBeenCalled()
    })

    it('should handle get test orders failure', async () => {
      const patientId = new ObjectId().toString()
      const req = createMockRequest({ params: { id: patientId } })
      const res = createMockResponse()

      ;(PatientService.prototype.getTestOrders as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Patient not found'
      })

      await getPatientTestOrders(req, res)

      expect(res.status).toHaveBeenCalled()
    })

    it('should handle exception when getting test orders', async () => {
      const req = createMockRequest({ params: { id: new ObjectId().toString() } })
      const res = createMockResponse()

      ;(PatientService.prototype.getTestOrders as jest.Mock).mockRejectedValue(new Error('Database error'))

      await getPatientTestOrders(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    })
  })
})
