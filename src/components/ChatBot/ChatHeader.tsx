
import React from 'react';
import { X, Settings, RotateCcw, Wifi, WifiOff } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  onShowSettings: () => void;
  onClearConversation: () => void;
  isOnline: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onClose, 
  onShowSettings, 
  onClearConversation,
  isOnline 
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold">Customer Support</h2>
      <div className="flex items-center gap-2">
        {/* Network status indicator */}
        <div className="mr-1" title={isOnline ? "Online" : "Offline"}>
          {isOnline ? (
            <Wifi size={16} className="text-green-500" />
          ) : (
            <WifiOff size={16} className="text-red-500" />
          )}
        </div>
        <button
          onClick={onClearConversation}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Clear conversation"
          title="Clear conversation"
        >
          <RotateCcw size={16} className="text-gray-500" />
        </button>
        <button
          onClick={onShowSettings}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Settings"
        >
          <Settings size={18} className="text-gray-500" />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
