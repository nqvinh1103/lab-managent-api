import { Router } from 'express'
import {
  addCommentToOrder,
  addResultsToOrder,
  completeOrder,
  createOrder,
  deleteCommentFromOrder,
  deleteOrder,
  exportOrdersToExcel,
  getOrderById,
  getOrders,
  printOrderToPDF,
  processSampleOrder,
  syncRawTestResultController,
  updateCommentInOrder,
  updateOrder
} from '../../controllers/testOrder.controller'
import { authMiddleware, checkPrivilege } from '~/middlewares/auth.middleware'
import { PRIVILEGES } from '~/constants/privileges'
import { validationMiddleware } from '~/middlewares/validation.middleware'
import {
  createTestOrderValidation,
  updateTestOrderValidation,
  testOrderIdValidation,
  addCommentValidation,
  updateCommentValidation,
  deleteCommentValidation,
  addResultsValidation,
  completeTestOrderValidation,
  processSampleValidation,
  printTestOrderValidation
} from '~/middlewares/validations/testOrder.validation'

const router = Router()

// Create Test Order
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.CREATE_TEST_ORDER]),
  ...createTestOrderValidation,
 
  validationMiddleware,
  createOrder
)

// Process Sample (auto-create from barcode) (3.6.1.2)
router.post(
  '/process-sample',
  authMiddleware,
  checkPrivilege([PRIVILEGES.CREATE_TEST_ORDER]),
  ...processSampleValidation,
  validationMiddleware,
  processSampleOrder
)

// Get all Test Orders
router.get(
  '/',
  authMiddleware,
  getOrders
)

// Get Test Order by ID
router.get(
  '/:id',
  authMiddleware,
  ...testOrderIdValidation,
  validationMiddleware,
  getOrderById
)

// Update Test Order
router.put(
  '/:id',
  authMiddleware,
  ...updateTestOrderValidation,
  validationMiddleware,
  updateOrder
)

// Delete Test Order
router.delete(
  '/:id',
  authMiddleware,
  ...testOrderIdValidation,
  validationMiddleware,
  deleteOrder
)

// Comment Management (3.5.3)

// Add comment to test order
router.post(
  '/:id/comments',
  authMiddleware,
  checkPrivilege([PRIVILEGES.ADD_COMMENT]),
  ...addCommentValidation,
  validationMiddleware,
  addCommentToOrder
)

// Update comment in test order
router.put(
  '/:id/comments/:commentIndex',
  authMiddleware,
  checkPrivilege([PRIVILEGES.MODIFY_COMMENT]),
  ...updateCommentValidation,
  validationMiddleware,
  updateCommentInOrder
)

// Delete comment from test order
router.delete(
  '/:id/comments/:commentIndex',
  authMiddleware,
  checkPrivilege([PRIVILEGES.DELETE_COMMENT]),
  ...deleteCommentValidation,
  validationMiddleware,
  deleteCommentFromOrder
)

// Test Execution Flow

// Add test results with flagging
router.put(
  '/:id/results',
  authMiddleware,
  checkPrivilege([PRIVILEGES.EXECUTE_BLOOD_TESTING]),
  ...addResultsValidation,
  validationMiddleware,
  addResultsToOrder
)

// Complete test order with reagent tracking
router.post(
  '/:id/complete',
  authMiddleware,
  checkPrivilege([PRIVILEGES.EXECUTE_BLOOD_TESTING]),
  ...completeTestOrderValidation,
  validationMiddleware,
  completeOrder
)

// Reporting

// Export test orders to Excel (3.5.4.1)
router.get(
  '/export',
  authMiddleware,
  checkPrivilege([PRIVILEGES.REVIEW_TEST_ORDER]),
  exportOrdersToExcel
)

// Print test order to PDF (3.5.4.2)
router.get(
  '/:id/print',
  authMiddleware,
  checkPrivilege([PRIVILEGES.REVIEW_TEST_ORDER]),
  ...printTestOrderValidation,
  validationMiddleware,
  printOrderToPDF
)

// Sync raw test result (3.6.1.4)
router.post(
  '/sync-raw-result/:rawResultId',
  authMiddleware,
  checkPrivilege([PRIVILEGES.EXECUTE_BLOOD_TESTING]),
  syncRawTestResultController
)

export default router
