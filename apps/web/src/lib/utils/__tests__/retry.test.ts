import { retry, retryWithBackoff } from '../retry';

describe('retry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('success');

    const promise = retry(fn, {
      maxAttempts: 3,
      delay: 1000,
      retryable: () => true,
    });

    // Fast-forward timers
    jest.advanceTimersByTime(1000);

    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should fail after max attempts', async () => {
    const error = new Error('Persistent error');
    const fn = jest.fn().mockRejectedValue(error);

    const promise = retry(fn, {
      maxAttempts: 3,
      delay: 1000,
      retryable: () => true,
    });

    jest.advanceTimersByTime(3000);

    await expect(promise).rejects.toThrow('Persistent error');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry non-retryable errors', async () => {
    const error = new Error('Validation error');
    const fn = jest.fn().mockRejectedValue(error);

    const promise = retry(fn, {
      maxAttempts: 3,
      retryable: () => false,
    });

    await expect(promise).rejects.toThrow('Validation error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use exponential backoff', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce('success');

    const promise = retry(fn, {
      maxAttempts: 3,
      delay: 1000,
      backoff: 'exponential',
      retryable: () => true,
    });

    // First retry after 1s (1000ms)
    jest.advanceTimersByTime(1000);
    // Second retry after 2s (2000ms)
    jest.advanceTimersByTime(2000);

    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should use exponential backoff by default', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValueOnce('success');

    const promise = retryWithBackoff(fn, 2);

    jest.advanceTimersByTime(1000);

    const result = await promise;
    expect(result).toBe('success');
  });
});

