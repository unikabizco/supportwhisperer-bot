
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook for monitoring network status
 */
export const useNetworkStatus = (isOpen: boolean) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isOpen) {
        toast.success("You're back online!");
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      if (isOpen) {
        toast.error("You're currently offline. Some features may be unavailable.");
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOpen]);

  return isOnline;
};
