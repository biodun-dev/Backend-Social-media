import { Request, Response } from 'express';
import Post from '../models/Post';
import Like from '../models/Like';
import Comment from '../models/Comment';
import { getCache, setCache } from '../utils/redisClient';
import { isError } from '../utils/errorUtils'; // Import the isError function

export const createPost = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { content, mediaUrl } = req.body;
    const post = new Post({ createdBy: req.user.id, content, mediaUrl });
    await post.save();
    res.status(201).json(post);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getFeed = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const cacheKey = `feed:${req.user.id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.json(JSON.parse(cachedData));

    const posts = await Post.find({ createdBy: { $in: req.user.following } }).sort({ createdAt: -1 });
    await setCache(cacheKey, JSON.stringify(posts));
    res.json(posts);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

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
