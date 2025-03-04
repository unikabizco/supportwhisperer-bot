
/**
 * Automated responses for common customer inquiries
 * Helps reduce API usage and improve response time
 */

// Map of common question patterns to automated responses
const AUTOMATED_RESPONSES = {
  shipping: {
    patterns: ['shipping', 'delivery', 'when will i receive', 'how long does shipping take'],
    response: "Standard shipping typically takes 3-5 business days within the continental US. Express shipping (1-2 business days) is available for an additional fee. International shipping times vary by destination. You can check your order status anytime in your account dashboard."
  },
  returns: {
    patterns: ['return policy', 'can i return', 'how to return', 'refund'],
    response: "We offer a 30-day return policy for most products. To initiate a return, please visit your order history in your account, select the item you wish to return, and follow the return instructions. Once we receive your return, refunds typically process within 5-7 business days."
  },
  warranty: {
    patterns: ['warranty', 'guarantee', 'broken', 'not working', 'defective'],
    response: "Most of our electronics come with a 1-year manufacturer warranty covering defects in materials and workmanship. Premium products may include extended warranty options. For warranty service, please have your order number ready and contact our technical support team through your account or by replying to this message with more details about the issue."
  },
  account: {
    patterns: ['create account', 'login', 'sign in', 'password reset', 'forgot password'],
    response: "You can manage your account by clicking on the Account icon in the top right corner of our website. From there, you can create a new account, sign in, or reset your password. If you're having trouble accessing your account, please click the 'Forgot Password' link on the login page."
  },
  contact: {
    patterns: ['speak to human', 'talk to agent', 'customer service phone', 'contact'],
    response: "Our customer service team is available Monday through Friday, 9am-6pm EST. You can reach us by phone at 1-800-555-0123, by email at support@example.com, or through live chat on our website during business hours. For urgent issues outside business hours, please leave a message and we'll get back to you within 24 hours."
  }
};

/**
 * Attempts to find an automated response based on message content
 * @param messageContent The user message content
 * @returns An appropriate automated response or null if none matches
 */
export const getAutomatedResponse = (messageContent: string): string | null => {
  const normalizedMessage = messageContent.toLowerCase().trim();
  
  // Look for exact matches first (e.g., "what is your return policy?")
  for (const [category, data] of Object.entries(AUTOMATED_RESPONSES)) {
    for (const pattern of data.patterns) {
      if (normalizedMessage.includes(pattern)) {
        console.log(`Automated response triggered for category: ${category}`);
        return data.response;
      }
    }
  }
  
  return null;
};

/**
 * Categorizes a user message by its likely intent
 * @param messageContent The user message content
 * @returns The detected category or null if uncertain
 */
export const detectMessageIntent = (messageContent: string): string | null => {
  const normalizedMessage = messageContent.toLowerCase().trim();
  
  for (const [category, data] of Object.entries(AUTOMATED_RESPONSES)) {
    for (const pattern of data.patterns) {
      if (normalizedMessage.includes(pattern)) {
        return category;
      }
    }
  }
  
  return null;
};
