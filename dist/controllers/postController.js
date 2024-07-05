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
const redisClient_1 = require("../utils/redisClient");
const errorUtils_1 = require("../utils/errorUtils"); // Import the isError function
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const { content, mediaUrl } = req.body;
        const post = new Post_1.default({ createdBy: req.user.id, content, mediaUrl });
        yield post.save();
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
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const cacheKey = `feed:${req.user.id}`;
        const cachedData = yield (0, redisClient_1.getCache)(cacheKey);
        if (cachedData)
            return res.json(JSON.parse(cachedData));
        const posts = yield Post_1.default.find({ createdBy: { $in: req.user.following } }).sort({ createdAt: -1 });
        yield (0, redisClient_1.setCache)(cacheKey, JSON.stringify(posts));
        res.json(posts);
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
exports.getFeed = getFeed;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const { postId } = req.params;
        const existingLike = yield Like_1.default.findOne({ postId, userId: req.user.id });
        if (existingLike) {
            return res.status(400).send('You already liked this post');
        }
        const like = new Like_1.default({ postId, userId: req.user.id });
        yield like.save();
        res.status(201).send('Post liked');
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
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const newComment = new Comment_1.default({ postId, userId: req.user.id, comment });
        yield newComment.save();
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
