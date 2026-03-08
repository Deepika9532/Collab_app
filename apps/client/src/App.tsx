import React, { useState } from 'react';
import { CreateRoom } from './components/rooms/CreateRoom';
import { RoomList } from './components/rooms/RoomList';
import { CollabEditor } from './components/editor/CollabEditor';

function App() {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'editor'>('list');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [userId] = useState(`user_${Date.now()}`);
  const [userName] = useState('Anonymous User');

  const handleCreateRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentView('editor');
  };

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentView('editor');
  };

  const handleBackToList = () => {
    setCurrentRoomId(null);
    setCurrentView('list');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Collaborative Editor</h1>
        {currentView === 'editor' && (
          <button onClick={handleBackToList} className="btn-back">
            ← Back to Rooms
          </button>
        )}
      </header>

      <main className="app-main">
        {currentView === 'list' && (
          <>
            <button
              onClick={() => setCurrentView('create')}
              className="btn-create"
            >
              Create New Room
            </button>
            <RoomList onJoinRoom={handleJoinRoom} />
          </>
        )}

        {currentView === 'create' && (
          <CreateRoom
            onSuccess={handleCreateRoom}
            onCancel={() => setCurrentView('list')}
          />
        )}

        {currentView === 'editor' && currentRoomId && (
          <CollabEditor
            roomId={currentRoomId}
            userId={userId}
            userName={userName}
            onBackToList={handleBackToList}
          />
        )}
      </main>
    </div>
  );
}

export default App;
