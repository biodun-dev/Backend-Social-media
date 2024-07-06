"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentOnPost = exports.likePost = exports.getFeed = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const Like_1 = __importDefault(require("../models/Like"));
const Comment_1 = __importDefault(require("../models/Comment"));
const mongoose_1 = __importDefault(require("mongoose"));
const mentionUtils_1 = require("../utils/mentionUtils");
const User_1 = __importDefault(require("../models/User"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
const cache_1 = __importStar(require("../utils/cache"));
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        logger_1.default.warn("Unauthorized access attempt to create a post");
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { username, _id: userId } = req.user;
    try {
        const { content } = req.body;
        const mediaUrl = req.file ? path_1.default.join("uploads", req.file.filename) : "";
        const post = new Post_1.default({ createdBy: userId, content, mediaUrl });
        yield post.save();
        logger_1.default.info(`Post created by ${username}`);
        const mentions = (0, mentionUtils_1.extractMentions)(content);
        logger_1.default.info(`Extracted mentions: ${mentions.join(", ")}`);
        const mentionPromises = mentions.map((mentionUsername) => __awaiter(void 0, void 0, void 0, function* () {
            const mentionedUser = (yield User_1.default.findOne({
                username: mentionUsername,
            }));
            if (mentionedUser) {
                if (mentionedUser.socketId) {
                    req.app.locals.io.to(mentionedUser.socketId).emit("mentionedInPost", {
                        postId: post._id,
                        postContent: content.slice(0, 100),
                        fromUser: username,
                    });
                    logger_1.default.info(`Notification sent to @${mentionUsername} (Socket ID: ${mentionedUser.socketId}) for being mentioned in a post.`);
                }
                else {
                    logger_1.default.info(`Mentioned user @${mentionUsername} has no active socket ID.`);
                }
            }
            else {
                logger_1.default.info(`No user found for @${mentionUsername}`);
            }
        }));
        yield Promise.all(mentionPromises);
        (0, cache_1.invalidateCacheKeys)(`feed_${userId}_page_`);
        res.status(201).json(post);
    }
    catch (error) {
        logger_1.default.error("Error creating post:", {
            error,
            userId,
            content: req.body.content,
        });
        next(error);
    }
});
exports.createPost = createPost;
const getFeed = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        logger_1.default.warn("Unauthorized access attempt to get feed");
        return res.status(401).json({ message: "Unauthorized" });
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const cacheKey = `feed_${req.user.id}_page_${page}`;
    // Try to get data from cache
    const cachedData = cache_1.default.get(cacheKey);
    if (cachedData) {
        logger_1.default.info("Feed retrieved from cache");
        return res.json(cachedData);
    }
    try {
        const posts = yield Post_1.default.find({
            createdBy: { $in: req.user.following },
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (!posts.length) {
            logger_1.default.info("No posts found from the users followed by the user");
            return res.status(404).json({
                message: "No posts found from the users you are following.",
            });
        }
        const totalPosts = yield Post_1.default.countDocuments({
            createdBy: { $in: req.user.following },
        });
        const totalPages = Math.ceil(totalPosts / limit);
        const postsWithDetails = yield Promise.all(posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
            const likes = yield Like_1.default.find({ postId: post._id });
            const comments = yield Comment_1.default.find({ postId: post._id });
            return Object.assign(Object.assign({}, post.toJSON()), { likeCount: likes.length, commentCount: comments.length, likes: likes.map((like) => ({
                    userId: like.userId,
                    date: like.createdAt,
                })), comments: comments.map((comment) => ({
                    userId: comment.userId,
                    text: comment.comment,
                    date: comment.createdAt,
                })) });
        })));
        const responseData = {
            page,
            totalPages,
            totalPosts,
            posts: postsWithDetails,
        };
        // Save data to cache
        cache_1.default.set(cacheKey, responseData);
        logger_1.default.info("Feed retrieved and cached successfully");
        res.json(responseData);
    }
    catch (error) {
        logger_1.default.error("Error retrieving feed:", { error, userId: req.user.id });
        next(error);
    }
});
exports.getFeed = getFeed;
const likePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        logger_1.default.warn("Unauthorized access attempt to like a post");
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { postId } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            logger_1.default.warn(`Invalid postId format: ${postId}`);
            return res.status(400).json({ message: "Invalid postId format" });
        }
        const postExists = yield Post_1.default.findById(postId);
        if (!postExists) {
            logger_1.default.warn(`Post not found: ${postId}`);
            return res.status(404).json({ message: "Post not found" });
        }
        const existingLike = yield Like_1.default.findOne({ postId, userId: req.user.id });
        if (existingLike) {
            logger_1.default.info(`User ${req.user.username} already liked post ${postId}`);
            return res.status(400).send("You already liked this post");
        }
        const like = new Like_1.default({ postId, userId: req.user.id });
        yield like.save();
        req.app.locals.io.emit("likePost", {
            postId,
            userId: req.user.id,
            userName: req.user.username,
        });
        logger_1.default.info(`Like by ${req.user.username} event emitted for post ${postId}`);
        res.status(201).send("Post liked");
    }
    catch (error) {
        logger_1.default.error("Error liking post:", { error, userId: req.user.id, postId });
        next(error);
    }
});
exports.likePost = likePost;
const commentOnPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        logger_1.default.warn("Unauthorized access attempt to comment on a post");
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { postId } = req.params;
    const { comment } = req.body;
    try {
        const newComment = new Comment_1.default({ postId, userId: req.user.id, comment });
        yield newComment.save();
        const userDetail = { id: req.user.id, name: req.user.username };
        req.app.locals.io.emit("commentPost", {
            postId,
            comment,
            user: userDetail,
        });
        const mentions = (0, mentionUtils_1.extractMentions)(comment);
        logger_1.default.info(`Extracted mentions: ${mentions.join(", ")}`);
        const mentionPromises = mentions.map((username) => __awaiter(void 0, void 0, void 0, function* () {
            const mentionedUser = (yield User_1.default.findOne({ username }));
            if (mentionedUser === null || mentionedUser === void 0 ? void 0 : mentionedUser.socketId) {
                req.app.locals.io
                    .to(mentionedUser.socketId)
                    .emit("mentionedInComment", {
                    postId,
                    commentId: newComment._id,
                    fromUser: userDetail,
                    commentText: comment,
                });
                logger_1.default.info(`Notification sent to @${username} for being mentioned.`);
            }
            else {
                logger_1.default.info(`No active socket ID for @${username}`);
            }
        }));
        yield Promise.all(mentionPromises);
        logger_1.default.info(`Comment event emitted for post ${postId} by ${userDetail.name}: '${comment}'`);
        res.status(201).json(newComment);
    }
    catch (error) {
        logger_1.default.error("Error commenting on post:", {
            error,
            userId: req.user.id,
            postId,
            comment,
        });
        next(error);
    }
});
exports.commentOnPost = commentOnPost;
