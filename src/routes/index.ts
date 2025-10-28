import { Router } from 'express'
import authRoutes from './modules/auth.route'
import roleRoutes from './modules/role.route'
import userRoutes from './modules/user.route'
import privilegeRoutes from './modules/privilege.route'
import patientRoutes from './modules/patient.route'

const router = Router()

// Auth routes
router.use('/auth', authRoutes)

// User management routes
router.use('/users', userRoutes)

// Role management routes
router.use('/roles', roleRoutes)

// Privilege management routes
router.use('/privileges', privilegeRoutes)

// Patient management routes
router.use('/patients', patientRoutes)

export default router
