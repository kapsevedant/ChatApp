import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    // cors: {
    //     origin: ['http://localhost:4200'],
    //     methods: ['GET', 'POST']
    // }
    cors: {
        origin: ['https://chat-app-frontend-m1cw.vercel.app'],
        methods: ['GET', 'POST']
    }
});

// Store online users
const onlineUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

io.on('connection', (socket) => {
    // Handle user coming online
    socket.on('userOnline', (data) => {
        const { userId } = data;

        // Store user as online
        onlineUsers.set(userId, socket.id);
        userSockets.set(socket.id, userId);

        // Broadcast to all clients that this user is online
        socket.broadcast.emit('userStatusUpdate', {
            userId: userId,
            isOnline: true
        });

        // Send current online users list to the newly connected user
        socket.emit('onlineUsers', Array.from(onlineUsers.keys()));

        // Broadcast updated online users list to all clients
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    // Handle user going offline manually
    socket.on('userOffline', (data) => {
        const { userId } = data;
        handleUserOffline(userId, socket.id);
    });

    // Handle new message
    socket.on('newMessage', (data) => {
        // broadcast to all other connected clients
        socket.broadcast.emit('newMessage', data);
    });

    // Handle disconnect (when user closes browser/tab)
    socket.on('disconnect', () => {
        const userId = userSockets.get(socket.id);
        if (userId) {
            handleUserOffline(userId, socket.id);
        }
    });
});

// Helper function to handle user going offline
function handleUserOffline(userId, socketId) {
    if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        userSockets.delete(socketId);

        // Broadcast to all clients that this user is offline
        io.emit('userStatusUpdate', {
            userId: userId,
            isOnline: false
        });

        // Broadcast updated online users list
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
}

// Export function to get online users (optional - for API endpoints)
export const getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};

export { app, io, server };