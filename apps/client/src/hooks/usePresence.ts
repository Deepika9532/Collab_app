import { useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import * as Y from 'yjs';
import {
  PresenceState,
  ServerToClientEvents,
  ClientToServerEvents,
} from '@collab-app/shared-types';
import { useUserStore } from '../stores/userStore';

interface UsePresenceOptions {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  roomId: string;
  userId: string;
  enabled?: boolean;
}

export const usePresence = ({
  socket,
  roomId,
  userId,
  enabled = true,
}: UsePresenceOptions) => {
  const updatePresence = useUserStore((state) => state.updatePresence);
  const presenceRef = useRef<PresenceState | null>(null);

  // Send presence update to server
  const sendPresenceUpdate = useCallback(
    (presence: Partial<PresenceState>) => {
      if (!enabled || !socket.connected) return;

      const updatedPresence: PresenceState = {
        ...presenceRef.current,
        ...presence,
        userId,
        roomId,
        timestamp: Date.now(),
      };

      presenceRef.current = updatedPresence;

      socket.emit('presence:update', updatedPresence, () => {
        updatePresence(updatedPresence);
      });
    },
    [socket, roomId, userId, enabled, updatePresence]
  );

  // Update cursor position
  const updateCursorPosition = useCallback(
    (position: { line: number; ch: number }) => {
      sendPresenceUpdate({ cursorPosition: position });
    },
    [sendPresenceUpdate]
  );

  // Update selection
  const updateSelection = useCallback(
    (selection: {
      anchor: { line: number; ch: number };
      head: { line: number; ch: number };
    }) => {
      sendPresenceUpdate({ selection });
    },
    [sendPresenceUpdate]
  );

  // Handle incoming presence updates
  useEffect(() => {
    if (!enabled) return;

    const handlePresenceUpdate = (presence: PresenceState) => {
      updatePresence(presence);
    };

    socket.on('presence:updated', handlePresenceUpdate);

    return () => {
      socket.off('presence:updated');
    };
  }, [socket, enabled, updatePresence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enabled && socket.connected) {
        socket.emit('room:leave', roomId, () => {});
      }
    };
  }, [socket, roomId, enabled]);

  return {
    sendPresenceUpdate,
    updateCursorPosition,
    updateSelection,
  };
};