
/**
 * Error handling for Claude API interactions
 * @module services/claude/errorHandler
 */
import { toast } from "sonner";

/**
 * Handles errors from Claude API and returns appropriate user-facing messages
 * @param error - Error object from API call
 * @returns User-friendly error message
 */
export function handleError(error: unknown): string {
  console.error('Error calling Claude API:', error);
  
  // Provide more specific error message based on error type
  if (error instanceof Error) {
    if (error.message === 'offline') {
      toast.error("You are currently offline. Please check your internet connection.");
      return "It looks like you're currently offline. Please check your internet connection and try again when you're back online.";
    } else if (error.message === 'timeout') {
      toast.error("Request timed out. The Claude AI service might be experiencing high traffic.");
      return "I'm sorry, but the request timed out. Our AI service might be experiencing high traffic. Please try again in a few moments.";
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      toast.error("Network error when connecting to Claude AI. Please check your internet connection.");
      return "I'm having trouble connecting to my knowledge base due to network issues. Please check your internet connection and try again in a moment. If the problem persists, our servers might be experiencing issues.";
    } else if (error.message.includes('429')) {
      toast.error("Rate limit exceeded. Please try again in a few moments.");
      return "I've reached my rate limit. Please wait a moment before sending another message.";
    } else if (error.message.includes('401')) {
      toast.error("Authentication failed. Please check your API key.");
      return "There seems to be an issue with my authentication. Please check your API key in settings.";
    }
  }
  
  // Generic error message as fallback
  toast.error("Failed to get response from Claude AI");
  return "I'm sorry, I encountered an error processing your request. Please try again later.";
}
