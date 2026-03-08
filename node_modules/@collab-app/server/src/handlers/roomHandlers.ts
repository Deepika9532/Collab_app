import { Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Room,
  CreateRoomInput,
  RoomUpdate,
} from '@collab-app/shared-types';
import { RoomManager } from '../rooms/RoomManager';

export const setupRoomHandlers = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
) => {
  // Create a new room
  socket.on('room:create', (data: CreateRoomInput, callback: (room: Room | null) => void) => {
    try {
      const room = roomManager.createRoom(socket.id, data);
      
      // Notify all clients about the new room
      socket.broadcast.emit('room:created' as any, room);
      
      callback(room);
    } catch (error) {
      console.error('Error creating room:', error);
      callback(null);
    }
  });

  // Join an existing room
  socket.on('room:join', (roomId: string, callback: (room: Room | null) => void) => {
    try {
      const room = roomManager.getRoom(roomId);
      
      if (!room) {
        callback(null);
        return;
      }

      // Extract user info from socket handshake or store it temporarily
      // For now, we'll use socket.id and let presence updates fill in the details
      const user = {
        id: socket.id,
        name: `User ${socket.id.substr(0, 4)}`,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };

      // Add user to the room
      roomManager.addParticipant(roomId, socket.id, user);

      // Join the Socket.IO room
      socket.join(roomId);

      // Notify others in the room
      socket.to(roomId).emit('user:joined' as any, user);

      callback(room);
    } catch (error) {
      console.error('Error joining room:', error);
      callback(null);
    }
  });

  // Leave a room
  socket.on('room:leave', (roomId: string, callback: () => void) => {
    try {
      // Leave the Socket.IO room
      socket.leave(roomId);

      // Remove from room manager
      roomManager.removeParticipant(roomId, socket.id);

      // Notify others in the room
      socket.to(roomId).emit('user:left' as any, socket.id);

      callback();
    } catch (error) {
      console.error('Error leaving room:', error);
      callback();
    }
  });

  // Update room details
  socket.on('room:update', (roomId: string, updates: Partial<RoomUpdate>, callback: (room: Room | null) => void) => {
    try {
      const room = roomManager.getRoom(roomId);
      
      if (!room) {
        callback(null);
        return;
      }

      // Update room properties
      const updatedRoom: Room = {
        ...room,
        ...updates,
        updatedAt: Date.now(),
      };

      // Update in room manager (would need an update method)
      // For now, we'll just emit the update
      socket.to(roomId).emit('room:updated' as any, updatedRoom);

      callback(updatedRoom);
    } catch (error) {
      console.error('Error updating room:', error);
      callback(null);
    }
  });
};