import { Router } from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from '../../controllers/testOrder.controller'
import { authMiddleware, checkPrivilege } from '~/middlewares/auth.middleware'
import { PRIVILEGES } from '~/constants/privileges'
import { validationMiddleware } from '~/middlewares/validation.middleware'

const router = Router()

// Create Test Order
router.post(
  '/',
  authMiddleware,
  checkPrivilege([PRIVILEGES.CREATE_TEST_ORDER]),
  validationMiddleware,
  createOrder
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
  validationMiddleware,
  getOrderById
)

// Update Test Order
router.put(
  '/:id',
  authMiddleware,
  validationMiddleware,
  updateOrder
)

// Delete Test Order
router.delete(
  '/:id',
  authMiddleware,
  validationMiddleware,
  deleteOrder
)

export default router
