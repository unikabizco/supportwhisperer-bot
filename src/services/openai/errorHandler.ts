
/**
 * Error handling for OpenAI API interactions
 * @module services/openai/errorHandler
 */
import { toast } from "sonner";
import { chatContextManager, ChatMessage } from "../chat";

/**
 * Handles errors from OpenAI API and returns appropriate user-facing messages
 * @param error - Error object from API call
 * @returns User-friendly error message
 */
export function handleError(error: unknown): string {
  console.error('Error calling OpenAI API:', error);
  
  // Extract the error message to add to context
  let errorMessage = "I'm sorry, I encountered an error processing your request. Please try again later.";
  
  // Provide more specific error message based on error type
  if (error instanceof Error) {
    if (error.message === 'offline' || 
        error.message.includes('NetworkError') || 
        error.message.includes('network')) {
      errorMessage = "It looks like you're currently offline. Please check your internet connection and try again when you're back online.";
      toast.error("Network error when connecting to OpenAI. Please check your internet connection.");
    } else if (error.message === 'timeout') {
      errorMessage = "I'm sorry, but the request timed out. Our AI service might be experiencing high traffic. Please try again in a few moments.";
      toast.error("Request timed out. The OpenAI service might be experiencing high traffic.");
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      errorMessage = "I'm having trouble connecting to my knowledge base due to network issues. Please check your internet connection and try again in a moment. If the problem persists, our servers might be experiencing issues.";
      toast.error("Network error when connecting to OpenAI. Please check your internet connection.");
    } else if (error.message.includes('429')) {
      errorMessage = "I've reached my rate limit. Please wait a moment before sending another message.";
      toast.error("Rate limit exceeded. Please try again in a few moments.");
    } else if (error.message.includes('401')) {
      errorMessage = "There seems to be an issue with my authentication. Please check your API key in settings.";
      toast.error("Authentication failed. Please check your API key.");
    }
  }
  
  // Add error message to chat context
  const assistantErrorMessage: ChatMessage = {
    role: 'assistant',
    content: errorMessage,
    timestamp: Date.now()
  };
  
  chatContextManager.addMessage(assistantErrorMessage);
  
  return errorMessage;
}
