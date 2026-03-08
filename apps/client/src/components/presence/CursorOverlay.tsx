import React from 'react';
import { CursorPosition } from '@collab-app/shared-types';

interface CursorOverlayProps {
  cursors: CursorPosition[];
  containerRef?: React.RefObject<HTMLElement>;
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({
  cursors,
  containerRef,
}) => {
  if (!cursors || cursors.length === 0) {
    return null;
  }

  return (
    <div className="cursor-overlay">
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="remote-cursor"
          style={{
            position: 'absolute',
            left: `${cursor.position.ch * 8}px`, // Approximate character width
            top: `${cursor.position.line * 24}px`, // Approximate line height
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {/* Cursor line */}
          <div
            className="cursor-line"
            style={{
              width: '2px',
              height: '20px',
              backgroundColor: cursor.color,
              animation: 'cursor-blink 1s infinite',
            }}
          />
          
          {/* Cursor label */}
          <div
            className="cursor-label"
            style={{
              position: 'absolute',
              top: '-20px',
              left: '0',
              backgroundColor: cursor.color,
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
};