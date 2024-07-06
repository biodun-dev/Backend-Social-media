"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const validateEnv = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('Missing required environment variable: JWT_SECRET');
    }
};
exports.validateEnv = validateEnv;
