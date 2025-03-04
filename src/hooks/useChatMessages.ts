
import { useState, useEffect } from 'react';
import { chatContextManager, ChatMessage } from '@/services/chat';
import { getAutomatedResponse } from '@/services/chat/automatedResponses';

/**
 * Hook for managing chat messages and automated responses
 */
export const useChatMessages = (isOpen: boolean) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [useAutomation, setUseAutomation] = useState(true);

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

  /**
   * Checks if a user message can be handled by automated responses
   * @param message The user message to check
   * @returns An automated response or null if API is needed
   */
  const checkForAutomatedResponse = (message: ChatMessage): ChatMessage | null => {
    if (!useAutomation || message.role !== 'user') return null;
    
    const automatedResponse = getAutomatedResponse(message.content);
    if (!automatedResponse) return null;
    
    return {
      role: 'assistant',
      content: automatedResponse,
      timestamp: Date.now(),
      automated: true
    };
  };

  return {
    messages,
    setMessages,
    useAutomation,
    setUseAutomation,
    checkForAutomatedResponse
  };
};
