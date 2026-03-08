import React, { useEffect, useState } from 'react';
import { Room } from '@collab-app/shared-types';
import { useRoomStore } from '../../stores/roomStore';
import { getSocket } from '../../lib/socket';

interface RoomListProps {
  onJoinRoom: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ onJoinRoom }) => {
  const [isLoading, setIsLoading] = useState(true);
  const rooms = useRoomStore((state) => state.rooms);
  const setRooms = useRoomStore((state) => state.setRooms);
  const socket = getSocket();

  useEffect(() => {
    // In a real app, you would fetch rooms from the server
    // For now, we'll just listen to room creation events
    const handleRoomCreated = (room: Room) => {
      setRooms([...rooms, room]);
    };

    socket.on('room:created', handleRoomCreated);

    // Simulate initial load
    setIsLoading(false);

    return () => {
      socket.off('room:created');
    };
  }, [socket, rooms, setRooms]);

  const handleJoin = (roomId: string) => {
    onJoinRoom(roomId);
  };

  if (isLoading) {
    return <div className="loading">Loading rooms...</div>;
  }

  if (rooms.length === 0) {
    return (
      <div className="room-list-empty">
        <p>No rooms available</p>
        <p>Create a new room to get started!</p>
      </div>
    );
  }

  return (
    <div className="room-list">
      <h2>Available Rooms</h2>
      
      <div className="room-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <h3>{room.name}</h3>
            
            {room.description && (
              <p className="room-description">{room.description}</p>
            )}
            
            <div className="room-meta">
              <span className="participants-count">
                {room.participants.length} participant(s)
              </span>
            </div>
            
            <button
              onClick={() => handleJoin(room.id)}
              className="btn-join"
            >
              Join Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};