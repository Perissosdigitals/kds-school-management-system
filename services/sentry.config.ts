/**
 * Configuration Sentry pour le Frontend React
 * Monitoring des erreurs et performance en production
 * 
 * Pour activer Sentry:
 * 1. Créer un compte sur sentry.io
 * 2. Créer un nouveau projet React
 * 3. Copier le DSN dans .env.production:
 *    VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
 */

// Désactiver temporairement l'import Sentry jusqu'à l'installation
// import * as Sentry from '@sentry/react';

interface SentryConfig {
  dsn?: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

const config: SentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE || 'development',
  
  // Performance monitoring: 10% en production, 100% en dev
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  
  // Session replay: 10% des sessions
  replaysSessionSampleRate: 0.1,
  
  // Session replay: 100% des erreurs
  replaysOnErrorSampleRate: 1.0,
};

/**
 * Initialiser Sentry
 */
export function initializeSentry() {
  // Ne pas activer en développement sans DSN
  if (!config.dsn && config.environment !== 'production') {
    console.log('ℹ️  Sentry non configuré (définir VITE_SENTRY_DSN pour activer)');
    return;
  }

  /* Décommenter après npm install @sentry/react
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    
    integrations: [
      new Sentry.BrowserTracing({
        // Tracer les navigations
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        ),
      }),
      new Sentry.Replay({
        // Masquer les éléments sensibles
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    tracesSampleRate: config.tracesSampleRate,
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,

    // Filtrer les erreurs non pertinentes
    beforeSend(event, hint) {
      // Ignorer les erreurs réseau en développement
      if (config.environment !== 'production' && 
          event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }

      // Masquer les données sensibles
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers['authorization'];
        }
      }

      return event;
    },

    // Tags par défaut
    initialScope: {
      tags: {
        service: 'kds-frontend',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      },
    },
  });

  console.log('✅ Sentry initialisé pour le monitoring');
  */
}

/**
 * Capturer une erreur manuellement
 */
export function captureError(error: Error, context?: Record<string, any>) {
  console.error('Error captured:', error, context);
  
  /* Décommenter après installation
  Sentry.captureException(error, {
    extra: context,
  });
  */
}

/**
 * Définir le contexte utilisateur
 */
export function setUserContext(userId: string, email?: string, role?: string) {
  /* Décommenter après installation
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
  */
}

/**
 * Nettoyer le contexte utilisateur
 */
export function clearUserContext() {
  /* Décommenter après installation
  Sentry.setUser(null);
  */
}

/**
 * Ajouter un breadcrumb pour tracer les actions
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  /* Décommenter après installation
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
  */
}

/**
 * ErrorBoundary React pour Sentry
 * Usage: <SentryErrorBoundary fallback={<ErrorFallback />}><App /></SentryErrorBoundary>
 */
/* Décommenter après installation
export const SentryErrorBoundary = Sentry.ErrorBoundary;
*/

export const SentryErrorBoundary = ({ children }: { children: React.ReactNode }) => children;
