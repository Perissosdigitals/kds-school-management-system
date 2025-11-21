import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analytics.config';

/**
 * Hook React pour tracker automatiquement les changements de page
 * Usage: Ajouter usePageTracking() dans App.tsx
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
}
