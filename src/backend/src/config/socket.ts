import { Server } from 'socket.io'
import { createServer } from 'http'
import User from '../models/User'
import jwt from 'jsonwebtoken'
import config from './index'
import { Socket } from 'socket.io'

interface AuthenticatedSocket extends Socket {
    userId?: string
}

export function configureSocketServer(app) {
    const httpServer = createServer(app)
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // Allow all origins during development
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingInterval: 10000,
        pingTimeout: 5000,
        transports: ['websocket'],
        allowEIO3: true
    })

    // Make authentication optional - authenticate if token exists
    io.use((socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token ||
                         socket.handshake.headers.authorization?.split(' ')[1] ||
                         socket.handshake.query.token as string;

            // If no token provided, still allow connection but without authentication
            if (!token) {
                console.log('Socket connected without authentication');
                return next();
            }

            try {
                const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
                socket.userId = decoded.userId;
                console.log(`Socket authenticated for user: ${decoded.userId}`);
            } catch (tokenErr) {
                console.log('Invalid token, connecting without authentication');
            }
            next();
        } catch (err) {
            console.error('Socket middleware error:', err);
            next();
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Basic event handlers that don't require authentication
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Authenticated events only if userId is present
        if (socket.userId) {
            handleAuthenticatedConnection(socket);
        }
    });

    return { httpServer, io };
}

function handleAuthenticatedConnection(socket: AuthenticatedSocket) {
    socket.on('user_connect', async (userId) => {
        try {
            if (socket.userId !== userId) {
                socket.emit('error', { message: 'User ID mismatch' });
                return;
            }

            const user = await User.findById(userId);
            if (user) {
                user.socketId = socket.id;
                await user.save();
                console.log(`User ${userId} connected with socket ${socket.id}`);

                socket.emit('connection_confirmed', {
                    socketId: socket.id,
                    userId: userId
                });
            }
        } catch (err) {
            console.error('Error in user_connect:', err);
            socket.emit('error', { message: 'Connection error' });
        }
    });
}