
import React, { useState } from 'react';
import { SendIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !disabled) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t p-4 bg-white bg-opacity-90"
    >
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={disabled ? "You're offline. Reconnect to send messages." : "Type your message..."}
          className="w-full p-2 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading || disabled}
        />
        <button
          type="submit"
          className="absolute right-2 p-1.5 rounded-full bg-primary text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!inputValue.trim() || isLoading || disabled}
          aria-label="Send message"
        >
          <SendIcon size={16} />
        </button>
      </div>
      {isLoading && (
        <p className="text-xs text-gray-500 mt-1 ml-2">Processing your request...</p>
      )}
    </form>
  );
};

export default ChatInput;
