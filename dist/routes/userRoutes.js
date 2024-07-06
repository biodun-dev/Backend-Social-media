"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const loggingMiddleware_1 = require("../middlewares/loggingMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = express_1.default.Router();
router.post("/register", loggingMiddleware_1.logRequest, (0, validationMiddleware_1.userValidationRules)(), validationMiddleware_1.validate, userController_1.register);
router.post("/login", loggingMiddleware_1.logRequest, (0, validationMiddleware_1.loginValidationRules)(), validationMiddleware_1.validate, userController_1.login);
router.post("/follow/:followId", loggingMiddleware_1.logRequest, authMiddleware_1.authenticate, userController_1.followUser);
router.get("/me/data", loggingMiddleware_1.logRequest, authMiddleware_1.authenticate, userController_1.getUserData);
exports.default = router;
