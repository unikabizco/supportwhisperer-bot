
import { useRef, useEffect } from 'react';

/**
 * Hook for scrolling chat to bottom
 */
export const useChatScroll = (messages: Array<{ role: string; content: string }>, isOpen: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      const messagesContainer = containerRef.current.querySelector('div:first-child');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (containerRef.current && isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  return { containerRef, scrollToBottom };
};
