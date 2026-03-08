import * as Y from 'yjs';
import { Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  YjsUpdate,
} from '@collab-app/shared-types';

interface YjsProviderConfig {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  roomId: string;
  clientId: string;
  doc: Y.Doc;
}

export class YjsProvider {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private roomId: string;
  private clientId: string;
  private doc: Y.Doc;
  private awareness: Map<string, any> = new Map();
  private isConnected = false;

  constructor(config: YjsProviderConfig) {
    this.socket = config.socket;
    this.roomId = config.roomId;
    this.clientId = config.clientId;
    this.doc = config.doc;

    // Ensure we're connected before requesting sync
    if (this.socket.connected) {
      this.setupEventListeners();
      this.requestSync();
    } else {
      this.socket.once('connect', () => {
        this.setupEventListeners();
        this.requestSync();
      });
    }
  }

  private setupEventListeners() {
    // Listen for updates from other clients
    this.socket.on('yjs:update', (update: YjsUpdate) => {
      if (update.clientId !== this.clientId) {
        try {
          Y.applyUpdate(this.doc, update.update);
        } catch (error) {
          console.error('Error applying update:', error);
        }
      }
    });

    // Handle connection state
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.requestSync();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    // Listen to local document changes
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== 'remote' && this.isConnected) {
        this.sendUpdate(update);
      }
    });
  }

  private sendUpdate(update: Uint8Array) {
    const yjsUpdate: YjsUpdate = {
      roomId: this.roomId,
      update,
      clientId: this.clientId,
    };

    this.socket.emit('yjs:update', yjsUpdate);
  }

  private requestSync() {
    this.socket.emit('yjs:sync', this.roomId, (updates: Uint8Array[]) => {
      if (updates && updates.length > 0) {
        try {
          const mergedUpdate = Y.mergeUpdates(updates);
          Y.applyUpdate(this.doc, mergedUpdate, 'remote');
        } catch (error) {
          console.error('Error syncing document:', error);
        }
      }
    });
  }

  public getDoc(): Y.Doc {
    return this.doc;
  }

  public disconnect() {
    this.socket.off('yjs:update');
    this.socket.off('connect');
    this.socket.off('disconnect');
    this.isConnected = false;
  }
}