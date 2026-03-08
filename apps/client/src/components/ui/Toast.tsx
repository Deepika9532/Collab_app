import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#48bb78';
      case 'error': return '#f56565';
      case 'info': return '#4299e1';
      default: return '#4a5568';
    }
  };

  return (
    <div 
      className="toast"
      style={{
        background: getBackgroundColor(),
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '400px',
      }}
    >
      <span>{getIcon()}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.25rem',
          padding: '0',
          lineHeight: '1',
        }}
      >
        ×
      </button>
    </div>
  );
};
