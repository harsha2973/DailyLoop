import { Router } from 'express';
import { register, login, changePassword, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', protect, changePassword);
router.put('/profile', protect, updateProfile);

export default router;

