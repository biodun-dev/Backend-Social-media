"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userId = '668939aec0753415ee9f6ed6';
const SECRET_KEY = process.env.JWT_SECRET;
const token = jsonwebtoken_1.default.sign({ id: userId }, SECRET_KEY);
const socket = (0, socket_io_client_1.io)('http://localhost:5000', {
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
