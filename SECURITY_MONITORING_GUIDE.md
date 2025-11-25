# 🔒 Guide de Configuration - Sécurité & Monitoring

## 📋 Table des Matières
1. [Bcrypt & Hashing](#bcrypt)
2. [Refresh Tokens](#refresh-tokens)
3. [Rate Limiting](#rate-limiting)
4. [Sentry Error Tracking](#sentry)
5. [Google Analytics](#google-analytics)
6. [Uptime Monitoring](#uptime-monitoring)

---

## 🔐 1. Bcrypt & Hashing

### ✅ Implémentation Complète

**Backend**: ✅ Bcrypt déjà installé et configuré

**Services créés**:
- `backend/apps/api-gateway/src/modules/auth/hashing.service.ts`

**Méthodes disponibles**:
```typescript
await hashingService.hashPassword('password123');
await hashingService.comparePassword('password123', hash);
hashingService.isValidHash(hash);
hashingService.generateTemporaryPassword(12);
```

**Usage dans AuthService**:
```typescript
// Lors de la création d'utilisateur
const hashedPassword = await hashingService.hashPassword(dto.password);

// Lors du login
const isValid = await hashingService.comparePassword(password, user.passwordHash);
```

---

## 🔄 2. Refresh Tokens

### ✅ Implémentation Complète

**Entity créée**: `RefreshToken`
- Token cryptographique sécurisé (128 caractères)
- Expiration: 7 jours
- Rotation automatique
- Révocation possible
- Tracking IP + User Agent

**Endpoints**:
```bash
POST /api/v1/auth/login
→ Retourne { access_token, refresh_token, expires_in, user }

POST /api/v1/auth/refresh
Body: { refresh_token: "xxx" }
→ Retourne nouveau access_token + nouveau refresh_token

POST /api/v1/auth/logout
Body: { refresh_token: "xxx" }
→ Révoque le token

POST /api/v1/auth/logout-all
Header: Authorization: Bearer <access_token>
→ Révoque tous les tokens de l'utilisateur
```

**Migration nécessaire**:
```bash
cd backend
# Créer la migration pour la table refresh_tokens
npm run migration:generate -- RefreshTokens
npm run migration:run
```

**Table SQL**:
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP,
  replaced_by_token UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id, is_revoked);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

**Frontend - Stockage sécurisé**:
```typescript
// services/api/auth.service.ts
localStorage.setItem('kds_token', response.access_token);
localStorage.setItem('kds_refresh_token', response.refresh_token);

// Intercepteur axios pour auto-refresh
httpClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('kds_refresh_token');
      const { data } = await axios.post('/auth/refresh', { refresh_token: refreshToken });
      localStorage.setItem('kds_token', data.access_token);
      localStorage.setItem('kds_refresh_token', data.refresh_token);
      // Retry original request
      return httpClient.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 🚦 3. Rate Limiting

### ✅ Implémentation Complète

**Configuration globale**: 60 requêtes/minute
**Login endpoint**: 5 tentatives/minute (protection brute force)

**Réponse en cas de limite**:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**Personnaliser les limites**:
```typescript
// Pour un endpoint spécifique
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
@Post('heavy-operation')
async operation() { }

// Désactiver le rate limiting
@SkipThrottle()
@Get('public')
async public() { }
```

**Headers de réponse**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1234567890
```

---

## 🐛 4. Sentry Error Tracking

### Configuration Backend

**Fichier**: `backend/apps/api-gateway/src/sentry.config.ts`

**Étapes d'activation**:

1. **Créer un compte Sentry**:
   - https://sentry.io
   - Créer un nouveau projet "Node.js"
   - Copier le DSN

2. **Configurer l'environnement**:
```bash
# backend/.env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NODE_ENV=production
```

3. **Redémarrer le backend**:
```bash
cd backend
npm run start:dev
```

**Utilisation**:
```typescript
import { captureError, setUserContext, addBreadcrumb } from './sentry.config';

// Capturer une erreur
try {
  await riskyOperation();
} catch (error) {
  captureError(error, { operation: 'riskyOperation', userId: user.id });
}

// Définir le contexte utilisateur
setUserContext(user.id, user.email, user.role);

// Ajouter un breadcrumb
addBreadcrumb('User clicked button', 'ui', { buttonId: 'submit' });
```

### Configuration Frontend

**Fichier**: `services/sentry.config.ts`

**Installation** (quand prêt):
```bash
npm install @sentry/react
```

**Décommenter le code** dans `sentry.config.ts` après installation

**Usage dans App.tsx**:
```typescript
import { SentryErrorBoundary, initializeSentry } from './services/sentry.config';

initializeSentry();

function App() {
  return (
    <SentryErrorBoundary fallback={<ErrorPage />}>
      <Router>
        {/* App content */}
      </Router>
    </SentryErrorBoundary>
  );
}
```

---

## 📊 5. Google Analytics

### Configuration

**Fichier**: `services/analytics.config.ts`

**Étapes d'activation**:

1. **Créer une propriété GA4**:
   - https://analytics.google.com
   - Admin → Créer une propriété → GA4
   - Copier le Measurement ID (G-XXXXXXXXXX)

2. **Configurer l'environnement**:
```bash
# .env.production
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. **Initialiser dans App.tsx**:
```typescript
import { initializeGA } from './services/analytics.config';
import { usePageTracking } from './hooks/usePageTracking';

function App() {
  useEffect(() => {
    initializeGA();
  }, []);
  
  usePageTracking(); // Track page views automatiquement
  
  return <Router>{/* ... */}</Router>;
}
```

### Événements Personnalisés

```typescript
import { 
  trackLogin, 
  trackCreate, 
  trackView, 
  trackExport 
} from './services/analytics.config';

// Login
trackLogin('email', user.id);

// Création d'élève
trackCreate('student', newStudent.id);

// Vue de classe
trackView('class', classId);

// Export CSV
trackExport('students', 'csv', 143);
```

### RGPD - Opt-in/Opt-out

```typescript
import { optInGA, optOutGA } from './services/analytics.config';

// Consentement utilisateur
if (userAcceptedCookies) {
  optInGA();
} else {
  optOutGA();
}
```

---

## ⏰ 6. Uptime Monitoring

### Endpoints Health Check

**Créés**:
- `GET /health` - Simple check (200 = OK)
- `GET /health/detailed` - Statut complet (API + DB + Memory)
- `GET /health/ready` - Readiness probe (Kubernetes)
- `GET /health/live` - Liveness probe (Kubernetes)

### Configuration UptimeRobot (Gratuit)

1. **Créer un compte**: https://uptimerobot.com

2. **Ajouter un monitor**:
   - Type: HTTP(s)
   - URL: `https://kds-backend-api.perissosdigitals.workers.dev/health`
   - Nom: "KSP Backend API"
   - Interval: 5 minutes
   - Alert Contacts: Votre email

3. **Ajouter un second monitor** (Frontend):
   - URL: `https://2a143417.kds-school-management.pages.dev`
   - Nom: "KSP Frontend"

4. **Configurer les alertes**:
   - Email immédiat si down
   - Alerte après 2 échecs consécutifs
   - Notification de récupération

### Configuration BetterUptime (Alternative Premium)

1. **Créer un compte**: https://betteruptime.com

2. **Créer un Heartbeat**:
```bash
# Backend cron job (toutes les 5 minutes)
*/5 * * * * curl https://kds-backend-api.perissosdigitals.workers.dev/health
```

3. **Créer des Status Pages**:
   - Page publique: https://status.kds-school.com
   - Affiche l'uptime des services

### Cloudflare Analytics (Inclus)

**Frontend Cloudflare Pages**:
- Dashboard → Analytics
- Métriques automatiques:
  - Requêtes par seconde
  - Temps de réponse
  - Erreurs 4xx/5xx
  - Bande passante

**Backend Cloudflare Workers**:
- Dashboard → Analytics & Logs
- Métriques temps réel:
  - Invocations
  - Erreurs
  - CPU time
  - Durée d'exécution

---

## 📋 Checklist de Production

### Avant le Déploiement

- [ ] Migrer la table `refresh_tokens`
- [ ] Définir `JWT_SECRET` sécurisé (32+ caractères aléatoires)
- [ ] Configurer `SENTRY_DSN` (backend + frontend)
- [ ] Configurer `VITE_GA4_MEASUREMENT_ID`
- [ ] Activer HTTPS strict
- [ ] Configurer CORS avec domaines spécifiques
- [ ] Tester les endpoints de health check
- [ ] Configurer UptimeRobot ou équivalent
- [ ] Ajouter une page de consentement cookies (RGPD)

### Après le Déploiement

- [ ] Vérifier que Sentry capture les erreurs
- [ ] Vérifier que GA4 reçoit les événements
- [ ] Confirmer les alertes uptime fonctionnent
- [ ] Tester le refresh token (simuler expiration)
- [ ] Tester le rate limiting (5+ login attempts)
- [ ] Surveiller les métriques Cloudflare

---

## 🔐 Variables d'Environnement

### Backend (.env)
```bash
# JWT
JWT_SECRET=<générer avec: openssl rand -hex 32>
JWT_EXPIRES_IN=24h

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=kds_school_db
DATABASE_USER=kds_admin
DATABASE_PASSWORD=<secure_password>

# Monitoring
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NODE_ENV=production

# CORS
CORS_ORIGINS=https://kds-school.pages.dev,https://2a143417.kds-school-management.pages.dev
```

### Frontend (.env.production)
```bash
# API
VITE_API_URL=https://kds-backend-api.perissosdigitals.workers.dev/api/v1

# Monitoring
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# App
VITE_APP_VERSION=1.0.0
```

---

## 🚀 Commandes Utiles

```bash
# Backend - Démarrer avec Sentry
cd backend
NODE_ENV=production SENTRY_DSN=xxx npm run start

# Créer la migration refresh_tokens
npm run migration:generate -- RefreshTokens
npm run migration:run

# Frontend - Build production avec analytics
npm run build
VITE_GA4_MEASUREMENT_ID=G-XXX npm run build

# Tester les health checks
curl http://localhost:3001/health
curl http://localhost:3001/health/detailed | jq

# Tester le rate limiting (login)
for i in {1..6}; do curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@kds.ci","password":"wrong"}'; done
```

---

**Généré le**: 21 novembre 2025  
**Version**: 1.0.0  
**Status**: ✅ Implémentation complète Bcrypt + Refresh Tokens + Rate Limiting + Health Checks
