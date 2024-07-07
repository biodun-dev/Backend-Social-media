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
import { conditionalMiddleware } from "../utils/conditionalMiddleware";
const router = express.Router();

router.post("/register", logRequest, userValidationRules(), validate, register);
router.post("/login", logRequest, loginValidationRules(), validate, login);
router.post(
  "/follow/:followId",
  conditionalMiddleware(authenticate),
  followUser
);
router.get("/me/data", conditionalMiddleware(authenticate), getUserData);

export default router;
