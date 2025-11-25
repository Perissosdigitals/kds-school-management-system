# 🎓 KSP School Management System

Système de gestion scolaire complet avec frontend React et backend NestJS.

## 🌍 Environnements

Ce projet supporte **deux environnements distincts**:

### 🔧 Local (Développement)
- **Frontend**: Vite Dev Server (http://localhost:5173)
- **Backend**: NestJS (http://localhost:3001)
- **Database**: PostgreSQL (localhost:5432)

### 🚀 Cloudflare (Production/Test Client)
- **Frontend**: Cloudflare Pages
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 + R2

📖 **Documentation complète**: [ENVIRONMENT_SEPARATION_GUIDE.md](./ENVIRONMENT_SEPARATION_GUIDE.md)

---

## 🚀 Démarrage Rapide (Local)

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation

```bash
# 1. Cloner le projet
git clone <repo-url>
cd kds-school-management-system

# 2. Installer les dépendances
npm install
cd backend && npm install && cd ..

# 3. Configurer l'environnement local
./switch-to-local.sh

# 4. Configurer PostgreSQL
# Créer la base de données
createdb kds_school

# 5. Démarrer l'environnement complet
./start-local.sh
```

L'application sera accessible sur **http://localhost:5173**

### Scripts Disponibles

```bash
# 🔧 Développement Local
./start-local.sh              # Démarre backend + frontend + watchdog
./stop-local.sh               # Arrête tous les services
./check-environment.sh        # Vérifie la configuration actuelle

# 🚀 Déploiement Cloudflare
./prepare-cloudflare-deploy.sh  # Prépare et déploie sur Cloudflare
./switch-to-local.sh           # Revient en mode développement local

# 📦 Commandes npm
npm run dev                    # Frontend uniquement (Vite)
npm run build                  # Build de production
npm run preview                # Prévisualiser le build

cd backend
npm run start:dev              # Backend uniquement (NestJS)
```
