import express from 'express';
import { createPost, getFeed, likePost, commentOnPost } from '../controllers/postController';
import { authenticate } from '../middlewares/authMiddleware';  // Ensure correct import path

const router = express.Router();

// All post routes are protected
router.post('/posts', authenticate, createPost);
router.get('/feed', authenticate, getFeed);
router.post('/posts/:postId/like', authenticate, likePost);
router.post('/posts/:postId/comment', authenticate, commentOnPost);

export default router;
