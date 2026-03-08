import { Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  YjsUpdate,
} from '@collab-app/shared-types';
import { RoomManager } from '../rooms/RoomManager';

export const setupYjsHandlers = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
) => {
  // Handle Yjs document updates
  socket.on('yjs:update' as any, (update: YjsUpdate) => {
    try {
      // Store the update
      roomManager.storeYjsUpdate(update.roomId, update.update);

      // Broadcast to other clients in the room
      socket.to(update.roomId).emit('yjs:update' as any, update);
    } catch (error) {
      console.error('Error handling Yjs update:', error);
    }
  });

  // Sync Yjs document state
  socket.on('yjs:sync' as any, (roomId: string, callback: (updates: Uint8Array[]) => void) => {
    try {
      const updates = roomManager.getYjsUpdates(roomId);
      callback(updates);
    } catch (error) {
      console.error('Error syncing Yjs document:', error);
      callback([]);
    }
  });
};