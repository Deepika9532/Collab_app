// User and Presence Types
export interface User {
  id: string;
  name: string;
  color: string;
}

export interface PresenceState {
  userId: string;
  roomId: string;
  cursorPosition?: {
    line: number;
    ch: number;
  };
  selection?: {
    anchor: { line: number; ch: number };
    head: { line: number; ch: number };
  };
  timestamp: number;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  color: string;
  position: {
    line: number;
    ch: number;
  };
}

// Room Types
export interface Room {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  participants: string[]; // user IDs
}

export interface CreateRoomInput {
  name: string;
  description?: string;
}

export interface RoomUpdate {
  name?: string;
  description?: string;
  updatedAt: number;
}

// Yjs Types
export interface YjsUpdate {
  roomId: string;
  update: Uint8Array;
  clientId: string;
}

export interface DocumentState {
  stateVector: Uint8Array;
  missing: number[];
}

// Socket Events - Client to Server
export interface ClientToServerEvents {
  // Room events
  'room:create': (data: CreateRoomInput, callback: (room: Room | null) => void) => void;
  'room:join': (roomId: string, callback: (room: Room | null) => void) => void;
  'room:leave': (roomId: string, callback: () => void) => void;
  'room:update': (roomId: string, data: Partial<RoomUpdate>, callback: (room: Room | null) => void) => void;
  
  // Presence events
  'presence:update': (presence: PresenceState, callback: () => void) => void;
  
  // Yjs events
  'yjs:update': (update: YjsUpdate) => void;
  'yjs:sync': (roomId: string, callback: (updates: Uint8Array[]) => void) => void;
}

// Socket Events - Server to Client
export interface ServerToClientEvents {
  // Room events
  'room:created': (room: Room) => void;
  'room:joined': (room: Room) => void;
  'room:left': (roomId: string, userId: string) => void;
  'room:updated': (room: Room) => void;
  'room:deleted': (roomId: string) => void;
  
  // Presence events
  'presence:updated': (presence: PresenceState) => void;
  'user:joined': (user: User) => void;
  'user:left': (userId: string) => void;
  
  // Yjs events
  'yjs:update': (update: YjsUpdate) => void;
  'yjs:state': (state: DocumentState) => void;
  
  // Error events
  'error': (error: { code: string; message: string }) => void;
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}