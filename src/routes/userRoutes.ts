import express from "express";
import {
  register,
  login,
  followUser,
  getUserData,
} from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";
import { logRequest } from "../middlewares/loggingMiddleware";
import {
  userValidationRules,
  loginValidationRules,
  validate,
} from "../middlewares/validationMiddleware";
const router = express.Router();

router.post("/register", logRequest, userValidationRules(), validate, register);
router.post("/login", logRequest, loginValidationRules(), validate, login);
router.post("/follow/:followId", logRequest, authenticate, followUser);
router.get("/me/data", logRequest, authenticate, getUserData);

export default router;
