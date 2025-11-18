'use client';

import { useEffect, useState } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  connectionType?: string;
}

/**
 * Hook to monitor network status
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [connectionType, setConnectionType] = useState<string | undefined>();

  useEffect(() => {
    // Set initial state
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      // Get connection type if available
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type);
      }
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Reset wasOffline after a delay
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };

    // Listen for connection changes
    const handleConnectionChange = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type);
        // Consider slow connections as offline for critical operations
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setIsOnline(false);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return { isOnline, wasOffline, connectionType };
}

