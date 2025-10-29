import { Router } from 'express'
import authRoutes from './modules/auth.route'
import roleRoutes from './modules/role.route'
import userRoutes from './modules/user.route'
import privilegeRoutes from './modules/privilege.route'
import testOrderRoutes from './modules/testOrder.route'
import patientRoutes from './modules/patient.route'
import instrumentReagentRoutes from './modules/instrumentReagent.routes';


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

// Instrument Reagent routes
router.use('/instrument-reagents', instrumentReagentRoutes);
export default router
