import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

/**
 * Configuration Sentry pour le monitoring des erreurs en production
 * À configurer avec votre DSN Sentry réel
 */
export function initializeSentry() {
  // Initialiser seulement en production ou si DSN est défini
  if (process.env.NODE_ENV === 'production' || process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Profiling
      profilesSampleRate: 1.0,
      integrations: [
        new ProfilingIntegration(),
      ],

      // Filtrer les erreurs sensibles
      beforeSend(event, hint) {
        // Ne pas envoyer les erreurs de validation
        if (event.exception?.values?.[0]?.type === 'ValidationError') {
          return null;
        }

        // Supprimer les données sensibles
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
          }
        }

        return event;
      },

      // Contexte par défaut
      initialScope: {
        tags: {
          service: 'kds-backend-api',
          version: process.env.npm_package_version || '1.0.0',
        },
      },
    });

    console.log('✅ Sentry initialized for error tracking');
  } else {
    console.log('ℹ️  Sentry not initialized (set SENTRY_DSN to enable)');
  }
}

/**
 * Capturer une erreur manuellement
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Ajouter le contexte utilisateur
 */
export function setUserContext(userId: string, email?: string, role?: string) {
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
}

/**
 * Nettoyer le contexte utilisateur (logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Ajouter des breadcrumbs pour tracer les actions
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
