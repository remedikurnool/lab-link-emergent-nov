/**
 * Retry Logic for Transient Failures
 */

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  retryable?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
  retryable: (error: any) => {
    // Retry on network errors, timeouts, and 5xx errors
    if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') {
      return true;
    }
    if (error?.statusCode >= 500) {
      return true;
    }
    if (error?.status >= 500) {
      return true;
    }
    if (error?.retryable === true) {
      return true;
    }
    // Supabase connection errors
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      return true;
    }
    return false;
  },
};

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      if (!opts.retryable(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        throw error;
      }

      // Calculate delay
      const delay = opts.backoff === 'exponential'
        ? opts.delay * Math.pow(2, attempt - 1)
        : opts.delay * attempt;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      console.log(`[Retry] Attempt ${attempt + 1}/${opts.maxAttempts} after ${delay}ms`);
    }
  }

  throw lastError;
}

/**
 * Retry with exponential backoff (convenience function)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  return retry(fn, {
    maxAttempts,
    backoff: 'exponential',
  });
}

