import React, { useState, useEffect } from 'react';
import { X, Settings, Trash2, Wifi, WifiOff, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatHeaderProps {
  onClose: () => void;
  onShowSettings: () => void;
  onClearConversation: () => void;
  isOnline: boolean;
  useAutomation: boolean;
  onToggleAutomation: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onShowSettings,
  onClearConversation,
  isOnline,
  useAutomation,
  onToggleAutomation
}) => {
  const [aiProvider, setAiProvider] = useState<string>('claude');
  
  useEffect(() => {
    const storedProvider = localStorage.getItem('selected_ai_provider');
    if (storedProvider) {
      setAiProvider(storedProvider);
    }
  }, []);
  
  const getProviderLabel = () => {
    switch (aiProvider) {
      case 'claude':
        return 'Claude AI';
      case 'openai':
        return 'OpenAI';
      case 'both':
        return 'Claude + OpenAI (Fallback)';
      default:
        return 'AI';
    }
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white/90 rounded-t-2xl shadow-sm">
      <div className="flex items-center">
        <Bot className="mr-2 h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">
          Customer Support
        </h3>
      </div>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                <span className="mr-1">{getProviderLabel()}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current AI provider</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>{isOnline ? 'Online' : 'Offline'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Switch 
                  id="automation" 
                  checked={useAutomation} 
                  onCheckedChange={onToggleAutomation}
                  className="mr-1 h-4 w-8" 
                />
                <Label htmlFor="automation" className="text-xs cursor-pointer">Auto</Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle automated responses</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onClearConversation}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear conversation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onShowSettings}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ChatHeader;
