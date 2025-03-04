
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import ChatButton from './ChatButton';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ApiKeyModal from './ApiKeyModal';
import { ChatMessage } from '@/services/chat';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useChatScroll } from '@/hooks/useChatScroll';
import { detectMessageIntent } from '@/services/chat/automatedResponses';
import { useChatMessageHandling } from '@/hooks/useChatMessageHandling';
import { useConversationManagement } from '@/hooks/useConversationManagement';

const ChatContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Custom hooks
  const { 
    messages, 
    setMessages, 
    useAutomation,
    setUseAutomation,
    checkForAutomatedResponse
  } = useChatMessages(isOpen);
  
  const externalNetworkStatus = useNetworkStatus(isOpen);
  const { containerRef, scrollToBottom } = useChatScroll(messages, isOpen);
  
  const {
    isLoading,
    showSettings,
    setShowSettings,
    handleSendMessage,
    isOnline
  } = useChatMessageHandling(messages, setMessages, checkForAutomatedResponse, scrollToBottom);
  
  const { handleClearConversation } = useConversationManagement(setMessages);

  // Use both the hook's internal network status and the external one
  const combinedNetworkStatus = isOnline && externalNetworkStatus;

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
            isOnline={combinedNetworkStatus}
            useAutomation={useAutomation}
            onToggleAutomation={() => setUseAutomation(!useAutomation)}
          />

          <ChatMessages 
            messages={messages}
            detectIntent={detectMessageIntent}
          />
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            disabled={!combinedNetworkStatus} 
          />
          
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
