"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config(); // Load environment variables from .env file
const envVarsSchema = joi_1.default.object({
    NODE_ENV: joi_1.default.string().valid('development', 'production', 'test').required(),
    PORT: joi_1.default.number().default(3000),
    MONGODB_URI: joi_1.default.string().required().description('MongoDB URI'),
    JWT_SECRET: joi_1.default.string().required().description('JWT secret key'),
    REDIS_URL: joi_1.default.string().required().description('Redis connection URL'), // Using a URL for Redis
}).unknown();
const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
exports.default = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongoose: {
        uri: envVars.MONGODB_URI,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        },
    },
    jwtSecret: envVars.JWT_SECRET,
    redis: {
        url: envVars.REDIS_URL,
    },
};
