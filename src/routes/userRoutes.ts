import express from 'express';
import { register, login, followUser } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';  // Ensure correct import path

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.patch('/follow/:followId', authenticate, followUser);

export default router;
