import dotenv from 'dotenv';

dotenv.config();

export const validateEnv = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

};
