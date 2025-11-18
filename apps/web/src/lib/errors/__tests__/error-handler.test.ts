import { handleError, withErrorHandling, safeAsync } from '../error-handler';
import { AppError, ErrorCode } from '../api-error';

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('handleError', () => {
    it('should handle AppError instance', () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR, 'Network failed');
      const result = handleError(error);

      expect(result).toBe(error);
      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('should convert Error to AppError', () => {
      const error = new Error('Something went wrong');
      const result = handleError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toContain('Something went wrong');
    });

    it('should handle unknown error types', () => {
      const error = { message: 'Unknown error' };
      const result = handleError(error);

      expect(result).toBeInstanceOf(AppError);
    });

    it('should use fallback message for unknown errors', () => {
      const error = null;
      const result = handleError(error, { fallbackMessage: 'Custom error' });

      expect(result.message).toBe('Custom error');
    });

    it('should log errors by default', () => {
      const error = new Error('Test error');
      handleError(error);

      expect(console.error).toHaveBeenCalled();
    });

    it('should not log when logError is false', () => {
      const error = new Error('Test error');
      handleError(error, { logError: false });

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('withErrorHandling', () => {
    it('should wrap async function', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const wrapped = withErrorHandling(fn);

      const result = await wrapped();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalled();
    });

    it('should handle errors in wrapped function', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Test error'));
      const wrapped = withErrorHandling(fn);

      await expect(wrapped()).rejects.toThrow();
    });

    it('should pass through options', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Test error'));
      const wrapped = withErrorHandling(fn, { logError: false });

      await expect(wrapped()).rejects.toThrow();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('safeAsync', () => {
    it('should return data on success', async () => {
      const promise = Promise.resolve('success');
      const result = await safeAsync(promise);

      expect(result.data).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should return error on failure', async () => {
      const promise = Promise.reject(new Error('Test error'));
      const result = await safeAsync(promise);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(AppError);
    });

    it('should use fallback value', async () => {
      const promise = Promise.reject(new Error('Test error'));
      const result = await safeAsync(promise, 'fallback');

      expect(result.data).toBe('fallback');
      expect(result.error).toBeInstanceOf(AppError);
    });
  });
});

