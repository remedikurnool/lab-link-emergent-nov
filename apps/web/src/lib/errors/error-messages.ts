/**
 * User-Friendly Error Messages
 */

import { ErrorCode } from './api-error';

export interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
  recovery?: string;
}

const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  [ErrorCode.AUTH_REQUIRED]: {
    title: 'Authentication Required',
    message: 'Please log in to continue.',
    action: 'Go to Login',
    recovery: 'Your session may have expired. Please log in again.',
  },
  [ErrorCode.AUTH_INVALID]: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
    action: 'Try Again',
    recovery: 'Please check your email and password and try again.',
  },
  [ErrorCode.AUTH_EXPIRED]: {
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    action: 'Log In',
    recovery: 'For security reasons, sessions expire after a period of inactivity.',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    title: 'Invalid Input',
    message: 'Please check the information you entered and try again.',
    action: 'Review Form',
    recovery: 'Some fields may be missing or contain invalid data.',
  },
  [ErrorCode.INVALID_INPUT]: {
    title: 'Invalid Input',
    message: 'The information you provided is not valid.',
    action: 'Check Input',
    recovery: 'Please review your input and ensure all required fields are filled correctly.',
  },
  [ErrorCode.NETWORK_ERROR]: {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection.',
    action: 'Retry',
    recovery: 'Check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.',
  },
  [ErrorCode.TIMEOUT]: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    action: 'Retry',
    recovery: 'The server may be busy. Please wait a moment and try again.',
  },
  [ErrorCode.CONNECTION_ERROR]: {
    title: 'Connection Failed',
    message: 'Failed to connect to the server.',
    action: 'Retry',
    recovery: 'Please check your internet connection and try again.',
  },
  [ErrorCode.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. We are working to fix it.',
    action: 'Retry Later',
    recovery: 'Please try again in a few minutes. If the problem persists, contact support.',
  },
  [ErrorCode.DATABASE_ERROR]: {
    title: 'Database Error',
    message: 'Unable to access data. Please try again.',
    action: 'Retry',
    recovery: 'The database may be temporarily unavailable. Please try again.',
  },
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: {
    title: 'Service Unavailable',
    message: 'An external service is temporarily unavailable.',
    action: 'Retry Later',
    recovery: 'Please try again in a few minutes.',
  },
  [ErrorCode.NOT_FOUND]: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    action: 'Go Back',
    recovery: 'The item you are looking for may have been removed or does not exist.',
  },
  [ErrorCode.ALREADY_EXISTS]: {
    title: 'Already Exists',
    message: 'This item already exists.',
    action: 'Continue',
    recovery: 'The item you are trying to create already exists in the system.',
  },
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: {
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
    action: 'Go Back',
    recovery: 'Please contact an administrator if you believe you should have access.',
  },
  [ErrorCode.PAYMENT_FAILED]: {
    title: 'Payment Failed',
    message: 'Your payment could not be processed. Please try again.',
    action: 'Retry Payment',
    recovery: 'Please check your payment method and try again. If the problem persists, contact your bank.',
  },
  [ErrorCode.BOOKING_FAILED]: {
    title: 'Booking Failed',
    message: 'Unable to complete your booking. Please try again.',
    action: 'Retry Booking',
    recovery: 'There may be a temporary issue. Please try again or contact support.',
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry',
    recovery: 'If the problem persists, please contact support with details about what you were trying to do.',
  },
};

/**
 * Get error message with context
 */
export function getErrorMessageWithContext(
  code: ErrorCode,
  context?: { operation?: string; resource?: string; details?: string }
): ErrorMessage {
  const baseMessage = ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
  
  if (!context) {
    return baseMessage;
  }

  // Customize message based on context
  let message = baseMessage.message;
  
  if (context.operation) {
    message = `${context.operation} failed. ${baseMessage.message}`;
  }
  
  if (context.resource) {
    message = message.replace('resource', context.resource);
  }
  
  if (context.details) {
    message = `${message} ${context.details}`;
  }

  return {
    ...baseMessage,
    message,
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: ErrorCode): ErrorMessage {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Get localized error message (for future i18n support)
 */
export function getLocalizedErrorMessage(
  code: ErrorCode,
  locale: string = 'en'
): ErrorMessage {
  // For now, return English messages
  // In the future, this can load from locale files
  return getErrorMessage(code);
}

