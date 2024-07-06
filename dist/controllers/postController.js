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
// import { getCache, setCache } from "../utils/redisClient";
const errorUtils_1 = require("../utils/errorUtils");
const mongoose_1 = __importDefault(require("mongoose"));
const mentionUtils_1 = require("../utils/mentionUtils");
const User_1 = __importDefault(require("../models/User"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    const username = (_a = req.user) === null || _a === void 0 ? void 0 : _a.username; // Optional chaining for safety
    if (!username)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const { content, mediaUrl } = req.body;
        const post = new Post_1.default({ createdBy: req.user._id, content, mediaUrl });
        yield post.save();
        // Handle mentions
        const mentions = (0, mentionUtils_1.extractMentions)(content);
        const mentionPromises = mentions.map((username) => __awaiter(void 0, void 0, void 0, function* () {
            const mentionedUser = yield User_1.default.findOne({ username });
            if (mentionedUser && mentionedUser.socketId) {
                console.log(`Attempting to notify @${username} with socket ID ${mentionedUser.socketId}`);
                req.app.locals.io.to(mentionedUser.socketId).emit("mentionedInPost", {
                    postId: post._id,
                    postContent: content.slice(0, 100),
                    fromUser: username,
                });
                console.log(`Notification sent to @${username} for being mentioned in a post.`);
            }
        }));
        yield Promise.all(mentionPromises);
        res.status(201).json(post);
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.createPost = createPost;
const getFeed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const posts = yield Post_1.default.find({
            createdBy: { $in: req.user.following },
        }).sort({ createdAt: -1 });
        if (!posts.length) {
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
        res.json(postsWithDetails);
    }
    catch (error) {
        console.error("Error in fetching feed:", error);
        res.status(500).json({
            message: (0, errorUtils_1.isError)(error) ? error.message : "An unknown error occurred",
        });
    }
});
exports.getFeed = getFeed;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const { postId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid postId format" });
        }
        const postExists = yield Post_1.default.findById(postId);
        if (!postExists) {
            return res.status(404).json({ message: "Post not found" });
        }
        const existingLike = yield Like_1.default.findOne({ postId, userId: req.user.id });
        if (existingLike) {
            return res.status(400).send("You already liked this post");
        }
        const like = new Like_1.default({ postId, userId: req.user.id });
        yield like.save();
        req.app.locals.io.emit("likePost", {
            postId: postId,
            userId: req.user.id,
            userName: req.user.username,
        });
        console.log(`Like by ${req.user.username} event emitted for post ${postId} `);
        res.status(201).send("Post liked");
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.likePost = likePost;
const commentOnPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
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
                console.log(`Notification sent to @${username} for being mentioned.`);
            }
        }));
        console.log(`Comment event emitted for post ${postId} by ${userDetail.name}: '${comment}'`);
        res.status(201).json(newComment);
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.commentOnPost = commentOnPost;
