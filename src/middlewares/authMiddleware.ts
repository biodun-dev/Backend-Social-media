import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import logger from '../utils/logger'; // Make sure to import your logger

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      logger.warn('No token provided or token does not start with Bearer');
      return res.status(403).send('A token is required for authentication');
    }

    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      logger.warn('Token does not correspond to a valid user');
      return res.status(401).send('Invalid Token');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Error verifying token:', error);
    return res.status(401).send('Invalid Token');
  }
};
