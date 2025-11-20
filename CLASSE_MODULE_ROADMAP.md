# 📚 Roadmap Module Gestion des Classes - Data-Driven

**Date**: 20 novembre 2025
**Objectif**: Créer un module pivot puissant reliant élèves, professeurs, emploi du temps

---

## 🎯 Vision du Module

La **classe** est l'entité centrale qui fait tourner autour d'elle:
- 👨‍🎓 **Les élèves** (assignation, effectifs)
- 👨‍🏫 **Les professeurs** (principal + intervenants)
- 📅 **L'emploi du temps** (matières, horaires)
- 📊 **Les statistiques** (notes moyennes, présences)
- 📈 **L'analyse data** (taux d'occupation, performance)

---

## ✅ Ce qui existe déjà (Backend)

### Entity `SchoolClass`
- ✅ name, level, academicYear
- ✅ mainTeacherId, roomNumber, capacity
- ✅ Relations: mainTeacher, students

### Service complet
- ✅ CRUD (create, findAll, findOne, update, remove)
- ✅ Filtres (level, academicYear, mainTeacherId, search)
- ✅ Pagination (page, limit)
- ✅ Stats par niveau (`getStatsByLevel`)
- ✅ Stats par année (`getStatsByAcademicYear`)
- ✅ Effectif par classe (`getClassWithStudentCount`)

### Endpoints API disponibles
```bash
GET    /api/v1/classes                    # Liste avec filtres
GET    /api/v1/classes/:id                # Détails + relations
GET    /api/v1/classes/stats/by-level     # Stats par niveau
GET    /api/v1/classes/stats/by-year      # Stats par année
POST   /api/v1/classes                    # Créer
PUT    /api/v1/classes/:id                # Modifier
PATCH  /api/v1/classes/:id/status         # Activer/Désactiver
DELETE /api/v1/classes/:id                # Supprimer
```

---

## 🚀 Ce qu'il faut créer (Frontend)

### 1. Composant Principal `ClassManagement.tsx` (Moderne)

#### Vue Grille (Cards)
- ✅ Cards visuelles colorées par niveau
- ✅ Jauge de capacité (vert/orange/rouge)
- ✅ Professeur principal affiché
- ✅ Effectif actuel / capacité max
- ✅ Numéro de salle
- ✅ Status actif/inactif

#### Statistiques Dashboard
- 📊 Cards par niveau (CP: 2, CE1: 3, etc.)
- 📈 Total classes actives
- 🎯 Taux d'occupation moyen
- 👥 Total élèves répartis

#### Filtres Avancés
- 🔍 Recherche par nom
- 📊 Filtre niveau (CP, CE1, CE2, etc.)
- 📅 Filtre année scolaire
- ��‍🏫 Filtre par professeur
- ✅ Filtre actif/inactif

### 2. Modal Détails Classe

#### Onglet Informations
- 📝 Nom, niveau, année
- 👨‍🏫 Professeur principal
- 🚪 Salle
- 👥 Effectif avec jauge

#### Onglet Élèves
- 📋 Liste complète des élèves
- �� Recherche dans la liste
- ➕ Bouton "Assigner élève"
- ❌ Bouton "Retirer élève"

#### Onglet Professeurs
- 👨‍🏫 Professeur principal
- 📚 Liste des intervenants par matière
- ➕ Assigner intervenant

#### Onglet Emploi du temps
- 📅 Grille horaire hebdomadaire
- 🎨 Couleurs par matière
- ✏️ Éditer emploi du temps

#### Onglet Statistiques
- 📊 Notes moyennes par matière
- ✅ Taux de présence
- 📈 Évolution sur l'année

### 3. Formulaire Création/Édition

#### Champs
- Nom de la classe *
- Niveau * (select: CP, CE1, etc.)
- Année scolaire * (select: 2024-2025)
- Professeur principal (select avec recherche)
- Numéro de salle
- Capacité * (default: 30)

#### Actions
- ✅ Créer
- ✏️ Modifier
- 🗑️ Supprimer (avec confirmation)

---

## 📊 Visualisations Data-Driven

### 1. Dashboard Stats Niveau
```
┌─────────┬─────────┬─────────┬─────────┐
│   CP    │   CE1   │   CE2   │   CM1   │
│    2    │    3    │    2    │    3    │
│ 56/60   │ 84/90   │ 48/60   │ 78/90   │
└─────────┴─────────┴─────────┴─────────┘
```

### 2. Card Classe Visuelle
```
┌────────────────────────────────────┐
│ 🎨 Gradient Header (Niveau-based) │
│                                    │
│ CE1-A                              │
│ 2024-2025                          │
├────────────────────────────────────┤
│ 👨‍🏫 Rachel Abitbol               │
│ 🚪 Salle 12                       │
│                                    │
│ 👥 28 / 30                        │
│ ████████████████████░░ 93%        │
│ ⚠️ Presque pleine                 │
│                                    │
│ ✅ Active         [Voir détails →]│
└────────────────────────────────────┘
```

### 3. Jauge Capacité
- 🟢 Vert: < 75% (Places disponibles)
- 🟠 Orange: 75-90% (Bonne occupation)
- 🔴 Rouge: > 90% (Presque pleine)

---

## 🎨 Design System

### Couleurs par Niveau
- **CP**: `bg-blue-500`
- **CE1**: `bg-green-500`
- **CE2**: `bg-yellow-500`
- **CM1**: `bg-orange-500`
- **CM2**: `bg-red-500`
- **6ème**: `bg-purple-500`

### Icons
- 📚 Classes
- 👨‍🎓 Élèves
- 👨‍🏫 Professeurs
- 📅 Emploi du temps
- 🚪 Salle
- 📊 Statistiques

---

## 🔗 Intégrations avec autres modules

### Module Élèves
- Assigner élève à une classe
- Voir classe depuis fiche élève

### Module Professeurs
- Assigner professeur principal
- Ajouter intervenants

### Module Emploi du temps
- Créer emploi du temps pour classe
- Voir horaires depuis détails classe

### Module Notes
- Notes moyennes par classe
- Classement dans la classe

### Module Présences
- Taux de présence de la classe
- Appel par classe

---

## 📝 Prochaines Actions Immédiates

1. **Tester l'API existante**
   ```bash
   curl http://localhost:3001/api/v1/classes
   curl http://localhost:3001/api/v1/classes/stats/by-level
   ```

2. **Créer quelques classes de test**
   - CP-A, CE1-A, CE2-A
   - Assigner des professeurs
   - Assigner des élèves (les 40 élèves PostgreSQL)

3. **Développer le composant frontend moderne**
   - Remplacer l'ancien `ClassManagement.tsx`
   - Utiliser le nouveau design data-driven

4. **Ajouter au menu principal**
   - Position après "Gestion des Professeurs"
   - Icon: 📚

---

## 🎯 Objectifs de Valeur

Ce module permettra de:
- ✅ **Visualiser instantanément** l'état de toutes les classes
- ✅ **Détecter** les classes surchargées
- ✅ **Assigner facilement** élèves et professeurs
- ✅ **Analyser** les performances par classe
- ✅ **Organiser** l'emploi du temps efficacement

---

**Bérakhot ve-Shalom!** 🕊️✨

**Version**: Roadmap 1.0
**Prêt pour implémentation!**
