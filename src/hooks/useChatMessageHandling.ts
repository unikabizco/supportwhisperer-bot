
import { useState } from 'react';
import { chatContextManager, ChatMessage } from '@/services/chat';
import { claudeService } from '@/services/claude';
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

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Check if online before proceeding
    if (!navigator.onLine) {
      toast.error("You're offline. Please check your internet connection.");
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
    
    // If no automated response, proceed with Claude API
    setIsLoading(true);
    
    try {
      // Check if API key exists
      const apiKey = localStorage.getItem('claude_api_key');
      if (!apiKey) {
        setShowSettings(true);
        setIsLoading(false);
        return;
      }
      
      // Send to Claude AI with updated service
      const assistantResponse = await claudeService.sendMessage(userMessage);
      
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
    handleSendMessage
  };
};
