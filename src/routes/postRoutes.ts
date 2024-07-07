import express from "express";
import multer from "multer";
import {
  createPost,
  getFeed,
  likePost,
  commentOnPost,
} from "../controllers/postController";
import { authenticate } from "../middlewares/authMiddleware";
import { conditionalMiddleware } from "../utils/conditionalMiddleware"; // Ensure correct import path

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Applying conditional middleware
router.post(
  "/post-feed",
  conditionalMiddleware(authenticate),
  upload.single("mediaFile"),
  createPost
);
router.get("/feed", conditionalMiddleware(authenticate), getFeed);
router.post("/:postId/like", conditionalMiddleware(authenticate), likePost);
router.post(
  "/:postId/comment",
  conditionalMiddleware(authenticate),
  commentOnPost
);

export default router;
