import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import errorHandler from "./middlewares/errorMiddleware";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";

const app = express();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
});
app.use(limiter);

// Adding routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(errorHandler);

export default app;
