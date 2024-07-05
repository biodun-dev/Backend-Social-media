import dotenv from 'dotenv';
dotenv.config();  
import app from './app';
import connectDB from './config/database';
import config from './config/env';

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
});