
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook for monitoring browsing capabilities status
 */
export const useBrowsingStatus = () => {
  const [isBrowsingAllowed, setIsBrowsingAllowed] = useState<boolean>(true);
  const [isCORSEnabled, setIsCORSEnabled] = useState<boolean | null>(null);

  // Check if browsing is allowed based on browser features and CORS availability
  useEffect(() => {
    // Basic checks for browsing capabilities
    if (typeof window === 'undefined' || !window.fetch) {
      setIsBrowsingAllowed(false);
      return;
    }

    // Check if CORS is available by trying to fetch a known public CORS-enabled API
    const checkCORS = async () => {
      try {
        const testUrl = 'https://httpbin.org/get';
        const response = await fetch(testUrl, { 
          method: 'GET',
          mode: 'cors'
        });
        
        if (response.ok) {
          setIsCORSEnabled(true);
          setIsBrowsingAllowed(true);
        } else {
          setIsCORSEnabled(false);
          setIsBrowsingAllowed(false);
          console.warn('CORS test failed with status:', response.status);
        }
      } catch (error) {
        console.warn('CORS test failed:', error);
        setIsCORSEnabled(false);
        
        // Still allow browsing, but warn about possible CORS issues
        toast.warning("Some browsing features may be limited due to CORS restrictions.");
        setIsBrowsingAllowed(true); // Still try browsing, we'll handle errors per-request
      }
    };

    checkCORS();
  }, []);

  return { isBrowsingAllowed, isCORSEnabled };
};
