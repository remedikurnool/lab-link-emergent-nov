/**
 * Centralized Error Handler
 */

import { AppError, ErrorCode, createErrorFromSupabase } from './api-error';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

/**
 * Handle and process errors consistently
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): AppError {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'An unexpected error occurred',
  } = options;

  let appError: AppError;

  // Convert to AppError if needed
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    // Try to extract Supabase error
    const supabaseError = (error as any).error || error;
    appError = createErrorFromSupabase(supabaseError);
  } else if (typeof error === 'object' && error !== null) {
    appError = createErrorFromSupabase(error);
  } else {
    appError = new AppError(
      ErrorCode.UNKNOWN_ERROR,
      fallbackMessage
    );
  }

  // Log error
  if (logError) {
    console.error('[Error Handler]', {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      stack: appError.stack,
    });
  }

  // Show toast notification (if toast system is available)
  if (showToast && typeof window !== 'undefined') {
    // Import toast hook dynamically to avoid SSR issues
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title: 'Error',
        description: appError.message,
        variant: 'destructive',
      });
    }).catch(() => {
      // Toast system not available, fallback to console
      console.error('Error:', appError.message);
    });
  }

  return appError;
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: ErrorHandlerOptions
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleError(error, options);
      throw appError;
    }
  }) as T;
}

/**
 * Safe async wrapper that returns error instead of throwing
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  fallback?: T
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error, { showToast: false, logError: true });
    return { data: fallback || null, error: appError };
  }
}

