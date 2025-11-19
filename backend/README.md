# 🏫 KDS School Management System - Backend

[![NestJS](https://img.shields.io/badge/NestJS-10.3.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

Backend API complet pour le système de gestion scolaire KDS, construit avec NestJS en architecture monorepo.

## 🎯 Vue d'ensemble

Le backend KDS est une API REST moderne, scalable et sécurisée qui gère toutes les opérations du système scolaire :
- 👥 Gestion des utilisateurs et authentification JWT
- 🎓 Gestion des élèves, enseignants et classes
- 📊 Système de notes et évaluations
- 📅 Emploi du temps et présences
- 📄 Documents élèves avec historique
- 💰 Transactions financières
- 🔄 Import/Export de données en masse
- 📈 Analytics et rapports

## 📁 Structure du Projet

```
backend/
├── 📁 packages/              # Modules partagés
│   ├── core/                 # Types, utils, constantes
│   ├── auth/                 # Authentification
│   ├── academy/              # Modules académiques
│   ├── planning/             # Planning et présences
│   ├── finance/              # Gestion financière
│   ├── analytics/            # Analytics
│   └── import-export/        # Import/Export
├── 📁 apps/                  # Applications
│   ├── api-gateway/          # Point d'entrée API
│   ├── queue-worker/         # Tâches background
│   └── realtime/             # WebSockets
├── 📁 shared/                # Ressources partagées
│   ├── database/             # Schémas SQL, migrations
│   ├── storage/              # Configuration S3
│   └── cache/                # Configuration Redis
└── 📁 infrastructure/        # Docker, K8s, monitoring
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (recommandé)
- PostgreSQL 15+ (si sans Docker)
- Redis 7+ (si sans Docker)

### Installation

1. **Cloner le dépôt et naviguer vers le backend**

\`\`\`bash
cd backend
\`\`\`

2. **Installer les dépendances**

\`\`\`bash
npm install
\`\`\`

3. **Configurer les variables d'environnement**

\`\`\`bash
cp .env.example .env
\`\`\`

Éditez le fichier `.env` avec vos configurations :
- Clés JWT
- Identifiants PostgreSQL
- Configuration Redis
- Origines CORS

4. **Démarrer avec Docker (Recommandé)**

\`\`\`bash
# Lancer tous les services (PostgreSQL, Redis, API Gateway, Workers)
npm run docker:up

# Voir les logs
npm run docker:logs

# Arrêter les services
npm run docker:down
\`\`\`

5. **Ou démarrer en développement local**

\`\`\`bash
# S'assurer que PostgreSQL et Redis tournent localement
# Puis lancer l'API Gateway
npm run dev

# Dans un autre terminal, lancer le worker (optionnel)
npm run dev:worker
\`\`\`

6. **Initialiser la base de données**

\`\`\`bash
# Exécuter les migrations
npm run migration:run

# (Optionnel) Remplir avec des données de test
npm run db:seed
\`\`\`

## 📚 Documentation API

Une fois l'application lancée, la documentation Swagger est disponible à :

**http://localhost:3001/api/docs**

La documentation interactive permet de :
- Explorer tous les endpoints
- Tester les requêtes directement
- Voir les schémas de données
- Consulter les exemples

## 🔧 Scripts Disponibles

### Développement

\`\`\`bash
npm run dev              # Lance l'API Gateway en mode watch
npm run dev:gateway      # Lance l'API Gateway
npm run dev:worker       # Lance le worker de queue
npm run dev:realtime     # Lance le serveur WebSocket
\`\`\`

### Build & Production

\`\`\`bash
npm run build            # Build tous les workspaces
npm run build:gateway    # Build uniquement l'API Gateway
npm start                # Lance en mode production
npm run start:gateway    # Lance l'API Gateway en prod
npm run start:worker     # Lance le worker en prod
\`\`\`

### Base de données

\`\`\`bash
npm run migration:generate  # Génère une nouvelle migration
npm run migration:run       # Exécute les migrations
npm run migration:revert    # Annule la dernière migration
npm run db:seed            # Remplit la base avec des données
\`\`\`

### Docker

\`\`\`bash
npm run docker:up       # Démarre tous les containers
npm run docker:down     # Arrête tous les containers
npm run docker:logs     # Affiche les logs en temps réel
\`\`\`

### Tests & Qualité

\`\`\`bash
npm run test            # Lance les tests unitaires
npm run test:watch      # Tests en mode watch
npm run test:cov        # Tests avec couverture
npm run lint            # Linter le code
npm run format          # Formater le code avec Prettier
\`\`\`

## 🗃️ Schéma de Base de Données

### Tables Principales

- **users** : Utilisateurs et authentification
- **students** : Informations élèves
- **teachers** : Informations enseignants
- **classes** : Classes scolaires
- **subjects** : Matières
- **grades** : Notes et évaluations
- **grade_categories** : Catégories de notes (contrôle, examen...)
- **timetable_slots** : Créneaux d'emploi du temps
- **attendance** : Présences/absences
- **student_documents** : Documents avec historique
- **import_batches** : Lots d'importation
- **financial_transactions** : Transactions financières
- **audit_logs** : Journal d'audit

Le schéma SQL complet est disponible dans `shared/database/schema.sql`.

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Obtenir un token

\`\`\`bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@kds.com",
  "password": "your_password"
}
\`\`\`

Réponse :

\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@kds.com",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "KDS"
  }
}
\`\`\`

### Utiliser le token

Ajoutez le token à l'en-tête `Authorization` de vos requêtes :

\`\`\`bash
GET /api/v1/students
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## 📊 Endpoints Principaux

### 🔐 Auth
- `POST /auth/login` - Connexion utilisateur

### 👥 Students
- `GET /students` - Liste des élèves
- `GET /students/:id` - Détails d'un élève
- `POST /students` - Créer un élève
- `POST /students/bulk` - Créer plusieurs élèves
- `PUT /students/:id` - Modifier un élève
- `DELETE /students/:id` - Supprimer un élève

### 👨‍🏫 Teachers
- `GET /teachers` - Liste des enseignants
- `GET /teachers/:id` - Détails d'un enseignant

### 🏫 Classes
- `GET /classes` - Liste des classes
- `GET /classes/:id` - Détails d'une classe

### 📊 Grades
- `GET /grades` - Liste des notes
- `POST /grades/bulk-upsert` - Créer/Modifier des notes en masse

### 📅 Timetable
- `GET /timetable` - Emploi du temps
- `PUT /timetable/:id` - Modifier un créneau

### ✅ Attendance
- `GET /attendance` - Présences
- `POST /attendance/bulk` - Enregistrer des présences en masse

### 📄 Documents
- `GET /documents` - Documents élèves

### 💰 Finance
- `GET /finance` - Transactions financières

### 🔄 Import
- `POST /import/batches` - Créer un lot d'import
- `GET /import/batches` - Liste des lots
- `POST /import/batches/:id/approve` - Approuver un lot
- `GET /import/batches/:id/preview` - Prévisualiser un lot

### 📈 Analytics
- `GET /analytics/dashboard` - Dashboard overview

## 🐳 Architecture Docker

Le projet utilise Docker Compose pour orchestrer :

- **postgres** : Base de données PostgreSQL 15
- **redis** : Cache et queues Redis 7
- **api-gateway** : API REST principale (port 3001)
- **queue-worker** : Worker pour tâches background
- **realtime** : Serveur WebSockets (port 3002)
- **pgadmin** : Interface de gestion PostgreSQL (port 5050, optionnel)

## 🔄 Import/Export de Données

Le système supporte l'import et l'export massif de données via CSV :

### Import

1. Créer un lot d'import avec un fichier CSV
2. Le système valide les données
3. Prévisualiser les modifications
4. Approuver le lot
5. Le worker traite l'import en arrière-plan

### Export

Les exports sont disponibles via les endpoints analytics avec différents formats (CSV, Excel, PDF).

## 🚀 Déploiement

### Production avec Docker

\`\`\`bash
# Build les images
docker-compose build

# Lancer en production
docker-compose up -d
\`\`\`

### Variables d'Environnement Production

Assurez-vous de définir en production :
- `NODE_ENV=production`
- `JWT_SECRET` (clé forte)
- `DATABASE_PASSWORD` (mot de passe fort)
- `REDIS_PASSWORD`
- `CORS_ORIGINS` (domaines autorisés)
- `DATABASE_SSL=true`

## 🔒 Sécurité

- ✅ JWT avec expiration
- ✅ Bcrypt pour les mots de passe
- ✅ Helmet pour headers HTTP
- ✅ CORS configuré
- ✅ Rate limiting
- ✅ Validation des données (class-validator)
- ✅ SQL injection protection (TypeORM)
- ✅ Audit logs

## 📈 Monitoring

Le backend intègre :
- Logs structurés (Winston)
- Health checks (`/health`)
- Métriques (Prometheus-ready)
- Tracing distribué

## 🤝 Contribution

Pour contribuer au backend :

1. Créer une branche feature
2. Développer et tester
3. Linter et formater le code
4. Soumettre une PR

## 📝 License

Propriétaire - KDS School Management System

---

**Développé avec ❤️ pour KDS** | [Documentation Complète](http://localhost:3001/api/docs)
