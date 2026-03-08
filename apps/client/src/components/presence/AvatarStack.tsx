import React from 'react';
import { User } from '@collab-app/shared-types';

interface AvatarStackProps {
  users: User[];
  maxVisible?: number;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  users,
  maxVisible = 4,
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  const getColor = (color: string) => {
    return color || `hsl(${Math.random() * 360}, 70%, 50%)`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="avatar-stack">
      {visibleUsers.map((user) => (
        <div
          key={user.id}
          className="avatar"
          style={{ backgroundColor: getColor(user.color) }}
          title={user.name}
        >
          {getInitials(user.name)}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="avatar avatar-more" title={`${remainingCount} more`}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};