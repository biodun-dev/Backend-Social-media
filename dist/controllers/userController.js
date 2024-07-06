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
exports.getUserData = exports.followUser = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Post_1 = __importDefault(require("../models/Post"));
const Like_1 = __importDefault(require("../models/Like"));
const Comment_1 = __importDefault(require("../models/Comment"));
const errorUtils_1 = require("../utils/errorUtils");
const logger_1 = __importDefault(require("../utils/logger"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const user = new User_1.default({ username, email, password });
        yield user.save();
        logger_1.default.info(`User registered successfully: ${username}`);
        res.status(201).send("User registered successfully");
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            logger_1.default.error(`Error registering user: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
        else {
            logger_1.default.error('Unknown error registering user');
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user || !(yield user.comparePassword(password))) {
            logger_1.default.warn('Authentication failed for email: ' + email);
            return res.status(401).send("Authentication failed");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        logger_1.default.info(`User logged in successfully: ${email}`);
        res.json({ token });
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            logger_1.default.error(`Error logging in user: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
        else {
            logger_1.default.error('Unknown error logging in user');
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.login = login;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const { followId } = req.params; // ID of the user to follow
        const user = yield User_1.default.findById(req.user.id);
        if (!user) {
            logger_1.default.warn(`User not found: ${req.user.id}`);
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.following.includes(followId)) {
            user.following.push(followId);
            yield user.save();
            logger_1.default.info(`User followed successfully: ${followId}`);
            res.status(200).send("User followed");
        }
        else {
            logger_1.default.info(`Already following user: ${followId}`);
            res.status(400).send("Already following this user");
        }
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            logger_1.default.error(`Error following user: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
        else {
            logger_1.default.error('Unknown error following user');
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.followUser = followUser;
const getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const userId = req.user.id;
        // Fetch posts created by the user
        const posts = yield Post_1.default.find({ createdBy: userId });
        // For each post, fetch likes and comments
        const postDetails = yield Promise.all(posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
            const likes = yield Like_1.default.find({ postId: post._id }).populate('userId', 'username');
            const comments = yield Comment_1.default.find({ postId: post._id }).populate('userId', 'username');
            return Object.assign(Object.assign({}, post.toJSON()), { likes, comments });
        })));
        // Fetch followers of the user
        const followers = yield User_1.default.find({ following: { $in: [userId] } }, 'username');
        const userData = {
            posts: postDetails,
            followers
        };
        logger_1.default.info(`User data retrieved successfully for user: ${userId}`);
        res.json(userData);
    }
    catch (error) {
        if ((0, errorUtils_1.isError)(error)) {
            logger_1.default.error(`Error retrieving user data: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
        else {
            logger_1.default.error('Unknown error retrieving user data');
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.getUserData = getUserData;
