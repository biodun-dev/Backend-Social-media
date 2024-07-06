import express from "express";
import http from "http";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import errorHandler from "./middlewares/errorMiddleware";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import { initSocket } from "./utils/socketio"; // Ensure this path is correct

const app = express();

// Create an HTTP server from the Express app
const httpServer = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = initSocket(httpServer);

// Attach the io instance to app.locals for global access
app.locals.io = io;

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Adding routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.use(errorHandler);

export default app; // You usually won't need to export app when listening like this
