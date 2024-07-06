import { Request, Response } from "express";
import Post from "../models/Post";
import Like from "../models/Like";
import Comment from "../models/Comment";
// import { getCache, setCache } from "../utils/redisClient";
import { isError } from "../utils/errorUtils";
import mongoose from "mongoose";

export const createPost = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

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
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const posts = await Post.find({
      createdBy: { $in: req.user.following },
    }).sort({ createdAt: -1 });

    if (!posts.length) {
      return res
        .status(404)
        .json({ message: "No posts found from the users you are following." });
    }

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const likes = await Like.find({ postId: post._id });
        const comments = await Comment.find({ postId: post._id });
        return {
          ...post.toJSON(),
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

    res.json(postsWithDetails);
  } catch (error) {
    console.error("Error in fetching feed:", error);
    res.status(500).json({
      message: isError(error) ? error.message : "An unknown error occurred",
    });
  }
};

export const likePost = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId format" });
    }

    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingLike = await Like.findOne({ postId, userId: req.user.id });
    if (existingLike) {
      return res.status(400).send("You already liked this post");
    }

    const like = new Like({ postId, userId: req.user.id });
    await like.save();

    // Emit WebSocket event with more details
    req.app.locals.io.emit("likePost", {
      postId: postId,
      userId: req.user.id,
      userName: req.user.username, // Assuming username is available
    });

    console.log(
      `Like by ${req.user.username} event emitted for post ${postId} `
    );

    res.status(201).send("Post liked");
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const commentOnPost = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

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

    // Emit WebSocket event with more details
    req.app.locals.io.emit("commentPost", {
      postId,
      comment,
      user: userDetail,
    });

    console.log(
      `Comment event emitted for post ${postId} by ${userDetail.name}: '${comment}'`
    );

    res.status(201).json(newComment);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
