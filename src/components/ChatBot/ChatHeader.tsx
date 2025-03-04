
import React from 'react';
import { X, Settings, Trash2, WifiOff, Zap, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  onClose: () => void;
  onShowSettings: () => void;
  onClearConversation: () => void;
  isOnline: boolean;
  useAutomation?: boolean;
  onToggleAutomation?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onClose, 
  onShowSettings, 
  onClearConversation,
  isOnline,
  useAutomation = true,
  onToggleAutomation
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">Electronics Support</h2>
        {!isOnline && (
          <div className="flex items-center ml-2 text-red-500">
            <WifiOff size={14} className="mr-1" />
            <span className="text-xs">Offline</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {onToggleAutomation && (
          <button
            onClick={onToggleAutomation}
            className={cn(
              "p-1.5 rounded-full text-gray-600 hover:bg-gray-100",
              useAutomation ? "text-amber-500" : "text-gray-400"
            )}
            title={useAutomation ? "Automated responses on" : "Automated responses off"}
            aria-label={useAutomation ? "Turn off automated responses" : "Turn on automated responses"}
          >
            {useAutomation ? <Zap size={18} /> : <ZapOff size={18} />}
          </button>
        )}
        
        <button
          onClick={onClearConversation}
          className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100"
          title="Clear conversation"
          aria-label="Clear conversation"
        >
          <Trash2 size={18} />
        </button>
        
        <button
          onClick={onShowSettings}
          className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100"
          title="Settings"
          aria-label="Open settings"
        >
          <Settings size={18} />
        </button>
        
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100"
          title="Close chat"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
