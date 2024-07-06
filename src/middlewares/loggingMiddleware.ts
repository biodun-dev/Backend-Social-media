import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  logger.info('Request Body:', req.body);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Request to ${req.method} ${req.url} completed in ${duration}ms`);
    logger.info('Response Status:', res.statusCode);
  });

  next();
};
