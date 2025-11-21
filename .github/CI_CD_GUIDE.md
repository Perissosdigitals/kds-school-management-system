# 🚀 CI/CD Pipeline - GitHub Actions

Ce projet utilise GitHub Actions pour l'intégration continue et le déploiement automatique.

## 📋 Workflows Configurés

### 1. **CI/CD Principal** (`.github/workflows/ci-cd.yml`)

Déclenché sur: `push` et `pull_request` vers `main` et `develop`

**Jobs**:
1. 🧪 **Backend Tests** - Tests unitaires avec Jest + PostgreSQL
2. 🧪 **Frontend Tests** - Build de production
3. 🔍 **Code Quality** - ESLint frontend + backend
4. 🔒 **Security Audit** - npm audit sur les dépendances
5. 🚀 **Deploy Backend** - Cloudflare Workers (main seulement)
6. 🚀 **Deploy Frontend** - Cloudflare Pages (main seulement)
7. 📢 **Notify** - Notification de succès/échec

**Durée estimée**: 5-10 minutes

### 2. **Tests E2E** (`.github/workflows/e2e-tests.yml`)

Déclenché sur:
- `push` vers `main` et `develop`
- `pull_request` vers `main`
- **Quotidien** à 2h UTC (cron)

**Avec**:
- PostgreSQL test database
- Backend NestJS démarré
- Frontend Vite démarré
- Playwright pour tests navigateur

**Durée estimée**: 20-30 minutes

---

## 🔐 Secrets à Configurer

Dans GitHub: **Settings** → **Secrets and variables** → **Actions**

### Secrets Requis:

```bash
# Cloudflare (obligatoire)
CLOUDFLARE_API_TOKEN=xxx

# Monitoring (optionnel mais recommandé)
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
SENTRY_DSN_FRONTEND=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN_BACKEND=https://xxx@xxx.ingest.sentry.io/xxx

# Database Production (si migration auto)
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Comment obtenir CLOUDFLARE_API_TOKEN:

1. Se connecter à [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **My Profile** → **API Tokens**
3. **Create Token** → **Edit Cloudflare Workers**
4. Permissions nécessaires:
   - **Account** → **Cloudflare Workers** → **Edit**
   - **Zone** → **Workers Routes** → **Edit**
   - **Account** → **Cloudflare Pages** → **Edit**
5. Copier le token généré

---

## 📊 Status Badges

Ajouter ces badges dans votre README.md:

```markdown
![CI/CD](https://github.com/Perissosdigitals/kds-school-management-system/actions/workflows/ci-cd.yml/badge.svg)
![E2E Tests](https://github.com/Perissosdigitals/kds-school-management-system/actions/workflows/e2e-tests.yml/badge.svg)
[![codecov](https://codecov.io/gh/Perissosdigitals/kds-school-management-system/branch/main/graph/badge.svg)](https://codecov.io/gh/Perissosdigitals/kds-school-management-system)
```

---

## 🎯 Workflow de Développement

### Feature Development

```bash
# 1. Créer une branche
git checkout -b feature/new-feature

# 2. Développer et commit
git add .
git commit -m "feat: add new feature"

# 3. Push
git push origin feature/new-feature

# 4. Créer Pull Request
# → CI s'exécute automatiquement (tests + lint)
```

### Pull Request Process

1. ✅ Tous les tests doivent passer
2. ✅ Code quality checks OK
3. ✅ Security audit sans critical issues
4. 👀 Review requise (optionnel)
5. ✅ Merge vers `develop`

### Déploiement Production

```bash
# 1. Merge develop → main
git checkout main
git merge develop

# 2. Tag de version
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 3. Push main
git push origin main

# → Déploiement automatique vers Cloudflare! 🚀
```

---

## 🔧 Configuration Locale

### Tester les workflows localement

Installer [act](https://github.com/nektos/act):

```bash
# macOS
brew install act

# Test du workflow CI
act push

# Test d'un job spécifique
act -j backend-tests

# Avec secrets
act -s CLOUDFLARE_API_TOKEN=xxx
```

---

## 📈 Monitoring des Builds

### GitHub Actions Dashboard

**Voir les runs**:
- Aller sur: `https://github.com/Perissosdigitals/kds-school-management-system/actions`
- Cliquer sur un workflow pour voir les détails
- Télécharger les artifacts (coverage, screenshots, etc.)

### Notifications

**Configurer les notifications** (Settings → Notifications):
- ✅ Failed workflows → Email
- ✅ Successful deployments → Email (optionnel)

---

## 🐛 Troubleshooting

### ❌ "CLOUDFLARE_API_TOKEN not found"

**Solution**: Ajouter le secret dans GitHub Settings

### ❌ Tests échouent en CI mais pas localement

**Causes possibles**:
- Versions Node.js différentes
- Variables d'environnement manquantes
- PostgreSQL non démarré

**Fix**:
```bash
# Reproduire l'env CI localement
docker run -d -p 5432:5432 -e POSTGRES_USER=kds_admin -e POSTGRES_PASSWORD=kds_test_password -e POSTGRES_DB=kds_school_test postgres:15

DATABASE_HOST=localhost npm run test
```

### ❌ Déploiement échoue

**Vérifier**:
1. Token Cloudflare valide?
2. `wrangler.toml` correct?
3. Build réussi?

**Logs détaillés**:
```bash
# Voir les logs du job
gh run view --log
```

---

## 🚀 Améliorations Futures

- [ ] **Environnements de staging**
- [ ] **Déploiement progressif (canary)**
- [ ] **Rollback automatique si tests E2E échouent**
- [ ] **Notifications Slack/Discord**
- [ ] **Performance testing (Lighthouse CI)**
- [ ] **Dependency updates automatiques (Renovate)**

---

## 📚 Ressources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cloudflare Workers CI/CD](https://developers.cloudflare.com/workers/ci-cd/)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Jest CI Best Practices](https://jestjs.io/docs/continuous-integration)

---

**Généré le**: 21 novembre 2025  
**Version**: 1.0.0  
**Status**: ✅ CI/CD Pipeline configuré et prêt à utiliser
