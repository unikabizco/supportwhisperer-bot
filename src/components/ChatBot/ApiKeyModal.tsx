
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [activeTab, setActiveTab] = useState('claude');
  const [selectedProvider, setSelectedProvider] = useState(localStorage.getItem('selected_ai_provider') || 'claude');

  useEffect(() => {
    const savedClaudeKey = localStorage.getItem('claude_api_key');
    const savedOpenAIKey = localStorage.getItem('openai_api_key');
    const savedProvider = localStorage.getItem('selected_ai_provider');
    
    if (savedClaudeKey) {
      setClaudeApiKey(savedClaudeKey);
    }
    
    if (savedOpenAIKey) {
      setOpenaiApiKey(savedOpenAIKey);
    }
    
    if (savedProvider) {
      setSelectedProvider(savedProvider);
      setActiveTab(savedProvider);
    }
  }, [isOpen]);

  const handleSave = () => {
    let isValid = true;
    
    // Save the selected provider
    localStorage.setItem('selected_ai_provider', selectedProvider);
    
    // Validate and save API keys based on selected provider
    if (selectedProvider === 'claude' || selectedProvider === 'both') {
      if (claudeApiKey.trim()) {
        localStorage.setItem('claude_api_key', claudeApiKey.trim());
      } else {
        isValid = false;
        toast.error("Please enter a valid Claude API key");
      }
    }
    
    if (selectedProvider === 'openai' || selectedProvider === 'both') {
      if (openaiApiKey.trim()) {
        localStorage.setItem('openai_api_key', openaiApiKey.trim());
      } else {
        isValid = false;
        toast.error("Please enter a valid OpenAI API key");
      }
    }
    
    if (isValid) {
      toast.success("AI provider settings saved successfully");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Provider Configuration</DialogTitle>
          <DialogDescription>
            Configure your AI provider to enable the chatbot functionality.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="aiProvider" className="text-right col-span-1">
              AI Provider
            </Label>
            <select
              id="aiProvider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="col-span-3 p-2 border rounded"
            >
              <option value="claude">Claude AI (Anthropic)</option>
              <option value="openai">OpenAI</option>
              <option value="both">Both (Fallback)</option>
            </select>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="claude">Claude AI</TabsTrigger>
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
            </TabsList>
            
            <TabsContent value="claude" className="mt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="claudeApiKey" className="text-right col-span-1">
                  API Key
                </Label>
                <Input
                  id="claudeApiKey"
                  type="password"
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  placeholder="Enter your Claude API key"
                  className="col-span-3"
                  disabled={selectedProvider === 'openai'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Anthropic Console</a>
              </p>
            </TabsContent>
            
            <TabsContent value="openai" className="mt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="openaiApiKey" className="text-right col-span-1">
                  API Key
                </Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="col-span-3"
                  disabled={selectedProvider === 'claude'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI Dashboard</a>
              </p>
            </TabsContent>
          </Tabs>
          
          <div className="col-span-4 text-xs text-gray-500 mt-2">
            Your API keys are stored locally in your browser and are never sent to our servers.
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
