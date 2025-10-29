import { Router } from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from '../../controllers/testOrder.controller'

const router = Router()

// Routes for Test Orders
router.post('/', createOrder)
router.get('/', getOrders)
router.get('/:id', getOrderById)
router.put('/:id', updateOrder)
router.delete('/:id', deleteOrder)

export default router
