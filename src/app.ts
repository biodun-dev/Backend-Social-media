// src/app.ts

import express from "express";
import http from "http";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import errorHandler from "./middlewares/errorMiddleware";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import { initSocket } from "./utils/socketio";
import { validateEnv } from "./utils/validateEnv";
import { configureHelmet } from "./config/security";

validateEnv();

const app = express();
const httpServer = http.createServer(app);

const io = initSocket(httpServer);
app.locals.io = io;

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

configureHelmet(app);

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get("/", (_req, res) => {
  res.send("Welcome to the API");
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.use(errorHandler);

export default app;
