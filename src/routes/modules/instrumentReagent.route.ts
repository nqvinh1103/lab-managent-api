import { Router } from 'express';
import {
  createReagentController,
  getReagentsController,
  getReagentByIdController,
  updateReagentController,
  deleteReagentController
} from '../../controllers/instrumentReagent.controller';

const router = Router();

router.post('/', createReagentController);
router.get('/', getReagentsController);
router.get('/:id', getReagentByIdController);
router.put('/:id', updateReagentController);
router.delete('/:id', deleteReagentController);

export default router;
