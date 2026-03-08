import React, { useRef, useEffect } from 'react';
import * as Y from 'yjs';

interface BlockRendererProps {
  yFragment: Y.XmlFragment;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  yFragment,
  onChange,
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromRemote = useRef(false);

  useEffect(() => {
    if (!editorRef.current || !yFragment) return;

    const editor = editorRef.current;

    // Get or create Y.XmlText
    const getYXmlText = (): Y.XmlText => {
      const firstChild = yFragment.toArray()[0];
      if (firstChild instanceof Y.XmlText) {
        return firstChild;
      }
      // Create new Y.XmlText if it doesn't exist
      const xmlText = new Y.XmlText('');
      yFragment.insert(0, [xmlText]);
      return xmlText;
    };

    // Render text from Y.XmlText
    const renderContent = () => {
      const xmlText = getYXmlText();
      const delta = xmlText.toDelta();
      
      // Simple text rendering (can be enhanced for rich text)
      let text = '';
      delta.forEach((op: any) => {
        if (typeof op.insert === 'string') {
          text += op.insert;
        }
      });

      // Only update if content is different and we're not already updating
      if (editor.textContent !== text && !isUpdatingFromRemote.current) {
        isUpdatingFromRemote.current = true;
        editor.textContent = text;
        
        // Restore cursor position if needed
        const range = window.getSelection()?.getRangeAt(0);
        if (range) {
          // Simple cursor restoration - can be improved
        }
        
        isUpdatingFromRemote.current = false;
      }
    };

    // Observe changes to the Y.XmlText
    const xmlText = getYXmlText();
    const observer = () => {
      if (!isUpdatingFromRemote.current) {
        renderContent();
        onChange?.(editor.textContent || '');
      }
    };

    xmlText.observe(observer);
    renderContent();

    // Handle local input
    const handleInput = (e: Event) => {
      if (readOnly || isUpdatingFromRemote.current) return;
      
      const target = e.target as HTMLDivElement;
      const newText = target.textContent || '';
      const currentXmlText = getYXmlText();
      
      // Calculate diff and apply minimal change
      const oldText = currentXmlText.toString();
      
      if (newText !== oldText) {
        // Simple diff approach - replace entire text
        // Can be optimized with better diffing algorithm
        currentXmlText.delete(0, currentXmlText.length);
        currentXmlText.insert(0, newText);
        onChange?.(newText);
      }
    };

    editor.addEventListener('input', handleInput);

    return () => {
      xmlText.unobserve(observer);
      editor.removeEventListener('input', handleInput);
    };
  }, [yFragment, onChange, readOnly]);

  return (
    <div
      ref={editorRef}
      className="block-renderer"
      contentEditable={!readOnly}
      suppressContentEditableWarning
      style={{
        minHeight: '100px',
        padding: '8px',
        outline: 'none',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    />
  );
};