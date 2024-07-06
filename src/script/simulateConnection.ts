import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const userId = '668939aec0753415ee9f6ed6'; 
const SECRET_KEY = process.env.JWT_SECRET!; 
const token = jwt.sign({ id: userId }, SECRET_KEY);


const socket = io('http://localhost:5000', {
  query: { token }
});

socket.on('connect', () => {
  console.log('Connected to server with socket ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('notification', (data) => {
  console.log('Notification received:', data);
});



// TO START:  npx ts-node src/script/simulateConnection.ts