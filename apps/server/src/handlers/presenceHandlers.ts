import { Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  PresenceState,
} from '@collab-app/shared-types';
import { RoomManager } from '../rooms/RoomManager';

export const setupPresenceHandlers = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
) => {
  // Update presence state
  socket.on('presence:update' as any, (presence: PresenceState, callback: () => void) => {
    try {
      const success = roomManager.updatePresence(presence.roomId, presence);
      
      if (success) {
        // Broadcast to others in the room
        socket.to(presence.roomId).emit('presence:updated' as any, presence);
      }
      callback();
    } catch (error) {
      console.error('Error updating presence:', error);
      callback();
    }
  });
};