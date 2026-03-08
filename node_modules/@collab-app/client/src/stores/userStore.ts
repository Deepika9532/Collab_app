import { create } from 'zustand';
import { User, PresenceState } from '@collab-app/shared-types';

interface UserState {
  currentUser: User | null;
  roomParticipants: Map<string, User>;
  presenceStates: Map<string, PresenceState>;
  
  // Actions
  setCurrentUser: (user: User) => void;
  setRoomParticipants: (participants: User[]) => void;
  addParticipant: (participant: User) => void;
  removeParticipant: (userId: string) => void;
  updatePresence: (presence: PresenceState) => void;
  clearPresence: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  currentUser: null,
  roomParticipants: new Map(),
  presenceStates: new Map(),

  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setRoomParticipants: (participants) => set({
    roomParticipants: new Map(participants.map((p) => [p.id, p])),
  }),
  
  addParticipant: (participant) => set((state) => {
    const newMap = new Map(state.roomParticipants);
    newMap.set(participant.id, participant);
    return { roomParticipants: newMap };
  }),
  
  removeParticipant: (userId) => set((state) => {
    const newMap = new Map(state.roomParticipants);
    newMap.delete(userId);
    return { roomParticipants: newMap };
  }),
  
  updatePresence: (presence) => set((state) => {
    const newPresenceMap = new Map(state.presenceStates);
    newPresenceMap.set(presence.userId, presence);
    return { presenceStates: newPresenceMap };
  }),
  
  clearPresence: () => set({ presenceStates: new Map() }),
  
  // Selectors
  getParticipant: (userId: string) => {
    return get().roomParticipants.get(userId);
  },
  
  getPresence: (userId: string) => {
    return get().presenceStates.get(userId);
  },
}));