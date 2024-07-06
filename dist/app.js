"use strict";
// src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const socketio_1 = require("./utils/socketio");
const validateEnv_1 = require("./utils/validateEnv");
const security_1 = require("./config/security");
(0, validateEnv_1.validateEnv)();
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const io = (0, socketio_1.initSocket)(httpServer);
app.locals.io = io;
app.use(express_1.default.json());
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
(0, security_1.configureHelmet)(app);
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);
app.get("/", (_req, res) => {
    res.send("Welcome to the API");
});
app.use("/api/users", userRoutes_1.default);
app.use("/api/posts", postRoutes_1.default);
app.use(errorMiddleware_1.default);
exports.default = app;
