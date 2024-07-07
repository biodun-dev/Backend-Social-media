// src/middlewares/mockAuth.ts
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

const mockAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log("Using mock authentication for testing");
  req.user = {
    id: new Types.ObjectId().toString(), // Ensure this matches your User model's ID type
    username: 'testUser',
    email: 'test@example.com',
    following: [],
  } as any; // Cast to any to satisfy the User type in your global declaration
  next();
};

export default mockAuth;
