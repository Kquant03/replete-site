import React from 'react';
import MarkdownRenderer from '../pneuma/AdvancedMarkdownRenderer';

interface ChatMessageRendererProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({ content, role }) => {
  return (
    <div className={`message-${role}`}>
      <MarkdownRenderer content={content} />
    </div>
  );
};

export default ChatMessageRenderer;