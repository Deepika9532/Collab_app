import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@collab-app/shared-types';
import { YjsProvider } from '../lib/yjsProvider';

interface UseYDocOptions {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  roomId: string;
  clientId: string;
}

export const useYDoc = ({ socket, roomId, clientId }: UseYDocOptions) => {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<YjsProvider | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  // Initialize Y.Doc and provider
  useEffect(() => {
    const yDoc = new Y.Doc();
    
    const yjsProvider = new YjsProvider({
      socket,
      roomId,
      clientId,
      doc: yDoc,
    });

    setDoc(yDoc);
    setProvider(yjsProvider);

    // Track sync status
    const handleSynced = () => {
      setIsSynced(true);
    };

    yDoc.on('sync', handleSynced);

    return () => {
      yDoc.off('sync', handleSynced);
      yjsProvider.disconnect();
      yDoc.destroy();
    };
  }, [socket, roomId, clientId]);

  // Get or create a shared type
  const getSharedType = useCallback(
    <T extends Y.AbstractType<any>>(typeName: string): T => {
      if (!doc) {
        throw new Error('Document not initialized');
      }
      return doc.get(typeName, Y.XmlFragment) as unknown as T;
    },
    [doc]
  );

  // Create a shared text type
  const getText = useCallback(
    (typeName = 'content') => {
      if (!doc) {
        throw new Error('Document not initialized');
      }
      
      // Get or create XmlFragment
      const fragment = doc.get(typeName, Y.XmlFragment);
      
      // Ensure there's an XmlText child
      if (fragment.length === 0) {
        const xmlText = new Y.XmlText('');
        fragment.insert(0, [xmlText]);
      }
      
      return fragment;
    },
    [doc]
  );

  // Create a shared map type
  const getMap = useCallback(
    <T = any>(typeName: string) => {
      if (!doc) {
        throw new Error('Document not initialized');
      }
      return doc.getMap(typeName) as Y.Map<T>;
    },
    [doc]
  );

  // Create a shared array type
  const getArray = useCallback(
    <T = any>(typeName: string) => {
      if (!doc) {
        throw new Error('Document not initialized');
      }
      return doc.getArray(typeName) as Y.Array<T>;
    },
    [doc]
  );

  return {
    doc,
    provider,
    isSynced,
    getText,
    getMap,
    getArray,
  };
};