import { AppError, ErrorCode, createErrorFromSupabase } from '../api-error';

describe('AppError', () => {
  it('should create an error with code and message', () => {
    const error = new AppError(ErrorCode.NETWORK_ERROR, 'Network failed');
    expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
    expect(error.message).toBe('Network failed');
    expect(error.retryable).toBe(false);
  });

  it('should create retryable error', () => {
    const error = new AppError(ErrorCode.NETWORK_ERROR, 'Network failed', 500, true);
    expect(error.retryable).toBe(true);
  });

  it('should convert to JSON', () => {
    const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input', 400);
    const json = error.toJSON();
    expect(json.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(json.message).toBe('Invalid input');
    expect(json.statusCode).toBe(400);
    expect(json.timestamp).toBeDefined();
  });
});

describe('createErrorFromSupabase', () => {
  it('should handle network errors', () => {
    const error = createErrorFromSupabase({ message: 'fetch failed' });
    expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
    expect(error.retryable).toBe(true);
  });

  it('should handle authentication errors', () => {
    const error = createErrorFromSupabase({ status: 401, message: 'JWT expired' });
    expect(error.code).toBe(ErrorCode.AUTH_REQUIRED);
  });

  it('should handle not found errors', () => {
    const error = createErrorFromSupabase({ status: 404 });
    expect(error.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('should handle server errors', () => {
    const error = createErrorFromSupabase({ status: 500 });
    expect(error.code).toBe(ErrorCode.SERVER_ERROR);
    expect(error.retryable).toBe(true);
  });

  it('should handle unknown errors', () => {
    const error = createErrorFromSupabase(null);
    expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });
});

