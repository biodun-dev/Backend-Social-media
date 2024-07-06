"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const env_1 = __importDefault(require("./config/env"));
const socketio_1 = require("./utils/socketio");
const logger_1 = __importDefault(require("./utils/logger"));
(0, database_1.default)()
    .then(() => {
    const server = app_1.default.listen(env_1.default.port, () => {
        logger_1.default.info(`Server running on http://localhost:${env_1.default.port}`);
    });
    (0, socketio_1.initSocket)(server);
})
    .catch((error) => {
    logger_1.default.error("Failed to connect to the database:", error);
});
