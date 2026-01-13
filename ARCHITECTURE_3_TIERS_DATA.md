# Architecture 3-Tiers des Données - KDS School Management System

**Date**: 3 Décembre 2025  
**Status**: ✅ Documenté et Clarifié

---

## 🎯 Vue d'Ensemble

Le système KDS utilise une **architecture 3-tiers** pour la gestion des données, offrant flexibilité, résilience et évolutivité.

```
┌─────────────────────────────────────────────┐
│   Tier 0: Simulation Mode (Frontend Only)  │
│   - Données Mock (src/data/mockData.ts)     │
│   - Fallback automatique (Offline)          │
│   - État: 6 Élèves, 3 Profs, 4 Classes      │
└──────────────────┬──────────────────────────┘
                   │
                   │ (Si Backend connecté)
                   ↓
┌─────────────────────────────────────────────┐
│   Tier 1: PostgreSQL Local (Development)   │
│   - Données fonctionnelles                  │
│   - Développement et tests                  │
│   - Port: 5432                              │
└──────────────────┬──────────────────────────┘
                   │
                   │ Migration Scripts
                   │ (export-to-d1-normalized.ts)
                   ↓
┌─────────────────────────────────────────────┐
│   Tier 2: Cloudflare D1 (Production)       │
│   - Base cloud globalement répliquée        │
│   - Déploiement production                  │
│   - ID: d293f4d0-fb4d-4f99-a45c-783fcd374a6e│
└──────────────────┬──────────────────────────┘
                   │
                   │ Export/Import
                   ↕
┌─────────────────────────────────────────────┐
│   Tier 3: CSV Files (Export/Import/Backup) │
│   - Export complet de la DB                 │
│   - Export par table                        │
│   - Import/Restauration                     │
│   - Versioning des données                  │
└─────────────────────────────────────────────┘
```

---

## 📊 Tier 0: Mode Simulation (Frontend Only)

### Description
Jeu de données statique intégré au Frontend pour le développement UI et le mode hors-ligne.

### Caractéristiques
- **Source**: `src/data/mockData.ts`
- **Activation**: Automatique si le backend est inaccessible (Badge "Mode Simulation").
- **Contenu**:
  - **6 Élèves** (Jean, Aïcha, Moussa, Maria, Aminata, David)
  - **3 Enseignants** (Traoré, Coulibaly, Koné)
  - **4 Classes** (CM2 A, CM1 B, 6ème, CE2)
  - **Données**: Notes, Présences, Finances simulées.

---

## 📊 Tier 1: PostgreSQL Local

### Description
Base de données **locale** pour le développement et les données fonctionnelles.

### Caractéristiques
- **Type**: PostgreSQL 14+
- **Environnement**: Development
- **Port**: 5432 (backend NestJS sur 3002)
- **Usage**: 
  - Développement actif
  - Tests unitaires et E2E
  - Données de travail quotidiennes
  - Prototypage de nouvelles fonctionnalités

### Tables (15 tables)
```
✅ students          → Élèves
✅ teachers          → Enseignants
✅ classes           → Classes
✅ subjects          → Matières
✅ grades            → Notes
✅ attendance        → Présences
✅ users             → Utilisateurs
✅ documents         → Documents
✅ transactions      → Transactions financières
✅ school_events     → Événements scolaires
✅ school_incidents  → Incidents
✅ school_associations → Associations
✅ inventory         → Inventaire
✅ timetable_slots   → Emplois du temps
✅ refresh_tokens    → Tokens de rafraîchissement
```

### Connexion
```typescript
// Backend: backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/kds_school

// Frontend: .env
VITE_API_URL=http://localhost:3002/api/v1
```

---

## ☁️ Tier 2: Cloudflare D1 (Production Cloud)

### Description
Base de données **cloud** globalement distribuée sur l'infrastructure Cloudflare.

### Caractéristiques
- **Type**: Cloudflare D1 (SQLite-based)
- **Environnement**: Production
- **Database ID**: `d293f4d0-fb4d-4f99-a45c-783fcd374a6e`
- **Database Name**: `kds-school-db`
- **Worker URL**: https://kds-backend-api.perissosdigitals.workers.dev
- **Features**:
  - 🌍 Réplication globale automatique
  - ⚡ Latence ultra-faible (edge computing)
  - 💾 Backups automatiques
  - 🔒 Sécurité Cloudflare
  - 📈 Auto-scaling

### Migration depuis PostgreSQL

#### Script Principal
```bash
# Export PostgreSQL → D1 (Schéma normalisé)
npm run export:d1

# Ou directement
tsx scripts/export-to-d1-normalized.ts
```

#### Processus de Migration
1. **Extraction**: Lecture des données PostgreSQL
2. **Transformation**: Normalisation vers schéma D1
3. **Génération SQL**: Création du fichier SQL compatible D1
4. **Import**: Exécution sur Cloudflare D1

```bash
# Étapes détaillées
cd scripts
tsx export-to-d1-normalized.ts          # Génère SQL
wrangler d1 execute kds-school-db \
  --file=../cloudflare-d1-import.sql    # Import vers D1
```

#### Scripts Disponibles
| Script | Description | Usage |
|--------|-------------|-------|
| `export-to-d1-normalized.ts` | Export complet PostgreSQL → SQL D1 | Production ready |
| `import-to-d1-direct.ts` | Import direct avec API Wrangler | Développement |
| `reset-d1-schema.sh` | Réinitialisation schéma D1 | Maintenance |

### État Actuel D1
```
✅ Users: 14 (1 admin + 3 teachers + 10 students)
✅ Teachers: 3
✅ Students: 10
✅ Classes: 3 (CM1-A, CM2-A, 6ème-A)
✅ Subjects: 5
✅ Grades: Sample data
✅ Attendance: Sample data
```

---

## 📊 Tier 3: CSV Export/Import/Backup

### Description
Format **CSV** pour export, import, backup et versioning des données.

### Caractéristiques
- **Type**: CSV (UTF-8 avec BOM)
- **Séparateur**: Virgule (,) ou point-virgule (;)
- **Encodage**: UTF-8
- **Usage**:
  - Export complet de la base
  - Export par table
  - Import/restauration
  - Versioning manuel
  - Backup hors-ligne
  - Migration entre environnements

### Scripts d'Export

#### Export depuis PostgreSQL
```bash
# Export toutes les données
npm run export:csv

# Export table spécifique
npm run export:csv -- --table students

# Export avec filtres
npm run export:csv -- --table grades --year 2024-2025
```

#### Export depuis Cloudflare D1
```bash
# Via Wrangler CLI
wrangler d1 execute kds-school-db \
  --command="SELECT * FROM students" \
  --json > students.json

# Puis conversion JSON → CSV
npm run json-to-csv -- students.json
```

### Scripts d'Import

#### Import vers PostgreSQL
```bash
# Import CSV → PostgreSQL
npm run import:csv -- students.csv

# Import avec validation
npm run import:csv -- students.csv --validate
```

#### Import vers Cloudflare D1
```bash
# Conversion CSV → SQL
npm run csv-to-sql -- students.csv

# Import vers D1
wrangler d1 execute kds-school-db \
  --file=students.sql
```

### Structure CSV Standard

#### Exemple: students.csv
```csv
student_code,first_name,last_name,birth_date,class_id,status
KDS24001,Jean,KOUASSI,2010-05-15,class-cm1-a,active
KDS24002,Marie,KOFFI,2010-08-22,class-cm1-a,active
```

#### Exemple: grades.csv
```csv
student_id,subject_id,grade,coefficient,evaluation_type,academic_year
student-001,subject-math,15.5,2,Devoir Surveillé,2024-2025
student-001,subject-french,14.0,2,Devoir Surveillé,2024-2025
```

---

## 🔄 Flux de Données

### Développement → Production
```bash
# 1. Développement sur PostgreSQL local
npm run dev:backend  # Port 3002
npm run dev          # Frontend port 5174

# 2. Tests et validation
npm run test:e2e

# 3. Migration vers D1
tsx scripts/export-to-d1-normalized.ts
wrangler d1 execute kds-school-db --file=cloudflare-d1-import.sql

# 4. Déploiement
npm run deploy:cloudflare
```

### Backup Régulier
```bash
# Export PostgreSQL → CSV (quotidien)
npm run backup:daily

# Export D1 → CSV (hebdomadaire)
npm run backup:weekly:d1

# Stockage
./backups/
  ├── 2025-12-03-daily-postgres.zip
  ├── 2025-12-01-weekly-d1.zip
  └── ...
```

### Restauration
```bash
# Restaurer depuis CSV
npm run restore:csv -- backups/2025-12-03-daily-postgres.zip

# Restaurer vers D1
npm run restore:d1 -- backups/2025-12-01-weekly-d1.zip
```

---

## 🎯 Cas d'Usage

### Cas 1: Nouvelle Fonctionnalité
```bash
1. Développer sur PostgreSQL local
2. Tester localement
3. Migrer vers D1 staging
4. Tester en production
5. Migrer vers D1 production
```

### Cas 2: Migration de Données
```bash
1. Export PostgreSQL → CSV
2. Validation/Transformation CSV
3. Import CSV → D1
4. Vérification
```

### Cas 3: Backup/Restore
```bash
1. Export automatique quotidien → CSV
2. Stockage sécurisé
3. Restauration si besoin
```

### Cas 4: Synchronisation
```bash
# PostgreSQL → D1 (Production)
npm run sync:postgres-to-d1

# D1 → PostgreSQL (Récupération)
npm run sync:d1-to-postgres
```

---

## 📁 Structure des Fichiers

### Scripts de Migration
```
scripts/
├── export-to-d1-normalized.ts    ← PostgreSQL → D1 SQL
├── import-to-d1-direct.ts        ← Import direct via Wrangler
├── export-to-csv.ts              ← PostgreSQL → CSV
├── import-from-csv.ts            ← CSV → PostgreSQL
├── reset-d1-schema.sh            ← Reset D1 schema
└── fix-postgres-students.ts      ← Correction données PostgreSQL
```

### Fichiers SQL Générés
```
./
├── cloudflare-d1-schema.sql          ← Schéma D1
├── cloudflare-d1-import.sql          ← Données à importer
├── cloudflare-d1-schema-normalized.sql
└── db-export-data.sql                ← Export PostgreSQL
```

### Exports CSV
```
exports/
├── students-2025-12-03.csv
├── teachers-2025-12-03.csv
├── grades-2025-12-03.csv
└── full-backup-2025-12-03.zip
```

---

## 🛠️ Configuration

### Backend (NestJS + PostgreSQL)
```typescript
// backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/kds_school
PORT=3002
NODE_ENV=development
```

### Backend (Hono + D1)
```toml
# backend-cloudflare/wrangler.toml
name = "kds-backend-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "kds-school-db"
database_id = "d293f4d0-fb4d-4f99-a45c-783fcd374a6e"
```

### Frontend
```bash
# .env.development (PostgreSQL local)
VITE_API_URL=http://localhost:3002/api/v1

# .env.production (Cloudflare D1)
VITE_API_URL=https://kds-backend-api.perissosdigitals.workers.dev/api/v1
```

---

## ✅ Avantages de l'Architecture 3-Tiers

### Flexibilité
- ✅ Développement local rapide (PostgreSQL)
- ✅ Production globale scalable (D1)
- ✅ Backup/Restore facile (CSV)

### Résilience
- ✅ Données sauvegardées à 3 niveaux
- ✅ Récupération rapide en cas de problème
- ✅ Versioning manuel/automatique

### Performance
- ✅ PostgreSQL: Full features, transactions complexes
- ✅ D1: Edge computing, latence minimale
- ✅ CSV: Portabilité maximale

### Coût
- ✅ PostgreSQL: Local, gratuit
- ✅ D1: Cloudflare Free Tier (100k reads/day)
- ✅ CSV: Stockage minimal

---

## 📝 Commandes Rapides

```bash
# Développement
npm run dev              # Frontend
npm run dev:backend      # Backend PostgreSQL

# Migration
npm run export:d1        # PostgreSQL → D1
npm run export:csv       # PostgreSQL → CSV

# Backup
npm run backup:daily     # Backup automatique

# Déploiement
npm run deploy:cloudflare # Deploy to production

# Maintenance
npm run reset:d1         # Reset D1 schema
npm run sync:postgres-to-d1  # Sync data
```

---

## 🎓 Pour les Développeurs

### Ajouter une Nouvelle Table

#### 1. PostgreSQL (backend/src/entities)
```typescript
@Entity('new_table')
export class NewTable {
  @PrimaryKey()
  id: string;
  
  @Column()
  name: string;
}
```

#### 2. Cloudflare D1 (cloudflare-d1-schema.sql)
```sql
CREATE TABLE IF NOT EXISTS new_table (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
```

#### 3. Script de Migration (export-to-d1-normalized.ts)
```typescript
// Ajouter dans la fonction main()
const newTableData = await getNewTableData();
sqlContent += generateNewTableInserts(newTableData);
```

#### 4. Test
```bash
npm run export:d1
wrangler d1 execute kds-school-db --file=cloudflare-d1-import.sql
```

---

## 🔮 Évolutions Futures

### Phase 1: Automatisation (Q1 2025)
- [ ] Cron jobs pour backup automatique
- [ ] Sync bidirectionnel PostgreSQL ↔ D1
- [ ] Validation automatique des migrations

### Phase 2: UI Admin (Q2 2025)
- [ ] Interface graphique pour migrations
- [ ] Visualisation des différences entre bases
- [ ] Export/Import depuis UI

### Phase 3: Analytics (Q3 2025)
- [ ] Tracking des modifications
- [ ] Audit trail complet
- [ ] Data lineage visualization

---

## 🆘 Support

### PostgreSQL ne démarre pas
```bash
# Vérifier status
pg_ctl status

# Démarrer
pg_ctl start

# Logs
tail -f /usr/local/var/postgres/server.log
```

### Cloudflare D1 inaccessible
```bash
# Vérifier auth
wrangler whoami

# Login
wrangler login

# Tester connexion
wrangler d1 execute kds-school-db --command="SELECT 1"
```

### Export CSV échoue
```bash
# Vérifier connexion PostgreSQL
psql -d kds_school -c "SELECT 1"

# Vérifier permissions
ls -la exports/

# Créer dossier si nécessaire
mkdir -p exports
chmod 755 exports
```

---

**Status**: ✅ Architecture 3-Tiers Opérationnelle  
**Documentation**: Complète et à jour  
**Prochaine étape**: Automatisation des migrations

**Berakhot!** 🙏
