
import { useState, useEffect } from 'react';
import { chatContextManager, ChatMessage } from '@/services/chat';
import { aiService } from '@/services/ai';
import { toast } from 'sonner';

/**
 * Hook for handling sending messages and getting AI responses
 */
export const useChatMessageHandling = (
  messages: ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  checkForAutomatedResponse: (message: ChatMessage) => ChatMessage | null,
  scrollToBottom: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Add event listeners for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Check if online before proceeding
    if (!isOnline) {
      toast.error("You're offline. Please check your internet connection.");
      
      const errorMessage: ChatMessage = {
        role: 'assistant', 
        content: "I notice you're currently offline. I'll need an internet connection to provide you with the best support. Please check your connection and try again.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: message,
        timestamp: Date.now()
      }, errorMessage]);
      
      return;
    }
    
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: message,
      timestamp: Date.now()
    };
    
    // Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Check for automated response before calling the API
    const automatedResponse = checkForAutomatedResponse(userMessage);
    
    if (automatedResponse) {
      // Add automated response to context
      chatContextManager.addMessage(userMessage);
      chatContextManager.addMessage(automatedResponse);
      
      // Update UI with both messages
      setTimeout(() => {
        setMessages(prev => [...prev, automatedResponse]);
        scrollToBottom();
      }, 500); // Small delay to simulate typing
      
      return;
    }
    
    // If no automated response, proceed with AI API
    setIsLoading(true);
    
    try {
      // Check if either API key exists
      const claudeApiKey = localStorage.getItem('claude_api_key');
      const openaiApiKey = localStorage.getItem('openai_api_key');
      
      if (!claudeApiKey && !openaiApiKey) {
        setShowSettings(true);
        setIsLoading(false);
        return;
      }
      
      // Send to AI service with unified service
      const assistantResponse = await aiService.sendMessage(userMessage);
      
      // Get updated message list from context manager
      const updatedContext = chatContextManager.getContext();
      if (updatedContext) {
        setMessages(updatedContext.messages);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message for user if not already handled by the service
      if (!error.message || (
          error.message !== 'offline' && 
          error.message !== 'timeout' && 
          !error.message.includes('API error'))) {
        const errorMessage: ChatMessage = {
          role: 'assistant', 
          content: "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again or contact our support team directly.",
          timestamp: Date.now()
        };
        
        chatContextManager.addMessage(errorMessage);
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return {
    isLoading,
    setIsLoading,
    showSettings,
    setShowSettings,
    handleSendMessage,
    isOnline
  };
};
