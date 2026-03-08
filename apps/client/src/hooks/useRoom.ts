import { useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import {
  Room,
  CreateRoomInput,
  ServerToClientEvents,
  ClientToServerEvents,
} from '@collab-app/shared-types';
import { useRoomStore } from '../stores/roomStore';

interface UseRoomOptions {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export const useRoom = ({ socket }: UseRoomOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setCurrentRoom = useRoomStore((state) => state.setCurrentRoom);
  const addRoom = useRoomStore((state) => state.addRoom);
  const updateRoom = useRoomStore((state) => state.updateRoom);
  const removeRoom = useRoomStore((state) => state.removeRoom);

  // Create a new room
  const createRoom = useCallback(
    async (data: CreateRoomInput): Promise<Room | null> => {
      return new Promise((resolve) => {
        setIsLoading(true);
        setError(null);

        socket.emit('room:create', data, (room: Room | null) => {
          setIsLoading(false);
          if (room) {
            addRoom(room);
            resolve(room);
          } else {
            resolve(null);
          }
        });
      });
    },
    [socket, addRoom]
  );

  // Join an existing room
  const joinRoom = useCallback(
    async (roomId: string): Promise<Room | null> => {
      return new Promise((resolve) => {
        setIsLoading(true);
        setError(null);

        socket.emit('room:join', roomId, (room: Room | null) => {
          setIsLoading(false);
          if (room) {
            setCurrentRoom(room);
            resolve(room);
          } else {
            resolve(null);
          }
        });
      });
    },
    [socket, setCurrentRoom]
  );

  // Leave current room
  const leaveRoom = useCallback(
    async (roomId: string): Promise<void> => {
      return new Promise((resolve) => {
        socket.emit('room:leave', roomId, () => {
          removeRoom(roomId);
          setCurrentRoom(null);
          resolve();
        });
      });
    },
    [socket, removeRoom, setCurrentRoom]
  );

  // Update room details
  const updateRoomDetails = useCallback(
    async (
      roomId: string,
      updates: { name?: string; description?: string }
    ): Promise<Room | null> => {
      return new Promise((resolve) => {
        setIsLoading(true);
        setError(null);

        socket.emit('room:update', roomId, { ...updates, updatedAt: Date.now() }, (room: Room | null) => {
          setIsLoading(false);
          if (room) {
            updateRoom(roomId, room);
            resolve(room);
          } else {
            resolve(null);
          }
        });
      });
    },
    [socket, updateRoom]
  );

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoomDetails,
    isLoading,
    error,
  };
};