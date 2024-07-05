"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redis_1 = require("redis");
const env_1 = __importDefault(require("./env"));
const client = (0, redis_1.createClient)({
    url: env_1.default.redis.url,
});
client.on("error", (err) => console.error("Redis Client Error", err));
client.connect();
exports.default = client;
