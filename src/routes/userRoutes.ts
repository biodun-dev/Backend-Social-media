import express from "express";
import {
  register,
  login,
  followUser,
  getUserData,
} from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";
import { logRequest } from "../middlewares/loggingMiddleware";

const router = express.Router();

router.post("/register", logRequest, register);
router.post("/login", logRequest, login);
router.post("/follow/:followId", logRequest, authenticate, followUser);
router.get("me/data", logRequest, authenticate, getUserData);

export default router;
