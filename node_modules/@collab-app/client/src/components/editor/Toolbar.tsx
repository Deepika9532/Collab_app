import React from 'react';

interface ToolbarProps {
  onFormat: (format: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onFormat, onSave, isSaving }) => {
  const handleBold = () => {
    document.execCommand('bold', false);
    onFormat('bold');
  };

  const handleItalic = () => {
    document.execCommand('italic', false);
    onFormat('italic');
  };

  const handleUnderline = () => {
    document.execCommand('underline', false);
    onFormat('underline');
  };

  return (
    <div className="toolbar">
      <button onClick={handleBold} title="Bold" className="toolbar-btn">
        <strong>B</strong>
      </button>
      <button onClick={handleItalic} title="Italic" className="toolbar-btn">
        <em>I</em>
      </button>
      <button onClick={handleUnderline} title="Underline" className="toolbar-btn">
        <u>U</u>
      </button>
      <div style={{ flex: 1 }} />
      {onSave && (
        <button 
          onClick={onSave} 
          disabled={isSaving}
          className="toolbar-btn save-btn"
          title="Save document"
        >
          {isSaving ? '⟳ Saving...' : '💾 Save'}
        </button>
      )}
    </div>
  );
};