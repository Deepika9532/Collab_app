import {
  Room,
  CreateRoomInput,
  User,
  PresenceState,
} from '@collab-app/shared-types';

interface RoomState {
  room: Room;
  participants: Map<string, User>; // socketId -> User
  presenceStates: Map<string, PresenceState>; // userId -> PresenceState
  yjsUpdates: Uint8Array[];
}

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  // Create a new room
  createRoom(socketId: string, data: CreateRoomInput): Room {
    const roomId = this.generateRoomId();
    const now = Date.now();

    const room: Room = {
      id: roomId,
      name: data.name,
      description: data.description,
      createdAt: now,
      updatedAt: now,
      participants: [socketId],
    };

    this.rooms.set(roomId, {
      room,
      participants: new Map([[socketId, { id: socketId, name: '', color: '' }]]),
      presenceStates: new Map(),
      yjsUpdates: [],
    });

    return room;
  }

  // Get a room by ID
  getRoom(roomId: string): Room | null {
    const roomState = this.rooms.get(roomId);
    return roomState?.room || null;
  }

  // Get all rooms
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values()).map((state) => state.room);
  }

  // Add participant to room
  addParticipant(roomId: string, socketId: string, user: User): boolean {
    const roomState = this.rooms.get(roomId);
    if (!roomState) return false;

    roomState.participants.set(socketId, user);
    if (!roomState.room.participants.includes(socketId)) {
      roomState.room.participants.push(socketId);
    }
    roomState.room.updatedAt = Date.now();

    return true;
  }

  // Remove participant from room
  removeParticipant(roomId: string, socketId: string): boolean {
    const roomState = this.rooms.get(roomId);
    if (!roomState) return false;

    roomState.participants.delete(socketId);
    roomState.room.participants = roomState.room.participants.filter(
      (id) => id !== socketId
    );
    roomState.room.updatedAt = Date.now();

    // Clean up empty rooms after some time
    if (roomState.participants.size === 0) {
      setTimeout(() => {
        const currentState = this.rooms.get(roomId);
        if (currentState && currentState.participants.size === 0) {
          this.rooms.delete(roomId);
        }
      }, 60000); // Clean up after 1 minute
    }

    return true;
  }

  // Update presence state
  updatePresence(roomId: string, presence: PresenceState): boolean {
    const roomState = this.rooms.get(roomId);
    if (!roomState) return false;

    roomState.presenceStates.set(presence.userId, presence);
    return true;
  }

  // Get presence states for a room
  getPresenceStates(roomId: string): PresenceState[] {
    const roomState = this.rooms.get(roomId);
    if (!roomState) return [];

    return Array.from(roomState.presenceStates.values());
  }

  // Store Yjs update
  storeYjsUpdate(roomId: string, update: Uint8Array): void {
    const roomState = this.rooms.get(roomId);
    if (!roomState) return;

    roomState.yjsUpdates.push(update);

    // Limit stored updates to prevent memory issues
    if (roomState.yjsUpdates.length > 100) {
      roomState.yjsUpdates.shift();
    }
  }

  // Get Yjs updates for sync
  getYjsUpdates(roomId: string): Uint8Array[] {
    const roomState = this.rooms.get(roomId);
    if (!roomState) return [];

    return [...roomState.yjsUpdates];
  }

  // Handle user disconnect
  handleDisconnect(socketId: string): { roomId?: string; userId?: string }[] {
    const notifications: { roomId?: string; userId?: string }[] = [];
    
    // Find and remove from all rooms
    for (const [roomId, roomState] of this.rooms.entries()) {
      if (roomState.participants.has(socketId)) {
        this.removeParticipant(roomId, socketId);
        
        // Notify other participants
        roomState.participants.forEach((user, otherSocketId) => {
          if (otherSocketId !== socketId) {
            notifications.push({ roomId, userId: socketId });
          }
        });
      }
    }

    // Remove from userSockets mapping
    for (const [userId, sid] of this.userSockets.entries()) {
      if (sid === socketId) {
        this.userSockets.delete(userId);
        break;
      }
    }
    
    return notifications;
  }

  // Helper methods
  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public setSocketForUser(userId: string, socketId: string): void {
    this.userSockets.set(userId, socketId);
  }

  public getSocketForUser(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }
}