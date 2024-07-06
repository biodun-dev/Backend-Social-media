import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import Post from '../models/Post';
import Like from '../models/Like';
import Comment from '../models/Comment';
import { isError } from '../utils/errorUtils';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    logger.info(`User registered successfully: ${username}`);
    res.status(201).send("User registered successfully");
  } catch (error: unknown) {
    if (isError(error)) {
      logger.error(`Error registering user: ${error.message}`);
      res.status(500).json({ message: error.message });
    } else {
      logger.error('Unknown error registering user');
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      logger.warn('Authentication failed for email: ' + email);
      return res.status(401).send("Authentication failed");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    logger.info(`User logged in successfully: ${email}`);
    res.json({ token });
  } catch (error: unknown) {
    if (isError(error)) {
      logger.error(`Error logging in user: ${error.message}`);
      res.status(500).json({ message: error.message });
    } else {
      logger.error('Unknown error logging in user');
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const followUser = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { followId } = req.params; // ID of the user to follow
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn(`User not found: ${req.user.id}`);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.following.includes(followId as any)) {
      user.following.push(followId as any);
      await user.save();
      logger.info(`User followed successfully: ${followId}`);
      res.status(200).send("User followed");
    } else {
      logger.info(`Already following user: ${followId}`);
      res.status(400).send("Already following this user");
    }
  } catch (error: unknown) {
    if (isError(error)) {
      logger.error(`Error following user: ${error.message}`);
      res.status(500).json({ message: error.message });
    } else {
      logger.error('Unknown error following user');
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getUserData = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const userId = req.user.id;

    // Fetch posts created by the user
    const posts = await Post.find({ createdBy: userId });

    // For each post, fetch likes and comments
    const postDetails = await Promise.all(posts.map(async (post) => {
      const likes = await Like.find({ postId: post._id }).populate('userId', 'username');
      const comments = await Comment.find({ postId: post._id }).populate('userId', 'username');
      return { ...post.toJSON(), likes, comments };
    }));

    // Fetch followers of the user
    const followers = await User.find({ following: { $in: [userId] } }, 'username');

    const userData = {
      posts: postDetails,
      followers
    };

    logger.info(`User data retrieved successfully for user: ${userId}`);
    res.json(userData);
  } catch (error: unknown) {
    if (isError(error)) {
      logger.error(`Error retrieving user data: ${error.message}`);
      res.status(500).json({ message: error.message });
    } else {
      logger.error('Unknown error retrieving user data');
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
