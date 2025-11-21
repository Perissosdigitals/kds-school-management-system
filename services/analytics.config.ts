/**
 * Configuration Google Analytics 4 (GA4)
 * Tracking des événements et comportement utilisateur
 * 
 * Pour activer GA4:
 * 1. Créer une propriété GA4 sur analytics.google.com
 * 2. Copier le Measurement ID (G-XXXXXXXXXX)
 * 3. Ajouter dans .env.production:
 *    VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
 */

// Types d'événements personnalisés
export enum GAEventCategory {
  USER = 'user',
  STUDENT = 'student',
  TEACHER = 'teacher',
  CLASS = 'class',
  GRADE = 'grade',
  ATTENDANCE = 'attendance',
  FINANCE = 'finance',
  NAVIGATION = 'navigation',
}

export enum GAEventAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  LOGIN = 'login',
  LOGOUT = 'logout',
  SEARCH = 'search',
  FILTER = 'filter',
}

interface GAEvent {
  category: GAEventCategory;
  action: GAEventAction;
  label?: string;
  value?: number;
  [key: string]: any;
}

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const IS_PRODUCTION = import.meta.env.MODE === 'production';

/**
 * Initialiser Google Analytics
 */
export function initializeGA() {
  if (!GA4_MEASUREMENT_ID) {
    if (IS_PRODUCTION) {
      console.warn('⚠️  GA4_MEASUREMENT_ID non défini en production');
    } else {
      console.log('ℹ️  Google Analytics non configuré (définir VITE_GA4_MEASUREMENT_ID)');
    }
    return;
  }

  // Charger le script GA4
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialiser gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false, // Gérer manuellement
    cookie_flags: 'SameSite=None;Secure', // RGPD
  });

  // Exposer gtag globalement
  (window as any).gtag = gtag;

  console.log('✅ Google Analytics initialisé');
}

/**
 * Tracker une page vue
 */
export function trackPageView(path: string, title?: string) {
  if (!GA4_MEASUREMENT_ID || typeof window === 'undefined') return;

  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

/**
 * Tracker un événement personnalisé
 */
export function trackEvent(event: GAEvent) {
  if (!GA4_MEASUREMENT_ID || typeof window === 'undefined') return;

  const gtag = (window as any).gtag;
  if (gtag) {
    const { category, action, label, value, ...params } = event;
    
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });

    // Log en développement
    if (!IS_PRODUCTION) {
      console.log('📊 GA Event:', event);
    }
  }
}

/**
 * Tracker une connexion
 */
export function trackLogin(method: string, userId?: string) {
  trackEvent({
    category: GAEventCategory.USER,
    action: GAEventAction.LOGIN,
    label: method,
    user_id: userId,
  });
}

/**
 * Tracker une déconnexion
 */
export function trackLogout(userId?: string) {
  trackEvent({
    category: GAEventCategory.USER,
    action: GAEventAction.LOGOUT,
    user_id: userId,
  });
}

/**
 * Tracker une recherche
 */
export function trackSearch(searchTerm: string, resultCount?: number) {
  trackEvent({
    category: GAEventCategory.NAVIGATION,
    action: GAEventAction.SEARCH,
    label: searchTerm,
    value: resultCount,
  });
}

/**
 * Tracker une création d'entité
 */
export function trackCreate(entityType: string, entityId?: string) {
  trackEvent({
    category: entityType as GAEventCategory,
    action: GAEventAction.CREATE,
    label: entityId,
  });
}

/**
 * Tracker une mise à jour
 */
export function trackUpdate(entityType: string, entityId?: string) {
  trackEvent({
    category: entityType as GAEventCategory,
    action: GAEventAction.UPDATE,
    label: entityId,
  });
}

/**
 * Tracker une suppression
 */
export function trackDelete(entityType: string, entityId?: string) {
  trackEvent({
    category: entityType as GAEventCategory,
    action: GAEventAction.DELETE,
    label: entityId,
  });
}

/**
 * Tracker une vue de détail
 */
export function trackView(entityType: string, entityId?: string) {
  trackEvent({
    category: entityType as GAEventCategory,
    action: GAEventAction.VIEW,
    label: entityId,
  });
}

/**
 * Tracker un export
 */
export function trackExport(exportType: string, format: string, recordCount?: number) {
  trackEvent({
    category: exportType as GAEventCategory,
    action: GAEventAction.EXPORT,
    label: format,
    value: recordCount,
  });
}

/**
 * Définir l'utilisateur actuel (RGPD compliant)
 */
export function setUserProperties(userId: string, role?: string) {
  if (!GA4_MEASUREMENT_ID || typeof window === 'undefined') return;

  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('config', GA4_MEASUREMENT_ID, {
      user_id: userId,
      user_properties: {
        role: role,
      },
    });
  }
}

/**
 * Opt-out GA (RGPD)
 */
export function optOutGA() {
  if (GA4_MEASUREMENT_ID) {
    (window as any)[`ga-disable-${GA4_MEASUREMENT_ID}`] = true;
    console.log('🔒 Google Analytics désactivé');
  }
}

/**
 * Opt-in GA (RGPD)
 */
export function optInGA() {
  if (GA4_MEASUREMENT_ID) {
    (window as any)[`ga-disable-${GA4_MEASUREMENT_ID}`] = false;
    console.log('✅ Google Analytics activé');
  }
}

// Déclarer les types globaux
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}
