import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getTasks,
  createTask,
  updateTask,
  toggleComplete,
  deleteTask,
} from '../controllers/taskController';

const router = Router();

// Every task route requires a valid JWT
router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', toggleComplete);
router.delete('/:id', deleteTask);

export default router;
