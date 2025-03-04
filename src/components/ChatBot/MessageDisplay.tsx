
import React from 'react';
import { cn } from '@/lib/utils';
import { Bot, User, ExternalLink, ShoppingCart } from 'lucide-react';

interface MessageProps {
  message: { 
    role: 'user' | 'assistant' | 'system'; 
    content: string; 
    timestamp?: number;
    automated?: boolean;
  };
  detectIntent?: (content: string) => string | null;
}

const MessageDisplay: React.FC<MessageProps> = ({ message, detectIntent }) => {
  const isUser = message.role === 'user';
  const intentType = !isUser && detectIntent ? detectIntent(message.content) : null;
  
  // Check if message contains a browsing result
  const hasBrowsingResult = !isUser && message.content.includes('[RETRIEVED DATA]') || 
                           message.content.includes('Amazon Product Information:') ||
                           message.content.includes('Source:');
  
  // For messages with browsing data, we'll add a special icon
  const BrowsingIcon = message.content.includes('Amazon Product Information:') ? 
                      ShoppingCart : ExternalLink;
  
  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex items-start max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex items-center justify-center h-8 w-8 rounded-full mr-2",
          isUser ? "bg-primary text-white ml-2 mr-0" : "bg-gray-100 text-gray-600"
        )}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-2 space-y-2",
          isUser 
            ? "bg-primary text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        )}>
          {/* If there's browsing data, add an indicator */}
          {hasBrowsingResult && (
            <div className={cn(
              "flex items-center text-xs pb-1 italic",
              isUser ? "text-white opacity-80" : "text-gray-500"
            )}>
              <BrowsingIcon size={12} className="inline mr-1" />
              <span>Used web browsing to find this information</span>
            </div>
          )}
          
          {/* Regular message display */}
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
          
          {/* Timestamp or automated indicator */}
          {(message.timestamp || message.automated) && (
            <div className={cn(
              "text-xs italic flex justify-end",
              isUser ? "text-white opacity-70" : "text-gray-500"
            )}>
              {message.automated && <span>Automated Response</span>}
              {message.timestamp && !message.automated && (
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
