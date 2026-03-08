import { create } from 'zustand';
import { Room } from '@collab-app/shared-types';

interface RoomState {
  currentRoom: Room | null;
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentRoom: (room: Room | null) => void;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  removeRoom: (roomId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  // Initial state
  currentRoom: null,
  rooms: [],
  isLoading: false,
  error: null,

  // Actions
  setCurrentRoom: (room) => set({ currentRoom: room, error: null }),
  
  setRooms: (rooms) => set({ rooms, error: null }),
  
  addRoom: (room) => set((state) => ({
    rooms: [...state.rooms, room],
    error: null,
  })),
  
  updateRoom: (roomId, updates) => set((state) => ({
    rooms: state.rooms.map((room) =>
      room.id === roomId ? { ...room, ...updates } : room
    ),
    currentRoom: state.currentRoom?.id === roomId
      ? { ...state.currentRoom, ...updates }
      : state.currentRoom,
    error: null,
  })),
  
  removeRoom: (roomId) => set((state) => ({
    rooms: state.rooms.filter((room) => room.id !== roomId),
    currentRoom: state.currentRoom?.id === roomId ? null : state.currentRoom,
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error, isLoading: false }),
}));