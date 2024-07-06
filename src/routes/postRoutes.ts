import express from 'express';
import multer from 'multer';
import { createPost, getFeed, likePost, commentOnPost } from '../controllers/postController';
import { authenticate } from '../middlewares/authMiddleware';  // Ensure correct import path

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Configure the upload destination

// All post routes are protected
router.post('/post-feed', authenticate, upload.single('mediaFile'), createPost);
router.get('/feed', authenticate, getFeed);
router.post('/:postId/like', authenticate, likePost);
router.post('/:postId/comment', authenticate, commentOnPost);

export default router;
    