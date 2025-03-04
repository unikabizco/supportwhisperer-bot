
import { chatContextManager, ChatMessage } from '@/services/chat';
import { toast } from 'sonner';

/**
 * Hook for conversation management operations
 */
export const useConversationManagement = (
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
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

  return {
    handleClearConversation
  };
};
