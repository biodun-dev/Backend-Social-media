import { Document, Types } from 'mongoose';

declare global {
  namespace Express {
    interface User extends Document {
      username: string;
      email: string;
      password: string;
      following: Types.ObjectId[];
    }

    interface Request {
      user?: User;
    }
  }
}

export interface JwtPayload {
  id: string;
}
