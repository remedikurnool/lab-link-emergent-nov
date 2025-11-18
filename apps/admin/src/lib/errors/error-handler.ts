export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export function handleError(
  error: any,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'An error occurred',
  } = options;

  if (logError) {
    console.error('Error handled:', error);
  }

  // In a real app, you might want to send errors to a logging service
  // For now, we'll just log to console

  if (showToast) {
    // You can implement toast notifications here
    // For now, we'll just log the error message
    console.warn('Error:', error?.message || fallbackMessage);
  }
}

export function isSupabaseError(error: any): error is { code: string; message: string } {
  return error && typeof error.code === 'string' && typeof error.message === 'string';
}

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (isSupabaseError(error)) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
