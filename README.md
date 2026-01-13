# 🎓 KSP School Management System

Système de gestion scolaire complet avec frontend React et backend NestJS.

## 🌍 Modes de Fonctionnement

Ce projet est conçu pour être résilient et fonctionner dans plusieurs contextes :

### 1. 🔧 Mode Complet (Recommandé)
- **Frontend**: Vite Dev Server (http://localhost:5173)
- **Backend**: NestJS (http://localhost:3002)
- **Database**: PostgreSQL (via Docker ou Local)
- **Fonctionnalités**: Toutes les fonctionnalités actives, persistance des données.

### 2. 📡 Mode Simulation (Offline / Démo)
- **Frontend**: Vite Dev Server (http://localhost:5173)
- **Backend**: Déconnecté ou non requis
- **Database**: Données simulées en mémoire (`mockData.ts`)
- **Usage**: Idéal pour les démos, le développement UI, ou en cas de panne réseau/serveur.
- **Activation**: Automatique si le backend est inaccessible.

### 3. 🚀 Cloudflare (Production)
- **Frontend**: Cloudflare Pages
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 + R2

📖 **Documentation complète**: [ENVIRONMENT_SEPARATION_GUIDE.md](./ENVIRONMENT_SEPARATION_GUIDE.md)
📖 **Guide de Cohérence des Données**: [DATA_CONSISTENCY.md](./DATA_CONSISTENCY.md)

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Docker Desktop (pour le mode Complet avec Base de Données)

### Installation Initiale

```bash
# 1. Cloner le projet
git clone <repo-url>
cd kds-school-management-system

# 2. Installer les dépendances (Frontend & Backend)
npm install
cd backend && npm install && cd ..

# 3. Installer les dépendances UI (Tailwind, Icons)
npm install -D tailwindcss postcss autoprefixer
npm install boxicons
npx tailwindcss init -p
```

### Lancement

#### Option A : Mode Simulation (Rapide / Sans Docker)
Lancez simplement le frontend. Il utilisera les données de simulation si le backend est éteint.
```bash
npm run dev
```
Accès : **http://localhost:5173**

#### Option B : Mode Complet (Avec Base de Données)
Assurez-vous que Docker est lancé, puis :
```bash
# 1. Démarrer la base de données
cd backend && docker-compose up -d postgres redis && cd ..

# 2. Lancer l'application complète
./start-local.sh
```
Accès : **http://localhost:5173** (Frontend) et **http://localhost:3002** (API)

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
