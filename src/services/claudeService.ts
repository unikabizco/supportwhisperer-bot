
/**
 * Claude AI API service for handling chat interactions
 * @module services/claudeService
 */
import { toast } from "sonner";

// Type definitions for Claude API
interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  temperature?: number;
  system?: string;
}

interface ClaudeResponse {
  content: Array<{
    text: string;
    type: string;
  }>;
  id: string;
  model: string;
  role: string;
  type: string;
}

// Claude system prompt with e-commerce product knowledge
const SYSTEM_PROMPT = `You are a helpful, friendly customer support assistant for an e-commerce platform specializing in consumer electronics.

Your responsibilities include:
- Providing product recommendations based on customer specifications
- Troubleshooting common device setup issues
- Processing order status and return requests
- Answering account-related questions

Keep responses concise, professional yet warm. Ask clarifying questions when needed. 
If a customer seems frustrated or has a complex technical issue, acknowledge it and offer to connect them with a human agent.
Maintain our brand voice: helpful, knowledgeable, and friendly.

You have knowledge about our product catalog, common troubleshooting steps, return policy, and account management.
For questions about specific order details, explain that you'll need order numbers to look up specific information.`;

// Service to handle Claude AI interactions
export const claudeService = {
  /**
   * Sends a message to Claude AI and returns the response
   * @param messages - Array of message objects with role and content
   * @returns Promise with Claude's response text
   */
  async sendMessage(messages: ClaudeMessage[]): Promise<string> {
    // For development, check if API key exists in local storage
    const apiKey = localStorage.getItem('claude_api_key');
    
    if (!apiKey) {
      toast.error("Claude API key not found. Please add your API key in settings.");
      return "I'm unable to process your request at the moment. Please check that a Claude API key has been configured.";
    }

    try {
      const request: ClaudeRequest = {
        model: "claude-3-sonnet-20240229", // Using Claude 3 Sonnet model
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        system: SYSTEM_PROMPT
      };

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Claude API error:', errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json() as ClaudeResponse;
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      toast.error("Failed to get response from Claude AI");
      return "I'm sorry, I encountered an error processing your request. Please try again later.";
    }
  }
};
