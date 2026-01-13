import { useState, useEffect } from 'react';
import { httpClient } from '../services/httpClient';

export const useDataSourceStatus = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try a lightweight call to check connectivity
        // We use a timeout of 2000ms to fail fast
        await httpClient.get('/health', { timeout: 2000 });
        setIsOffline(false);
      } catch (error: any) {
        // If it's a network error or timeout, we are offline
        if (!error.response || error.code === 'ECONNABORTED') {
          setIsOffline(true);
        } else {
          // If we get a 404 or 500, the server is reachable but maybe the endpoint is missing
          // We consider this "online" but with errors, unless it's a 503 Service Unavailable
          setIsOffline(error.response?.status === 503);
        }
      } finally {
        setChecking(false);
      }
    };

    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isOffline, checking };
};
