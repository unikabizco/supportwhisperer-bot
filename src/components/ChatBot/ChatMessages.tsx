
import React from 'react';
import { cn } from '@/lib/utils';

interface ChatMessagesProps {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex w-full",
            message.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] px-4 py-2 rounded-2xl animate-in slide-in-from-bottom duration-300",
              message.role === 'user' 
                ? "bg-primary text-white rounded-br-none" 
                : "bg-gray-100 text-gray-800 rounded-bl-none"
            )}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
