"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequest = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const logRequest = (req, res, next) => {
    logger_1.default.info(`Incoming Request: ${req.method} ${req.url}`);
    logger_1.default.info('Request Body:', req.body);
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.default.info(`Request to ${req.method} ${req.url} completed in ${duration}ms`);
        logger_1.default.info('Response Status:', res.statusCode);
    });
    next();
};
exports.logRequest = logRequest;
