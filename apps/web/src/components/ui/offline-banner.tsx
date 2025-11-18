'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff, Wifi, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    } else if (wasOffline) {
      // Show "back online" message briefly
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [isOnline, wasOffline]);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isOnline
          ? 'bg-green-600 text-white'
          : 'bg-orange-600 text-white'
      } px-4 py-2 text-center text-sm font-medium shadow-lg transition-all duration-300`}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>You're back online!</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may not be available.</span>
          </>
        )}
      </div>
    </div>
  );
}

