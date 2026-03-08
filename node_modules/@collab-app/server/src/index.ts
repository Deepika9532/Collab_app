import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@collab-app/shared-types';
import { RoomManager } from './rooms/RoomManager';
import { setupRoomHandlers } from './handlers/roomHandlers';
import { setupPresenceHandlers } from './handlers/presenceHandlers';
import { setupYjsHandlers } from './handlers/yjsHandlers';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO with typed events
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Initialize room manager
const roomManager = new RoomManager();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Setup socket handlers
io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  console.log(`Client connected: ${socket.id}`);

  // Pass handlers
  setupRoomHandlers(socket, roomManager);
  setupPresenceHandlers(socket, roomManager);
  setupYjsHandlers(socket, roomManager);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const notifications = roomManager.handleDisconnect(socket.id);
    
    // Emit user:left events to appropriate rooms
    notifications.forEach(({ roomId, userId }) => {
      if (roomId) {
        socket.to(roomId).emit('user:left' as any, userId);
      }
    });
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export { app, io };