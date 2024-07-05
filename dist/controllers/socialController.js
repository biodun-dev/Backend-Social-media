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
exports.commentOnPost = exports.likePost = void 0;
const Like_1 = __importDefault(require("../models/Like"));
const Comment_1 = __importDefault(require("../models/Comment"));
const errorUtils_1 = require("../utils/errorUtils"); // Import the isError function
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
