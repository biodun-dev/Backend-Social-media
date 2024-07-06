"use strict";
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
const errorUtils_1 = require("../utils/errorUtils");
const mongoose_1 = __importDefault(require("mongoose"));
const mentionUtils_1 = require("../utils/mentionUtils");
const User_1 = __importDefault(require("../models/User"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.user) {
        logger_1.default.warn("Unauthorized access attempt to create a post");
        return res.status(401).json({ message: "Unauthorized" });
    }
    const username = (_a = req.user) === null || _a === void 0 ? void 0 : _a.username; // Optional chaining for safety
    if (!username) {
        logger_1.default.warn("Unauthorized access attempt to create a post: no username");
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const { content } = req.body;
        let mediaUrl = '';
        if (req.file) {
            mediaUrl = path_1.default.join('uploads', req.file.filename);
        }
        const post = new Post_1.default({ createdBy: req.user._id, content, mediaUrl });
        yield post.save();
        logger_1.default.info(`Post created by ${username}`);
        // Handle mentions
        const mentions = (0, mentionUtils_1.extractMentions)(content);
        logger_1.default.info("Extracted mentions:", mentions);
        const mentionPromises = mentions.map((username) => __awaiter(void 0, void 0, void 0, function* () {
            const mentionedUser = yield User_1.default.findOne({ username });
            if (mentionedUser) {
                logger_1.default.info(`User found: ${mentionedUser.username}, Socket ID: ${mentionedUser.socketId}`);
                if (mentionedUser.socketId) {
                    // Emit event
                    req.app.locals.io.to(mentionedUser.socketId).emit("mentionedInPost", {
                        postId: post._id,
                        postContent: content.slice(0, 100),
                        fromUser: username,
                    });
                    logger_1.default.info(`Notification sent to @${username} for being mentioned in a post.`);
                }
                else {
                    logger_1.default.info(`No active socket ID for @${username}`);
                }
            }
            else {
                logger_1.default.info(`No user found for @${username}`);
            }
        }));
        yield Promise.all(mentionPromises);
        res.status(201).json(post);
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            logger_1.default.error(`Error creating post: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
        else {
            logger_1.default.error("Unknown error occurred while creating post");
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.createPost = createPost;
const getFeed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        logger_1.default.warn("Unauthorized access attempt to get feed");
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const posts = yield Post_1.default.find({
            createdBy: { $in: req.user.following },
        }).sort({ createdAt: -1 });
        if (!posts.length) {
            logger_1.default.info("No posts found from the users followed by the user");
            return res
                .status(404)
                .json({ message: "No posts found from the users you are following." });
        }
        const postsWithDetails = yield Promise.all(posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
            const likes = yield Like_1.default.find({ postId: post._id });
            const comments = yield Comment_1.default.find({ postId: post._id });
            return Object.assign(Object.assign({}, post.toJSON()), { likes: likes.map((like) => ({
                    userId: like.userId,
                    date: like.createdAt,
                })), comments: comments.map((comment) => ({
                    userId: comment.userId,
                    text: comment.comment,
                    date: comment.createdAt,
                })) });
        })));
        logger_1.default.info("Feed retrieved successfully");
        res.json(postsWithDetails);
    }
    catch (error) {
        logger_1.default.error(`Error in fetching feed: ${error}`);
        res.status(500).json({
            message: (0, errorUtils_1.isError)(error) ? error.message : "An unknown error occurred",
        });
    }
});
exports.getFeed = getFeed;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        logger_1.default.warn("Unauthorized access attempt to like a post");
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const { postId } = req.params;
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
            postId: postId,
            userId: req.user.id,
            userName: req.user.username,
        });
        logger_1.default.info(`Like by ${req.user.username} event emitted for post ${postId}`);
        res.status(201).send("Post liked");
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            logger_1.default.error(`Error liking post: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
        else {
            logger_1.default.error("Unknown error occurred while liking post");
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.likePost = likePost;
const commentOnPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        logger_1.default.warn("Unauthorized access attempt to comment on a post");
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const newComment = new Comment_1.default({
            postId,
            userId: req.user.id,
            comment,
        });
        yield newComment.save();
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
        const mentions = (0, mentionUtils_1.extractMentions)(comment);
        mentions.forEach((username) => __awaiter(void 0, void 0, void 0, function* () {
            const mentionedUser = yield User_1.default.findOne({ username: username });
            if (mentionedUser) {
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
        }));
        logger_1.default.info(`Comment event emitted for post ${postId} by ${userDetail.name}: '${comment}'`);
        res.status(201).json(newComment);
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            logger_1.default.error(`Error commenting on post: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
        else {
            logger_1.default.error("Unknown error occurred while commenting on post");
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.commentOnPost = commentOnPost;
