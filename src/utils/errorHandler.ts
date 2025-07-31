/**
 * Error handling utilities for the application
 */

export interface ErrorInfo {
  message: string;
  type: 'validation' | 'authentication' | 'network' | 'server' | 'unknown';
  code?: string | number;
  suggestions?: string[];
}

/**
 * Parse and categorize errors from API responses
 */
export function parseError(error: any): ErrorInfo {
  // Network/Connection errors
  if (!error.response) {
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection.',
        type: 'network',
        suggestions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Contact support if the problem persists'
        ]
      };
    }
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: 'Connection timed out. Please try again.',
        type: 'network',
        suggestions: [
          'Check your internet connection',
          'Try again with a better connection',
          'The server might be busy, please wait a moment'
        ]
      };
    }
    
    return {
      message: error.message || 'An unexpected error occurred',
      type: 'unknown'
    };
  }

  const status = error.response.status;
  const data = error.response.data;
  const message = data?.message || data?.error || 'An error occurred';

  // Handle validation errors specifically (400 with errors array)
  if (status === 400 && data?.errors && Array.isArray(data.errors)) {
    const validationErrors = data.errors.map((err: any) => 
      `${err.field}: ${err.message}`
    ).join(', ');
    
    return {
      message: `Validation failed: ${validationErrors}`,
      type: 'validation',
      code: status,
      suggestions: [
        'Please check the highlighted fields',
        'Make sure all required information is provided',
        'Verify the format of phone numbers and other fields'
      ]
    };
  }

  // Authentication errors (401)
  if (status === 401) {
    if (message.toLowerCase().includes('invalid credentials')) {
      return {
        message: 'Incorrect phone number or password. Please try again.',
        type: 'authentication',
        code: status,
        suggestions: [
          'Double-check your phone number format',
          'Make sure your password is correct',
          'Try resetting your password if you\'ve forgotten it'
        ]
      };
    }
    
    if (message.toLowerCase().includes('token') || message.toLowerCase().includes('expired')) {
      return {
        message: 'Your session has expired. Please log in again.',
        type: 'authentication',
        code: status,
        suggestions: [
          'Please log in again',
          'Your session may have timed out for security'
        ]
      };
    }
    
    return {
      message: 'Authentication failed. Please log in again.',
      type: 'authentication',
      code: status
    };
  }

  // Validation errors (400)
  if (status === 400) {
    if (message.toLowerCase().includes('phone number')) {
      return {
        message: 'Invalid phone number format. Please check and try again.',
        type: 'validation',
        code: status,
        suggestions: [
          'Include your country code (e.g., +234 for Nigeria)',
          'Remove any extra spaces or characters',
          'Example: +2348123456789'
        ]
      };
    }
    
    if (message.toLowerCase().includes('password')) {
      return {
        message: 'Password requirements not met. Please check your password.',
        type: 'validation',
        code: status,
        suggestions: [
          'Password must be at least 8 characters long',
          'Include both letters and numbers',
          'Check for any special character requirements'
        ]
      };
    }
    
    if (message.toLowerCase().includes('already exists')) {
      return {
        message: message, // Use the specific message from server
        type: 'validation',
        code: status,
        suggestions: [
          'Try logging in instead of registering',
          'Use a different phone number or email',
          'Contact support if you believe this is an error'
        ]
      };
    }
    
    return {
      message: message,
      type: 'validation',
      code: status
    };
  }

  // Server errors (500+)
  if (status >= 500) {
    return {
      message: 'Our servers are experiencing issues. Please try again later.',
      type: 'server',
      code: status,
      suggestions: [
        'Please try again in a few minutes',
        'The issue is on our end, not yours',
        'Contact support if the problem persists'
      ]
    };
  }

  // Rate limiting (429)
  if (status === 429) {
    return {
      message: 'Too many attempts. Please wait a moment before trying again.',
      type: 'validation',
      code: status,
      suggestions: [
        'Wait a few minutes before trying again',
        'This is a security measure to protect your account'
      ]
    };
  }

  // Not found (404)
  if (status === 404) {
    return {
      message: 'The requested resource was not found.',
      type: 'server',
      code: status,
      suggestions: [
        'Please try again',
        'Contact support if the problem persists'
      ]
    };
  }

  // Forbidden (403)
  if (status === 403) {
    return {
      message: 'You don\'t have permission to perform this action.',
      type: 'authentication',
      code: status,
      suggestions: [
        'Make sure you\'re logged in',
        'Check if your account has the necessary permissions',
        'Contact support if you believe this is an error'
      ]
    };
  }

  // Default case
  return {
    message: message,
    type: 'unknown',
    code: status
  };
}

/**
 * Format error message for display
 */
export function formatErrorMessage(errorInfo: ErrorInfo): string {
  return errorInfo.message;
}

/**
 * Get user-friendly suggestions for an error
 */
export function getErrorSuggestions(errorInfo: ErrorInfo): string[] {
  return errorInfo.suggestions || [];
}

/**
 * Check if error requires immediate action (like re-login)
 */
export function requiresImmediateAction(errorInfo: ErrorInfo): boolean {
  return errorInfo.type === 'authentication' && 
         (errorInfo.message.includes('session') || errorInfo.message.includes('expired'));
}

/**
 * Check if error is recoverable by user action
 */
export function isRecoverableError(errorInfo: ErrorInfo): boolean {
  return errorInfo.type === 'validation' || errorInfo.type === 'authentication';
}

/**
 * Get appropriate retry delay based on error type
 */
export function getRetryDelay(errorInfo: ErrorInfo): number {
  switch (errorInfo.type) {
    case 'network':
      return 2000; // 2 seconds
    case 'server':
      return 5000; // 5 seconds
    case 'authentication':
      return 1000; // 1 second
    default:
      return 1000; // 1 second
  }
}
