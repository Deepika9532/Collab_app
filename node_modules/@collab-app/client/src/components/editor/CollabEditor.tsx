import React, { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { useYDoc } from '../../hooks/useYDoc';
import { usePresence } from '../../hooks/usePresence';
import { getSocket } from '../../lib/socket';
import { Toolbar } from './Toolbar';
import { BlockRenderer } from './BlockRenderer';
import { CursorOverlay } from '../presence/CursorOverlay';
import { AvatarStack } from '../presence/AvatarStack';
import { Toast } from '../ui/Toast';
import { useUserStore } from '../../stores/userStore';
import { User, CursorPosition } from '@collab-app/shared-types';

interface CollabEditorProps {
  roomId: string;
  userId: string;
  userName: string;
  onBackToList?: () => void;
}

export const CollabEditor: React.FC<CollabEditorProps> = ({
  roomId,
  userId,
  userName,
  onBackToList,
}) => {
  const [userColor] = useState(
    `hsl(${Math.random() * 360}, 70%, 50%)`
  );
  const socket = getSocket();
  
  // Get participants from store
  const roomParticipants = useUserStore((state) => 
    Array.from(state.roomParticipants.values())
  );
  const presenceStates = useUserStore((state) => state.presenceStates);
  const addParticipant = useUserStore((state) => state.addParticipant);
  const removeParticipant = useUserStore((state) => state.removeParticipant);
  
  const { doc, isSynced, getText } = useYDoc({
    socket,
    roomId,
    clientId: userId,
  });

  const { updateCursorPosition } = usePresence({
    socket,
    roomId,
    userId,
    enabled: true,
  });

  const [cursorPosition, setCursorPosition] = useState({ line: 0, ch: 0 });
  const [content, setContent] = useState('');
  const [remoteCursors, setRemoteCursors] = useState<CursorPosition[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track room participants
  useEffect(() => {
    // Add current user to participants
    addParticipant({ id: userId, name: userName, color: userColor });

    // Listen for user joined events
    socket.on('user:joined', (user: User) => {
      addParticipant(user);
    });

    // Listen for user left events
    socket.on('user:left', (leftUserId: string) => {
      removeParticipant(leftUserId);
    });

    return () => {
      removeParticipant(userId);
    };
  }, [socket, roomId, userId, userName, userColor, addParticipant, removeParticipant]);

  // Convert presence states to cursor positions
  useEffect(() => {
    const cursors: CursorPosition[] = [];
    
    presenceStates.forEach((presence, presenceUserId) => {
      if (presenceUserId !== userId && presence.cursorPosition) {
        const participant = roomParticipants.find(p => p.id === presenceUserId);
        if (participant) {
          cursors.push({
            userId: presenceUserId,
            userName: participant.name,
            color: participant.color,
            position: presence.cursorPosition,
          });
        }
      }
    });
    
    setRemoteCursors(cursors);
  }, [presenceStates, roomParticipants, userId]);

  // Delete room from localStorage
  const handleDelete = useCallback(async () => {
    if (!confirm(`Are you sure you want to delete "${roomId}"? This cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Remove from localStorage
      localStorage.removeItem(`collab-room-${roomId}`);
      
      // Remove from all rooms list
      const allRoomsKey = 'collab-all-rooms';
      const existingRooms = JSON.parse(localStorage.getItem(allRoomsKey) || '[]');
      const updatedRooms = existingRooms.filter((id: string) => id !== roomId);
      localStorage.setItem(allRoomsKey, JSON.stringify(updatedRooms));
      
      console.log('✅ Room deleted:', roomId);
      setToast({ message: 'Room deleted successfully!', type: 'success' });
      
      // Navigate back to room list
      setTimeout(() => {
        onBackToList?.();
      }, 1000);
    } catch (error) {
      console.error('❌ Error deleting room:', error);
      setToast({ message: 'Failed to delete room', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [roomId, onBackToList]);

  // Save document to localStorage
  const handleSave = useCallback(async () => {
    if (!doc || isSaving) return;
    
    setIsSaving(true);
    try {
      // Get current content from Y.XmlText
      const fragment = getText('content');
      const xmlText = fragment.toArray()[0] as Y.XmlText | undefined;
      const textToSave = xmlText ? xmlText.toString() : '';
      
      // Save to localStorage
      const saveData = {
        roomId,
        content: textToSave,
        timestamp: Date.now(),
        savedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(`collab-room-${roomId}`, JSON.stringify(saveData));
      
      // Also save to a list of all rooms
      const allRoomsKey = 'collab-all-rooms';
      const existingRooms = JSON.parse(localStorage.getItem(allRoomsKey) || '[]');
      if (!existingRooms.includes(roomId)) {
        existingRooms.push(roomId);
        localStorage.setItem(allRoomsKey, JSON.stringify(existingRooms));
      }
      
      setLastSaved(new Date());
      console.log('✅ Document saved:', saveData);
      
      // Show success toast notification
      setToast({ message: 'Document saved successfully!', type: 'success' });
    } catch (error) {
      console.error('❌ Error saving document:', error);
      setToast({ message: 'Failed to save document', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [doc, getText, roomId, isSaving]);

  // Auto-save on content change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content && lastSaved) {
        // Only auto-save if content changed since last save
        const savedData = localStorage.getItem(`collab-room-${roomId}`);
        const parsed = savedData ? JSON.parse(savedData) : null;
        if (parsed?.content !== content) {
          handleSave();
        }
      }
    }, 5000); // Auto-save after 5 seconds of inactivity
    
    return () => clearTimeout(timer);
  }, [content, roomId, lastSaved, handleSave]);
  const handleSelectionChange = useCallback(
    (e: React.SyntheticEvent) => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Simple approximation of cursor position
        const textNode = range.startContainer;
        if (textNode.nodeType === Node.TEXT_NODE) {
          const lineStart = textNode.textContent?.lastIndexOf('\n', range.startOffset - 1) ?? -1;
          const line = (textNode.textContent?.slice(0, range.startOffset).match(/\n/g) || []).length;
          const ch = range.startOffset - lineStart - 1;
          
          const newPos = { line, ch };
          setCursorPosition(newPos);
          updateCursorPosition(newPos);
        }
      }
    },
    [updateCursorPosition]
  );

  // Get the shared text fragment
  const yFragment = doc ? getText('content') : null;

  return (
    <div className="collab-editor">
      {/* Toast notifications */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
        }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={3000}
            onClose={() => setToast(null)}
          />
        </div>
      )}
      
      {/* Header with participants */}
      <div className="editor-header">
        <h3>Collaborative Editor</h3>
        <AvatarStack users={roomParticipants} />
      </div>
  
      {/* Toolbar */}
      <Toolbar 
        onFormat={() => {}} 
        onSave={handleSave}
        isSaving={isSaving}
      />
      
      {/* Delete Button */}
      <div style={{ padding: '0.5rem 1rem', background: '#fff5f5', borderTop: '1px solid #fed7d7' }}>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            background: '#f56565',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            opacity: isDeleting ? 0.6 : 1,
          }}
        >
          {isDeleting ? '⟳ Deleting...' : '🗑️ Delete Room'}
        </button>
      </div>
  
      {/* Editor content */}
      <div className="editor-content" style={{ position: 'relative' }}>
        {yFragment ? (
          <BlockRenderer
            yFragment={yFragment}
            onChange={setContent}
            readOnly={false}
          />
        ) : (
          <div className="loading">Loading document...</div>
        )}
          
        {/* Remote cursors overlay */}
        <CursorOverlay cursors={remoteCursors} />
      </div>
  
      {/* Status bar */}
      <div className="editor-status">
        <span>
          {isSynced ? '✓ Synced' : '⟳ Syncing...'}
        </span>
        <span>{userName}</span>
        <span>{roomParticipants.length} online</span>
        {lastSaved && (
          <span style={{ fontSize: '0.85em', opacity: 0.7 }}>
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};