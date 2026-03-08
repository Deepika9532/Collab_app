import React, { useState } from 'react';
import { useRoom } from '../../hooks/useRoom';
import { getSocket } from '../../lib/socket';

interface CreateRoomProps {
  onSuccess?: (roomId: string) => void;
  onCancel?: () => void;
}

export const CreateRoom: React.FC<CreateRoomProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const { createRoom, isLoading } = useRoom({ socket: getSocket() });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Room name is required');
      return;
    }

    try {
      const room = await createRoom({ name, description });
      if (room) {
        onSuccess?.(room.id);
      }
    } catch (err) {
      setError('Failed to create room');
      console.error(err);
    }
  };

  return (
    <div className="create-room-modal">
      <div className="modal-content">
        <h2>Create New Room</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Room Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter room description"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};