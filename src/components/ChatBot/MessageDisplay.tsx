
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MessageDisplayProps {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
    automated?: boolean;
  };
  detectIntent?: (content: string) => string | null;
}

// Helper function to format timestamps
const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, detectIntent }) => {
  const isUserMessage = message.role === 'user';
  const intent = isUserMessage && detectIntent ? detectIntent(message.content) : null;
  const isAutomated = message.role === 'assistant' && message.automated;

  return (
    <div
      className={cn(
        "flex w-full",
        isUserMessage ? "justify-end" : "justify-start"
      )}
    >
      <div className="flex flex-col max-w-[80%]">
        {/* Intent tag for user messages */}
        {intent && (
          <span className="text-xs text-gray-500 self-end mb-1 mr-1">
            {intent}
          </span>
        )}
        
        <div
          className={cn(
            "px-4 py-2 rounded-2xl animate-in slide-in-from-bottom duration-300",
            isUserMessage 
              ? "bg-primary text-white rounded-br-none" 
              : isAutomated
                ? "bg-blue-50 text-gray-800 rounded-bl-none border border-blue-100"
                : "bg-gray-100 text-gray-800 rounded-bl-none"
          )}
        >
          {message.content.split('\n').map((text, i) => (
            <React.Fragment key={i}>
              {text}
              {i !== message.content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        
        {/* Automated response indicator */}
        {isAutomated && (
          <span className="text-xs text-blue-500 italic mt-1 ml-1">
            Auto-response
          </span>
        )}
        
        {/* Timestamp */}
        {message.timestamp && (
          <span 
            className={cn(
              "text-xs text-gray-500 mt-1",
              isUserMessage ? "self-end mr-1" : "self-start ml-1"
            )}
          >
            {formatTimestamp(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageDisplay;
