import { Request, Response, NextFunction } from "express";
import Post from "../models/Post";
import Like from "../models/Like";
import Comment from "../models/Comment";
import mongoose from "mongoose";
import { extractMentions } from "../utils/mentionUtils";
import User, { IUser } from "../models/User";
import path from "path";
import logger from "../utils/logger";
import cache from "../utils/cache";

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    logger.warn("Unauthorized access attempt to create a post");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Since we've already checked that req.user is not undefined, it's safe to assert non-null here
  const username = req.user.username; // Now safe to access directly after the initial check

  try {
    const { content } = req.body;
    let mediaUrl = "";

    if (req.file) {
      mediaUrl = path.join("uploads", req.file.filename); // Ensure your path handling aligns with your server setup
    }

    const post = new Post({
      createdBy: req.user._id,
      content,
      mediaUrl,
    });
    await post.save();
    logger.info(`Post created by ${username}`);

    const mentions = extractMentions(content);
    const mentionPromises = mentions.map(async (username) => {
      const mentionedUser = (await User.findOne({ username })) as IUser | null;
      if (mentionedUser && mentionedUser.socketId) {
        req.app.locals.io.to(mentionedUser.socketId).emit("mentionedInPost", {
          postId: post._id,
          postContent: content.slice(0, 100),
          fromUser: username,
        });
        logger.info(
          `Notification sent to @${username} for being mentioned in a post.`
        );
      }
    });

    await Promise.all(mentionPromises);

    // Invalidate cache
    const keys = cache.keys();
    const relevantKeys = keys.filter((key) =>
      key.startsWith(`feed_${req.user!._id}_page_`)
    );
    relevantKeys.forEach((key) => cache.del(key));
    logger.info("Cache invalidated after post creation.");

    res.status(201).json(post);
  } catch (error) {
    logger.error("Error creating post: ", error);
    next(error);
  }
};

export const getFeed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    logger.warn("Unauthorized access attempt to get feed");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;
  const cacheKey = `feed_${req.user.id}_page_${page}`;

  // Try to get data from cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    logger.info("Feed retrieved from cache");
    return res.json(cachedData);
  }

  try {
    const posts = await Post.find({
      createdBy: { $in: req.user.following },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!posts.length) {
      logger.info("No posts found from the users followed by the user");
      return res.status(404).json({
        message: "No posts found from the users you are following.",
      });
    }

    const totalPosts = await Post.countDocuments({
      createdBy: { $in: req.user.following },
    });
    const totalPages = Math.ceil(totalPosts / limit);

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const likes = await Like.find({ postId: post._id });
        const comments = await Comment.find({ postId: post._id });
        return {
          ...post.toJSON(),
          likeCount: likes.length,
          commentCount: comments.length,
          likes: likes.map((like) => ({
            userId: like.userId,
            date: like.createdAt,
          })),
          comments: comments.map((comment) => ({
            userId: comment.userId,
            text: comment.comment,
            date: comment.createdAt,
          })),
        };
      })
    );

    const responseData = {
      page,
      totalPages,
      totalPosts,
      posts: postsWithDetails,
    };

    // Save data to cache
    cache.set(cacheKey, responseData);

    logger.info("Feed retrieved and cached successfully");
    res.json(responseData);
  } catch (error) {
    next(error);
  }
};

export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    logger.warn("Unauthorized access attempt to like a post");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      logger.warn(`Invalid postId format: ${postId}`);
      return res.status(400).json({ message: "Invalid postId format" });
    }

    const postExists = await Post.findById(postId);
    if (!postExists) {
      logger.warn(`Post not found: ${postId}`);
      return res.status(404).json({ message: "Post not found" });
    }

    const existingLike = await Like.findOne({ postId, userId: req.user.id });
    if (existingLike) {
      logger.info(`User ${req.user.username} already liked post ${postId}`);
      return res.status(400).send("You already liked this post");
    }

    const like = new Like({ postId, userId: req.user.id });
    await like.save();

    req.app.locals.io.emit("likePost", {
      postId: postId,
      userId: req.user.id,
      userName: req.user.username,
    });

    logger.info(
      `Like by ${req.user.username} event emitted for post ${postId}`
    );
    res.status(201).send("Post liked");
  } catch (error: unknown) {
    next(error);
  }
};

export const commentOnPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    logger.warn("Unauthorized access attempt to comment on a post");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const newComment = new Comment({
      postId,
      userId: req.user.id,
      comment,
    });
    await newComment.save();

    const userDetail = {
      id: req.user.id,
      name: req.user.username,
    };

    req.app.locals.io.emit("commentPost", {
      postId,
      comment,
      user: userDetail,
    });

    // Handle mentions
    const mentions = extractMentions(comment);
    logger.info(`Extracted mentions: ${mentions.join(", ")}`);
    const mentionPromises = mentions.map(async (username) => {
      const mentionedUser = (await User.findOne({ username })) as IUser | null;
      if (mentionedUser) {
        if (mentionedUser.socketId) {
          req.app.locals.io
            .to(mentionedUser.socketId)
            .emit("mentionedInComment", {
              postId,
              commentId: newComment._id,
              fromUser: userDetail,
              commentText: comment,
            });
          logger.info(`Notification sent to @${username} for being mentioned.`);
        } else {
          logger.info(`No active socket ID for @${username}`);
        }
      } else {
        logger.info(`No user found for @${username}`);
      }
    });

    await Promise.all(mentionPromises);

    logger.info(
      `Comment event emitted for post ${postId} by ${userDetail.name}: '${comment}'`
    );
    res.status(201).json(newComment);
  } catch (error: unknown) {
    next(error);
  }
};
