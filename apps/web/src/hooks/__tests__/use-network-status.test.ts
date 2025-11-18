import { renderHook, waitFor } from '@testing-library/react';
import { useNetworkStatus } from '../use-network-status';

// Mock navigator.onLine
const mockNavigator = {
  onLine: true,
  connection: undefined,
};

beforeEach(() => {
  Object.defineProperty(window, 'navigator', {
    writable: true,
    value: mockNavigator,
  });
  
  // Reset to online
  mockNavigator.onLine = true;
});

describe('useNetworkStatus', () => {
  it('should return online status when navigator.onLine is true', () => {
    mockNavigator.onLine = true;
    
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('should return offline status when navigator.onLine is false', () => {
    mockNavigator.onLine = false;
    
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.isOnline).toBe(false);
  });

  it('should detect connection type when available', () => {
    const mockConnection = {
      effectiveType: '4g',
      type: 'cellular',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: mockConnection,
    });
    
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.connectionType).toBe('4g');
  });

  it('should handle online event', async () => {
    mockNavigator.onLine = false;
    
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.isOnline).toBe(false);
    
    // Simulate going online
    mockNavigator.onLine = true;
    window.dispatchEvent(new Event('online'));
    
    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });
  });

  it('should handle offline event', async () => {
    mockNavigator.onLine = true;
    
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.isOnline).toBe(true);
    
    // Simulate going offline
    mockNavigator.onLine = false;
    window.dispatchEvent(new Event('offline'));
    
    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });
  });
});

