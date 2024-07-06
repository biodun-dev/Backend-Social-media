"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middlewares/authMiddleware"); // Ensure correct import path
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" }); // Configure the upload destination
// All post routes are protected
router.post("/post-feed", authMiddleware_1.authenticate, upload.single("mediaFile"), postController_1.createPost);
router.get("/feed", authMiddleware_1.authenticate, postController_1.getFeed);
router.post("/:postId/like", authMiddleware_1.authenticate, postController_1.likePost);
router.post("/:postId/comment", authMiddleware_1.authenticate, postController_1.commentOnPost);
exports.default = router;
