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

const httpServer = http.createServer(app);


const io = initSocket(httpServer);


app.locals.io = io;

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});
app.use(limiter);


app.get("/", (req, res) => {
  res.send("Welcome to the API");
});


app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.use(errorHandler);

export default app; 