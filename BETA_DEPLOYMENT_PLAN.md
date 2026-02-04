# Plan de Déploiement Beta 1.0 ("Shalom Release")

## 📅 Chronologie de Déploiement

### Jour 0 : Création de la Release (Aujourd'hui)
- [x] Création scripts d'automatisation
- [x] Mise à jour des métadonnées (package.json, version.json)
- [x] Génération du Changelog
- [ ] Création du tag git `v1.0.0-beta.1`
- [ ] Push vers le dépôt central

### Jour 1 : Déploiement Production
- [ ] Backup base de données Cloudflare D1 existante
- [ ] Build final frontend et backend
- [ ] Déploiement Backend Workers (`npm run deploy:backend`)
- [ ] Migration base de données D1 (`npm run db:migrate:prod`)
- [ ] Déploiement Frontend Pages (`npm run deploy:frontend`)
- [ ] Smoke test en production

### Jours 2-7 : Période Beta
- [ ] **Monitoring Intensif**:
  - Taux d'erreur API (objectif < 0.1%)
  - Temps de réponse (objectif < 300ms)
  - Synchronisation R2 (fichiers manquants 0%)
- [ ] **Feedback Utilisateurs Pilotes**:
  - Collecte quotidienne des retours via channel dédié
  - Sessions de shadowing avec 2 utilisateurs clés
- [ ] **Corrections**:
  - Hotfixes autorisés uniquement pour bugs critiques (P0)

### Jour 8 : Décision Go/No-Go
- [ ] Revue des métriques de stabilité
- [ ] Validation des fonctionnalités critiques
- [ ] Décision de passage en "Stable" v1.0.0

## 🛡️ Plan de Rollback

En cas d'incident critique sur la Beta :
1. **Frontend**: Revert immédiat via Cloudflare Pages (Version précédente)
2. **Backend**: `wrangler rollback` vers la version précédente
3. **Database**: Restauration du snapshot D1 J-1

## 📊 Critères de Succès Beta

1. **Stabilité Techniques**:
   - 0 Crash Backend
   - Temps de chargement Dashboard < 1.5s
2. **Fonctionnel**:
   - 100% des inscriptions élèves fonctionnent
   - 100% des prises de présence sauvegardées
3. **Adoption**:
   - Validation par le Directeur des Études
