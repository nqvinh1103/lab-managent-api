import { Router } from 'express';
import {
  createReagentController,
  getReagentsController,
  getReagentByIdController,
  updateReagentController,
  deleteReagentController
} from '../../controllers/instrumentReagent.controller';
import { authMiddleware, checkPrivilege } from '~/middlewares/auth.middleware';
import { validationMiddleware } from '~/middlewares/validation.middleware';


const router = Router();
router.post(
  '/',
  authMiddleware,
  createReagentController
);


// Get all reagents
router.get(
  '/',
  authMiddleware,
  getReagentsController
);

// Get reagent by ID
router.get(
  '/:id',
  authMiddleware,
  validationMiddleware,
  getReagentByIdController
);

// Update reagent
router.put(
  '/:id',
  authMiddleware,
  validationMiddleware,
  updateReagentController
);

// Delete reagent
router.delete(
  '/:id',
  authMiddleware,
  validationMiddleware,
  deleteReagentController
);

export default router;
