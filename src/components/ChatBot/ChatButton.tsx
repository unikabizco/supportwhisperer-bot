
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300"
      aria-label="Open chat"
    >
      <MessageCircle size={20} />
      <span>Need help?</span>
    </button>
  );
};

export default ChatButton;
