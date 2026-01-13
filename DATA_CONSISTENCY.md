# Guide de Cohérence des Données

## Pourquoi je vois des données différentes ?

L'application KSP School Management System fonctionne selon deux modes distincts, ce qui peut expliquer pourquoi vous voyez des données différentes selon l'état de votre environnement.

### 1. Mode Connecté (Données Réelles)
- **Indicateur :** Badge vert "Mode Connecté" dans l'en-tête.
- **Source :** Base de données PostgreSQL (via Docker).
- **Comportement :** Si votre base de données est vide (nouvelle installation), vous verrez **0 élèves, 0 classes**. C'est normal.
- **Action requise :** Vous devez peupler la base de données (voir `DATABASE_SEED_GUIDE.md`).

### 2. Mode Simulation (Données Mock)
- **Indicateur :** Badge ambre "Mode Simulation" dans l'en-tête.
- **Source :** Fichier `src/data/mockData.ts`.
- **Comportement :** Ce mode s'active automatiquement quand le backend est inaccessible (Docker éteint ou erreur réseau). Il affiche un jeu de données de démonstration complet (~129 élèves, classes pré-remplies).
- **Utilité :** Permet de tester l'interface et les fonctionnalités sans avoir besoin de démarrer le backend.

## Résolution des Problèmes Courants

### "J'ai des données, puis tout disparaît"
C'est probablement parce que vous avez démarré le backend (Docker). L'application a basculé du **Mode Simulation** (données démo) au **Mode Connecté** (base de données vide).
**Solution :** Importez les données de simulation dans votre base de données réelle.

### "J'ai une erreur réseau"
Nous avons mis à jour tous les services (`Students`, `Teachers`, `Auth`) pour basculer automatiquement en Mode Simulation en cas d'erreur réseau. Si vous voyez encore une erreur, rafraîchissez la page.

### Comment synchroniser les deux ?
Si vous voulez que votre base de données réelle ressemble aux données de simulation :
1. Assurez-vous que le backend tourne (`./start-local.sh`).
2. Utilisez le script de seed ou l'import CSV pour ajouter les données.

## État Actuel de la Robustesse
- **Authentification :** Supporte le mode hors-ligne (login avec n'importe quel mot de passe pour les utilisateurs de démo).
- **Élèves/Classes/Enseignants :** Bascule automatique sur les données mock si l'API échoue.
- **Indicateur Visuel :** Ajouté dans l'en-tête pour clarifier le mode actuel.
