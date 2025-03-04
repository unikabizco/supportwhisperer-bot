
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ChatMessagesProps {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string; timestamp?: number }>;
}

// Helper function to format timestamps
const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Show typing indicator briefly after user messages
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      setShowTyping(true);
      const timer = setTimeout(() => {
        setShowTyping(false);
      }, 1000); // Show for 1 second
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Helper to detect user intent from message content
  const detectIntent = (content: string): string | null => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('return') || lowerContent.includes('refund')) {
      return 'returns';
    } else if (lowerContent.includes('order') || lowerContent.includes('shipping') || lowerContent.includes('delivery')) {
      return 'orders';
    } else if (lowerContent.includes('warranty') || lowerContent.includes('broken') || lowerContent.includes('repair')) {
      return 'warranty';
    } else if (lowerContent.includes('help') || lowerContent.includes('support')) {
      return 'support';
    }
    
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages
        .filter(message => message.role !== 'system') // Don't display system messages
        .map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex w-full",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className="flex flex-col max-w-[80%]">
              {/* Intent tag for user messages */}
              {message.role === 'user' && detectIntent(message.content) && (
                <span className="text-xs text-gray-500 self-end mb-1 mr-1">
                  {detectIntent(message.content)}
                </span>
              )}
              
              <div
                className={cn(
                  "px-4 py-2 rounded-2xl animate-in slide-in-from-bottom duration-300",
                  message.role === 'user' 
                    ? "bg-primary text-white rounded-br-none" 
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
              
              {/* Timestamp */}
              {message.timestamp && (
                <span 
                  className={cn(
                    "text-xs text-gray-500 mt-1",
                    message.role === 'user' ? "self-end mr-1" : "self-start ml-1"
                  )}
                >
                  {formatTimestamp(message.timestamp)}
                </span>
              )}
            </div>
          </div>
        ))}

      {/* Typing indicator */}
      {showTyping && (
        <div className="flex w-full justify-start">
          <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none">
            <Loader2 size={16} className="animate-spin text-gray-500" />
            <span className="text-sm text-gray-500">Thinking...</span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
