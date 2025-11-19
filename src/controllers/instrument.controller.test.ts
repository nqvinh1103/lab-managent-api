// Print minimal runtime info to terminal when running `npm test`
console.log('npm test -> running instrument.controller tests', {
  time: new Date().toISOString(),
  pid: process.pid,
  argv: process.argv.slice(2)
})

// Ensure test env and critical mocks are set before other imports to avoid side-effects
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key'
/* eslint-disable @typescript-eslint/no-var-requires */
// Mock AI/openai related services early to prevent dynamic import issues during other test imports
jest.mock('../services/testOrderReview.service', () => ({
  reviewTestOrder: jest.fn(),
  aiPreviewTestOrder: jest.fn().mockResolvedValue({ predictions: [] }),
  aiReviewTestOrder: jest.fn().mockResolvedValue({ status: 'ai_reviewed', suggestions: [] })
}))
jest.mock('../services/openai.service', () => ({
  callOpenAI: jest.fn().mockResolvedValue({})
  // add other exports if needed
}))

import { ObjectId } from 'mongodb'
import {
  createInstrument,
  getInstruments,
  getInstrumentById,
  updateInstrument,
  deleteInstrument
} from './instrument.controller'
import * as instrumentService from '../services/instrument.service'
import * as eventLogHelper from '../utils/eventLog.helper'
import { HTTP_STATUS } from '../constants/httpStatus'
import { MESSAGES } from '../constants/messages'

// Mock dependencies (explicit factories so exported functions exist as jest.fn())
jest.mock('../services/instrument.service', () => ({
  createInstrument: jest.fn(),
  getAllInstruments: jest.fn(),
  getInstrumentById: jest.fn(),
  updateInstrument: jest.fn(),
  deleteInstrument: jest.fn()
}))
jest.mock('../utils/eventLog.helper', () => ({
  logEvent: jest.fn()
}))

// Mock database with proper collection support (align with testOrder tests)
const mockCollection = {
  findOne: jest.fn()
}
jest.mock('../config/database', () => ({
  getCollection: jest.fn(() => mockCollection)
}))

// Mock response helper (aligned with testOrder.controller.test.ts)
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
      roles: ['lab_admin']
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

describe('InstrumentController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createInstrument', () => {
    it('should create an instrument successfully', async () => {
      const req = createMockRequest({
        body: { name: 'Analyzer X', model: 'X100' }
      })
      const res = createMockResponse()

      const mockInstrument = {
        _id: new ObjectId(),
        name: 'Analyzer X',
        model: 'X100'
      }

      ;(instrumentService.createInstrument as jest.Mock).mockResolvedValue({
        success: true,
        data: mockInstrument
      })

      await createInstrument(req, res)

      expect(instrumentService.createInstrument).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Analyzer X', model: 'X100' }),
        expect.any(ObjectId)
      )
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({ user: undefined, body: { name: 'A' } })
      const res = createMockResponse()

      await createInstrument(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should return 400 when name is missing', async () => {
      const req = createMockRequest({ body: { model: 'X100' } })
      const res = createMockResponse()

      await createInstrument(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should handle service error response', async () => {
      const req = createMockRequest({ body: { name: 'Analyzer' } })
      const res = createMockResponse()

      ;(instrumentService.createInstrument as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Duplicate'
      })

      await createInstrument(req, res)

      expect(instrumentService.createInstrument).toHaveBeenCalled()
    })
  })

  describe('getInstruments', () => {
    it('should return list of instruments', async () => {
      const req = createMockRequest()
      const res = createMockResponse()

      const mockList = [
        { _id: new ObjectId(), name: 'A' },
        { _id: new ObjectId(), name: 'B' }
      ]

      ;(instrumentService.getAllInstruments as jest.Mock).mockResolvedValue(mockList)

      await getInstruments(req, res)

      expect(instrumentService.getAllInstruments).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({ user: undefined })
      const res = createMockResponse()

      await getInstruments(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })

    it('should handle service failure', async () => {
      const req = createMockRequest()
      const res = createMockResponse()

      ;(instrumentService.getAllInstruments as jest.Mock).mockRejectedValue(new Error('DB error'))

      await getInstruments(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    })
  })

  describe('getInstrumentById', () => {
    it('should return 400 for invalid ObjectId', async () => {
      const req = createMockRequest({ params: { id: 'invalid-id' } })
      const res = createMockResponse()

      await getInstrumentById(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'Invalid instrument ID' }))
    })

    it('should return 404 when instrument not found', async () => {
      const id = new ObjectId().toString()
      const req = createMockRequest({ params: { id } })
      const res = createMockResponse()

      ;(instrumentService.getInstrumentById as jest.Mock).mockResolvedValue(null)

      await getInstrumentById(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'Instrument not found' }))
    })

    it('should return 200 and instrument data when found', async () => {
      const id = new ObjectId().toString()
      const mockInstrument = { _id: id, name: 'Instrument A' }
      const req = createMockRequest({ params: { id } })
      const res = createMockResponse()

      ;(instrumentService.getInstrumentById as jest.Mock).mockResolvedValue(mockInstrument)

      await getInstrumentById(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockInstrument }))
    })
  })

  describe('updateInstrument', () => {
    it('should update instrument successfully', async () => {
      const id = new ObjectId().toString()
      const req = createMockRequest({ params: { id }, body: { name: 'Updated' } })
      const res = createMockResponse()

      const mockUpdated = { _id: new ObjectId(id), name: 'Updated' }
      ;(instrumentService.updateInstrument as jest.Mock).mockResolvedValue(mockUpdated)

      await updateInstrument(req, res)

      expect(instrumentService.updateInstrument).toHaveBeenCalledWith(id, { name: 'Updated' }, expect.any(ObjectId))
      expect(eventLogHelper.logEvent).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })

    it('should return 400 for invalid id', async () => {
      const req = createMockRequest({ params: { id: 'bad-id' }, body: { name: 'x' } })
      const res = createMockResponse()

      await updateInstrument(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })

    it('should return 404 when update returns null', async () => {
      const id = new ObjectId().toString()
      const req = createMockRequest({ params: { id }, body: { name: 'x' } })
      const res = createMockResponse()

      ;(instrumentService.updateInstrument as jest.Mock).mockResolvedValue(null)

      await updateInstrument(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
    })

    it('should return 401 when unauthenticated', async () => {
      const req = createMockRequest({ user: undefined, params: { id: new ObjectId().toString() }, body: { name: 'x' } })
      const res = createMockResponse()

      await updateInstrument(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    })
  })

  describe('deleteInstrument', () => {
    it('should return 400 for invalid ObjectId', async () => {
      const req = createMockRequest({ params: { id: 'invalid-id' } })
      const res = createMockResponse()

      await deleteInstrument(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'Invalid instrument ID' }))
    })

    it('should return 404 when instrument not found', async () => {
      const id = new ObjectId().toString()
      const req = createMockRequest({ params: { id } })
      const res = createMockResponse()

      ;(instrumentService.getInstrumentById as jest.Mock).mockResolvedValue(null)

      await deleteInstrument(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'Instrument not found' }))
    })

    it('should return 200 when instrument is deleted successfully', async () => {
      const id = new ObjectId().toString()
      const req = createMockRequest({ params: { id } })
      const res = createMockResponse()

      const mockInstrument = { _id: id, name: 'Instrument A' }
      ;(instrumentService.getInstrumentById as jest.Mock).mockResolvedValue(mockInstrument)
      ;(instrumentService.deleteInstrument as jest.Mock).mockResolvedValue(true)

      await deleteInstrument(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Instrument deleted successfully' })
      )
    })
  })
})
