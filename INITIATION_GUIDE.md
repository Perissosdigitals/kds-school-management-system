# 🚀 GUIDE D'INITIATION COMPLET - KDS SCHOOL SYSTEM

**Date**: 9 Décembre 2025  
**Version**: 2.0 (Support Mode Simulation & Offline)

Ce guide détaille le processus complet pour installer, configurer et lancer l'application KDS School Management System dans un environnement sain et stable.

---

## 📋 1. Prérequis Système

Avant de commencer, assurez-vous d'avoir installé :

1.  **Node.js** (v18 ou supérieur)
    *   Vérifier : `node -v`
2.  **Docker Desktop** (Recommandé pour la base de données)
    *   Vérifier : `docker -v`
3.  **Git**
    *   Vérifier : `git --version`

---

## 🛠 2. Installation Initiale

Exécutez ces commandes étape par étape dans votre terminal à la racine du projet.

### Étape 2.1 : Installation des Dépendances
```bash
# Installation des dépendances Frontend
npm install

# Installation des dépendances Backend
cd backend
npm install
cd ..
```

### Étape 2.2 : Configuration des Assets (CSS & Icons)
Pour garantir le fonctionnement hors-ligne (sans internet), nous installons les dépendances UI localement.
```bash
# Tailwind CSS et dépendances
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Icônes (Boxicons)
npm install boxicons
```

---

## 🚦 3. Lancement de l'Application

Vous avez deux options selon vos besoins :

### Option A : Mode Simulation (Rapide / Démo)
*Idéal pour : Tests rapides, Démos client, Développement Frontend, Panne réseau.*

Ce mode utilise des données simulées (`mockData.ts`) intégrées à l'application. Aucune base de données n'est requise.

**Commande :**
```bash
npm run dev
```
*   L'application détectera automatiquement l'absence du backend et basculera sur les données de simulation.
*   Vous verrez ~129 élèves, 10 professeurs et 4 classes.

### Option B : Mode Complet (Production Locale)
*Idéal pour : Tests d'intégration, Persistance des données, Validation Backend.*

Ce mode lance la base de données PostgreSQL réelle via Docker.

**Commandes :**
1.  **Démarrer Docker Desktop** sur votre machine.
2.  **Lancer l'infrastructure :**
    ```bash
    cd backend
    docker-compose up -d postgres redis
    cd ..
    ```
3.  **Démarrer l'application :**
    ```bash
    ./start-local.sh
    ```

---

## 💾 4. Gestion des Données (Mode Complet)

Si vous utilisez le **Mode Complet**, la base de données est initialement vide. Voici comment la peupler.

### Initialisation (Seeding)
Pour injecter les données de test (100 élèves, notes, présences) :

1.  Assurez-vous que le backend tourne (`./start-local.sh`).
2.  Utilisez l'API de seed ou le script SQL :
    ```bash
    # Via Docker (Recommandé)
    docker exec -i kds-postgres psql -U kds_admin -d kds_school_db < backend/shared/database/seed-full-school.sql
    ```

---

## ✅ 5. Vérification de l'Installation

Pour confirmer que tout est en place :

1.  Ouvrez **http://localhost:5173**
2.  Allez dans le menu **"Gestion des Données"**.
3.  Vérifiez les compteurs :
    *   **Élèves** : Doit afficher > 0 (ex: 129 ou 100)
    *   **Enseignants** : Doit afficher > 0 (ex: 10)
    *   **Classes** : Doit afficher > 0 (ex: 4 ou 10)

Si ces compteurs sont à 0, vérifiez que :
*   Soit le backend est éteint (Mode Simulation devrait prendre le relais).
*   Soit le backend est allumé mais la base est vide (Faire l'étape 4 "Seeding").

---

## 🆘 Dépannage

**Problème : "Je vois 0 élèves"**
*   **Solution** : Le backend est peut-être allumé mais vide, ou inaccessible. Essayez d'arrêter le backend (`Ctrl+C` ou `./stop-local.sh`) et rafraîchissez la page pour forcer le Mode Simulation.

**Problème : "Le style est cassé (pas de CSS)"**
*   **Solution** : Vérifiez que vous avez bien exécuté l'étape 2.2. Assurez-vous que `index.html` ne contient plus de liens CDN bloqués par le pare-feu.

**Problème : "Erreur de connexion DB"**
*   **Solution** : Vérifiez que Docker est lancé. Tapez `docker ps` pour voir si le conteneur `kds-postgres` est actif.

---

**Berakhot ve-Shalom!** Votre environnement est prêt.
