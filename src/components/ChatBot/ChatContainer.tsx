
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Settings, RotateCcw } from 'lucide-react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ApiKeyModal from './ApiKeyModal';
import { cn } from '@/lib/utils';
import { claudeService } from '@/services/claudeService';
import { chatContextManager, ChatMessage } from '@/services/chatContextManager';
import { toast } from 'sonner';

const ChatContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      const messagesContainer = containerRef.current.querySelector('div:first-child');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  };

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

  useEffect(() => {
    if (containerRef.current && isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
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
      toast.error("Failed to get a response. Please try again.");
      
      // Add error message for user
      const errorMessage: ChatMessage = {
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again or contact our support team directly.",
        timestamp: Date.now()
      };
      
      chatContextManager.addMessage(errorMessage);
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300"
        >
          <MessageCircle size={20} />
          <span>Need help?</span>
        </button>
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
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Customer Support</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearConversation}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <RotateCcw size={16} className="text-gray-500" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Settings"
              >
                <Settings size={18} className="text-gray-500" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          <ChatMessages messages={messages} />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          
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
