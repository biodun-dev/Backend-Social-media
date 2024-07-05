"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware"); // Ensure correct import path
const router = express_1.default.Router();
// Public routes
router.post('/register', userController_1.register);
router.post('/login', userController_1.login);
// Protected route
router.patch('/follow/:followId', authMiddleware_1.authenticate, userController_1.followUser);
exports.default = router;
