"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCacheKeys = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const logger_1 = __importDefault(require("./logger")); // Adjust the path to your logger
const stdTTL = 30;
const cache = new node_cache_1.default({ stdTTL });
const invalidateCacheKeys = (pattern) => {
    const keys = cache.keys();
    const relevantKeys = keys.filter((key) => key.startsWith(pattern));
    relevantKeys.forEach((key) => cache.del(key));
    logger_1.default.info(`Cache invalidated for pattern: ${pattern}`);
};
exports.invalidateCacheKeys = invalidateCacheKeys;
exports.default = cache;
