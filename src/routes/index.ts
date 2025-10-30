import { Router } from 'express'
import authRoutes from './modules/auth.route'
import eventLogRoutes from './modules/eventLog.route'
import instrumentRoutes from './modules/instrument.route'
import instrumentReagentRoutes from './modules/instrumentReagent.route'
import patientRoutes from './modules/patient.route'
import privilegeRoutes from './modules/privilege.route'
import roleRoutes from './modules/role.route'
import testOrderRoutes from './modules/testOrder.route'
import userRoutes from './modules/user.route'

const router = Router()

// Auth routes
router.use('/auth', authRoutes)

// User management routes
router.use('/users', userRoutes)

// Role management routes
router.use('/roles', roleRoutes)

// Privilege management routes
router.use('/privileges', privilegeRoutes)

// Test order routes
router.use('/test-orders', testOrderRoutes)
// Patient management routes
router.use('/patients', patientRoutes)

// Instrument routes
router.use('/instruments', instrumentRoutes)

// Instrument Reagent routes
router.use('/instrument-reagents', instrumentReagentRoutes)

// Event log routes
router.use('/event-logs', eventLogRoutes)

export default router
