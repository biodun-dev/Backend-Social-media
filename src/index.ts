import dotenv from 'dotenv';
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

import app from "./app";
import connectDB from "./config/database";
import config from "./config/env";
import { initSocket } from "./utils/socketio";
import logger from "./utils/logger";

connectDB().then(() => {
    const server = app.listen(config.port, () => {
        logger.info(`Server running on http://localhost:${config.port}`);
    });

    initSocket(server);
}).catch((error) => {
    logger.error("Failed to connect to the database:", error);
});
