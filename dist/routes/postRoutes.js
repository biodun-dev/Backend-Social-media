"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middlewares/authMiddleware"); // Ensure correct import path
const router = express_1.default.Router();
// All post routes are protected
router.post('/posts', authMiddleware_1.authenticate, postController_1.createPost);
router.get('/feed', authMiddleware_1.authenticate, postController_1.getFeed);
router.post('/posts/:postId/like', authMiddleware_1.authenticate, postController_1.likePost);
router.post('/posts/:postId/comment', authMiddleware_1.authenticate, postController_1.commentOnPost);
exports.default = router;
