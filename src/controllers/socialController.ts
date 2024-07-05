import { Request, Response } from 'express';
import Like from '../models/Like';
import Comment from '../models/Comment';
import { isError } from '../utils/errorUtils'; // Import the isError function

export const likePost = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { postId } = req.params;
    const existingLike = await Like.findOne({ postId, userId: req.user.id });
    if (existingLike) {
      return res.status(400).send('You already liked this post');
    }
    const like = new Like({ postId, userId: req.user.id });
    await like.save();
    res.status(201).send('Post liked');
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const commentOnPost = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const newComment = new Comment({ postId, userId: req.user.id, comment });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
