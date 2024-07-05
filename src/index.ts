import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import connectDB from './config/database';
import config from './config/env';
import { initSocket } from './utils/socketio'; // Assuming you have socket setup

connectDB().then(() => {
  const server = app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });

  initSocket(server); 
});
