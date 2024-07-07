
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

const mockAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log("Using mock authentication for testing");
  req.user = {
    id: new Types.ObjectId().toString(),
    username: "testUser",
    email: "test@example.com",
    following: [],
  } as any;
  next();
};

export default mockAuth;
