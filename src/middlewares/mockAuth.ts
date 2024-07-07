
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

const mockAuth = (req: Request, res: Response, next: NextFunction) => {
    console.log("Using mock authentication for testing");
  req.user = {
    _id: new Types.ObjectId(),
    username: 'testUser',
    email: 'test@example.com',
    password: 'password123',
    following: [],
  } as any; // Cast to any to satisfy the User type in your global declaration
  next();
};

export default mockAuth;

