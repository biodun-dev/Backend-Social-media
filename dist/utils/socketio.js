"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const events_1 = require("./events");
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
    // options
    });
    io.on('connection', (socket) => {
        console.log('A user connected: ' + socket.id);
        socket.on('likePost', (data) => {
            socket.broadcast.emit('notification', (0, events_1.notificationEvent)('like', data));
        });
        socket.on('commentPost', (data) => {
            socket.broadcast.emit('notification', (0, events_1.notificationEvent)('comment', data));
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io;
};
exports.initSocket = initSocket;
