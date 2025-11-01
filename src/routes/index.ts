import { Router } from 'express'
import authRoutes from './modules/auth.route'
import configurationRoutes from './modules/configuration.route'
import instrumentRoutes from './modules/instrument.route'
import instrumentReagentRoutes from './modules/instrumentReagent.route'
import parameterRoutes from './modules/parameter.route'
import patientRoutes from './modules/patient.route'
import privilegeRoutes from './modules/privilege.route'
import rawTestResultRoutes from './modules/rawTestResult.route'
import { default as reagentUsageHistoryRoutes, default as reagentUsageRoutes } from './modules/reagentUsageHistory.route'
import reagentVendorSupplyRoutes from './modules/reagentVendorSupply.route'
import roleRoutes from './modules/role.route'
import testOrderRoutes from './modules/testOrder.route'
import testResultRoutes from './modules/testResult.route'
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

// Configuration routes
router.use('/configurations', configurationRoutes)

// Parameter routes
router.use('/parameters', parameterRoutes)

// Test order routes
router.use('/test-orders', testOrderRoutes)
// Patient management routes
router.use('/patients', patientRoutes)

// Instrument routes
router.use('/instruments', instrumentRoutes)

// Instrument Reagent routes
router.use('/instrument-reagents', instrumentReagentRoutes)

// Reagent Vendor Supply routes
router.use('/reagent-vendor-supply', reagentVendorSupplyRoutes)

// Reagent Usage History routes
router.use('/reagent-usage-history', reagentUsageHistoryRoutes)

// Reagent usage history routes
router.use('/reagent-usage', reagentUsageRoutes);

// TestResult routes
router.use('/test-results', testResultRoutes);
// Monitoring routes (Raw Test Results)
router.use('/monitoring/raw-results', rawTestResultRoutes)

export default router
