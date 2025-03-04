
import { useState, useEffect } from 'react';
import { chatContextManager, ChatMessage } from '@/services/chat';
import { toast } from 'sonner';

/**
 * Hook for managing chat messages and loading state
 */
export const useChatMessages = (isOpen: boolean) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant' | 'system'; content: string; timestamp?: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from context on initial render
  useEffect(() => {
    if (isOpen) {
      const context = chatContextManager.getContext();
      
      if (context && context.messages.length > 0) {
        setMessages(context.messages);
      } else {
        // If no context exists, add initial greeting
        const initialMessage: ChatMessage = {
          role: 'assistant',
          content: "Hello! I'm your customer support assistant. How can I help you with our electronics products today?",
          timestamp: Date.now()
        };
        chatContextManager.addMessage(initialMessage);
        setMessages([initialMessage]);
      }
    }
  }, [isOpen]);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading
  };
};
