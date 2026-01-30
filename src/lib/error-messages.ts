/**
 * User-Friendly Error Messages
 *
 * Maps technical error codes to user-friendly messages with
 * helpful context and suggested actions.
 */

export interface FriendlyError {
  title: string;
  message: string;
  action?: string;
}

export const USER_FRIENDLY_ERRORS: Record<string, FriendlyError> = {
  // Rate limiting
  RATE_LIMITED: {
    title: 'Slow Down',
    message: 'You\'re making requests too quickly. Please wait a moment.',
    action: 'Try again in a few seconds'
  },

  // Network & Timeout
  TIMEOUT: {
    title: 'Request Timeout',
    message: 'The operation took too long. This might be due to complex code or server load.',
    action: 'Try simplifying your code or retry'
  },
  NETWORK_ERROR: {
    title: 'Connection Issue',
    message: 'Unable to reach the server. Check your internet connection.',
    action: 'Check connection and retry'
  },

  // Authentication & Authorization
  UNAUTHORIZED: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action.',
    action: 'Please refresh the page and try again'
  },
  FORBIDDEN: {
    title: 'Not Allowed',
    message: 'This action is not permitted.',
    action: 'Contact support if you believe this is an error'
  },

  // Workspace errors
  WORKSPACE_NOT_READY: {
    title: 'Workspace Initializing',
    message: 'Your coding environment is still being set up.',
    action: 'Please wait a moment'
  },
  WORKSPACE_NOT_FOUND: {
    title: 'Workspace Not Found',
    message: 'The workspace could not be found. It may have expired.',
    action: 'Refresh the page to create a new workspace'
  },
  WORKSPACE_ERROR: {
    title: 'Workspace Error',
    message: 'Something went wrong with your coding environment.',
    action: 'Try refreshing the page'
  },

  // Code execution errors
  EXECUTION_TIMEOUT: {
    title: 'Execution Timeout',
    message: 'Your code took too long to run. Check for infinite loops.',
    action: 'Review your code for infinite loops or long-running operations'
  },
  EXECUTION_ERROR: {
    title: 'Execution Failed',
    message: 'Your code encountered an error during execution.',
    action: 'Check the error message in the console'
  },

  // AI/Analysis errors
  FIX_GENERATION_FAILED: {
    title: 'Auto-Fix Unavailable',
    message: 'The AI couldn\'t generate a fix for this error. The issue may be too complex.',
    action: 'Try modifying your code manually'
  },
  ANALYSIS_FAILED: {
    title: 'Analysis Failed',
    message: 'Code analysis couldn\'t be completed.',
    action: 'Try again in a moment'
  },
  AI_ERROR: {
    title: 'AI Service Unavailable',
    message: 'The AI service is temporarily unavailable.',
    action: 'Please try again in a few moments'
  },

  // Validation errors
  INVALID_REQUEST: {
    title: 'Invalid Request',
    message: 'The request contained invalid data.',
    action: 'Check your input and try again'
  },
  VALIDATION_ERROR: {
    title: 'Validation Error',
    message: 'Some of the provided data is invalid.',
    action: 'Review the error details and correct your input'
  },
  CODE_TOO_LARGE: {
    title: 'Code Too Large',
    message: 'Your code exceeds the maximum allowed size.',
    action: 'Try reducing the size of your code'
  },

  // Package/dependency errors
  PACKAGE_NOT_FOUND: {
    title: 'Package Not Found',
    message: 'The requested package could not be found.',
    action: 'Check the package name and try again'
  },
  INSTALL_FAILED: {
    title: 'Installation Failed',
    message: 'Failed to install the requested package.',
    action: 'Check your internet connection and try again'
  },

  // File errors
  FILE_NOT_FOUND: {
    title: 'File Not Found',
    message: 'The requested file could not be found.',
    action: 'Check the file path and try again'
  },
  FILE_ERROR: {
    title: 'File Error',
    message: 'An error occurred while accessing the file.',
    action: 'Try again or contact support'
  },

  // TTS errors
  TTS_ERROR: {
    title: 'Voice Unavailable',
    message: 'The text-to-speech service is temporarily unavailable.',
    action: 'Try again in a moment'
  },
  TTS_API_ERROR: {
    title: 'Voice Service Error',
    message: 'Failed to generate speech. The voice service encountered an error.',
    action: 'Try again with shorter text'
  },
  MISSING_TEXT: {
    title: 'No Text Provided',
    message: 'Please provide text to convert to speech.',
    action: 'Enter some text and try again'
  },
  INVALID_TEXT: {
    title: 'Text Too Long',
    message: 'The text exceeds the maximum allowed length.',
    action: 'Try with shorter text'
  },

  // Generic errors
  INTERNAL_ERROR: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Our team has been notified.',
    action: 'Try refreshing the page'
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    action: 'Check the request and try again'
  },
  MISSING_API_KEY: {
    title: 'Configuration Error',
    message: 'The service is not properly configured.',
    action: 'Please contact support'
  }
};

/**
 * Get a user-friendly error message for an error code
 */
export function getUserFriendlyError(code: string, fallbackMessage?: string): FriendlyError {
  const error = USER_FRIENDLY_ERRORS[code];

  if (error) {
    return error;
  }

  // Generate a friendly error from the code if not found
  const formattedCode = code
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());

  return {
    title: 'Error',
    message: fallbackMessage || `An error occurred: ${formattedCode}`,
    action: 'Please try again'
  };
}

/**
 * Create an error response object with friendly message
 */
export function createFriendlyErrorResponse(
  code: string,
  technicalMessage?: string,
  additionalContext?: Record<string, unknown>
): {
  success: false;
  error: string;
  code: string;
  friendlyMessage: FriendlyError;
  technicalDetails?: string;
} & Record<string, unknown> {
  const friendly = getUserFriendlyError(code, technicalMessage);

  return {
    success: false,
    error: friendly.message,
    code,
    friendlyMessage: friendly,
    technicalDetails: process.env.NODE_ENV === 'development' ? technicalMessage : undefined,
    ...additionalContext
  };
}
