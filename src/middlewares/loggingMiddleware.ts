import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);
  logger.info(`Request Body: ${JSON.stringify(req.body)}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `Request to ${req.method} ${req.originalUrl} completed in ${duration}ms`
    );
    logger.info(`Response Status: ${res.statusCode}`);
  });

  next();
};
