"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCache = exports.getCache = void 0;
const redis_1 = __importDefault(require("../config/redis")); // Adjust the path as necessary
const getCache = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield redis_1.default.get(key); // directly using await on client.get
    }
    catch (err) {
        console.error('Redis getCache error:', err);
        return null; // Handle the error appropriately
    }
});
exports.getCache = getCache;
const setCache = (key, value) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Setting with expiration (EX) set to 3600 seconds (1 hour)
        return yield redis_1.default.set(key, value, {
            EX: 3600
        });
    }
    catch (err) {
        console.error('Redis setCache error:', err);
        return null; // Handle the error appropriately
    }
});
exports.setCache = setCache;
