
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import ChatButton from './ChatButton';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ApiKeyModal from './ApiKeyModal';
import { claudeService } from '@/services/claude';
import { chatContextManager, ChatMessage } from '@/services/chat';
import { toast } from 'sonner';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useChatScroll } from '@/hooks/useChatScroll';

const ChatContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom hooks
  const { messages, setMessages, isLoading, setIsLoading } = useChatMessages(isOpen);
  const isOnline = useNetworkStatus(isOpen);
  const { containerRef, scrollToBottom } = useChatScroll(messages, isOpen);

  // Clear conversation history
  const handleClearConversation = () => {
    if (window.confirm("Are you sure you want to clear the conversation history?")) {
      chatContextManager.clearContext();
      
      const initialMessage: ChatMessage = {
        role: 'assistant',
        content: "Hello! I'm your customer support assistant. How can I help you with our electronics products today?",
        timestamp: Date.now()
      };
      
      chatContextManager.addMessage(initialMessage);
      setMessages([initialMessage]);
      toast.success("Conversation history cleared");
    }
  };

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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <ChatButton onClick={() => setIsOpen(true)} />
      )}

      {isOpen && (
        <div
          ref={containerRef}
          className={cn(
            "w-[380px] h-[600px] bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl",
            "flex flex-col border border-gray-200",
            "animate-in slide-in-from-bottom duration-300"
          )}
        >
          <ChatHeader
            onClose={() => setIsOpen(false)}
            onShowSettings={() => setShowSettings(true)}
            onClearConversation={handleClearConversation}
            isOnline={isOnline}
          />

          <ChatMessages messages={messages} />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} disabled={!isOnline} />
          
          <ApiKeyModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
