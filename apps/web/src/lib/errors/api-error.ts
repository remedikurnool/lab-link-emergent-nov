/**
 * Standardized API Error Types
 */

export enum ErrorCode {
  // Authentication Errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID = 'AUTH_INVALID',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Server Errors
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Business Logic Errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  BOOKING_FAILED = 'BOOKING_FAILED',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;
  statusCode?: number;
  retryable?: boolean;
  timestamp?: string;
}

export class AppError extends Error {
  code: ErrorCode;
  statusCode?: number;
  retryable: boolean;
  details?: any;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode?: number,
    retryable: boolean = false,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
      retryable: this.retryable,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Create error from Supabase error
 */
export function createErrorFromSupabase(error: any): AppError {
  if (!error) {
    return new AppError(ErrorCode.UNKNOWN_ERROR, 'An unknown error occurred');
  }

  // Network/connection errors
  if (error.message?.includes('fetch') || 
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      error.code === 'NETWORK_ERROR' ||
      error.name === 'NetworkError') {
    return new AppError(
      ErrorCode.NETWORK_ERROR,
      'Network error. Please check your internet connection and try again.',
      undefined,
      true
    );
  }

  // Timeout errors
  if (error.message?.includes('timeout') || 
      error.message?.includes('Timeout') ||
      error.code === 'TIMEOUT') {
    return new AppError(
      ErrorCode.TIMEOUT,
      'Request timed out. Please try again.',
      undefined,
      true
    );
  }

  // Authentication errors
  if (error.status === 401 || error.message?.includes('JWT') || error.message?.includes('auth')) {
    return new AppError(
      ErrorCode.AUTH_REQUIRED,
      'Authentication required. Please log in again.',
      401
    );
  }

  // Not found errors
  if (error.status === 404 || error.code === 'PGRST116') {
    return new AppError(
      ErrorCode.NOT_FOUND,
      'The requested resource was not found.',
      404
    );
  }

  // Validation errors
  if (error.status === 400 || error.code?.startsWith('PGRST')) {
    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      error.message || 'Invalid request. Please check your input.',
      400
    );
  }

  // Permission errors
  if (error.status === 403 || 
      error.message?.includes('permission') || 
      error.message?.includes('policy') ||
      error.code === '42501') {
    return new AppError(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      'You do not have permission to perform this action.',
      403
    );
  }

  // Payment-specific errors
  if (error.message?.includes('payment') || 
      error.message?.includes('Payment') ||
      error.code?.includes('PAYMENT')) {
    return new AppError(
      ErrorCode.PAYMENT_FAILED,
      error.message || 'Payment processing failed. Please try again or use a different payment method.',
      error.status,
      true
    );
  }

  // Booking-specific errors
  if (error.message?.includes('booking') || 
      error.message?.includes('Booking') ||
      error.code?.includes('BOOKING')) {
    return new AppError(
      ErrorCode.BOOKING_FAILED,
      error.message || 'Unable to complete booking. Please try again.',
      error.status,
      true
    );
  }

  // Server errors
  if (error.status >= 500) {
    return new AppError(
      ErrorCode.SERVER_ERROR,
      'Server error. Please try again later.',
      error.status,
      true
    );
  }

  // Default
  return new AppError(
    ErrorCode.UNKNOWN_ERROR,
    error.message || 'An error occurred',
    error.status
  );
}

