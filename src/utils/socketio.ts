import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { notificationEvent } from './events';

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    // options
  });

  io.on('connection', (socket: Socket) => {
    console.log('A user connected: ' + socket.id);

    socket.on('likePost', (data) => {
      socket.broadcast.emit('notification', notificationEvent('like', data));
    });

    socket.on('commentPost', (data) => {
      socket.broadcast.emit('notification', notificationEvent('comment', data));
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};
