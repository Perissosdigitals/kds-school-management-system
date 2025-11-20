# Module Vie Scolaire - Documentation Complète

## Vue d'ensemble

Le module Vie Scolaire a été complètement transformé d'un système basique (appel/emploi du temps) en une plateforme complète de gestion de la vie scolaire comprenant :
- Activités extrascolaires
- Événements scolaires
- Réunions
- Suivi disciplinaire
- Associations
- Annonces

## Fichiers créés

### 1. Formulaires (`components/forms/`)

#### `ActivityForm.tsx`
Formulaire de création/édition d'activités extrascolaires.

**Champs** :
- Nom de l'activité *
- Catégorie * (Sport, Musique, Théâtre, Informatique, Arts, Lecture, Sciences, Langues, Autre)
- Statut (Planifiée, En cours, Terminée, Annulée)
- Enseignant responsable
- Horaire *
- Lieu *
- Nombre max de participants
- Dates de début/fin
- Description *

**Validation** : Nom, description, horaire, lieu et date de début obligatoires.

#### `EventForm.tsx`
Formulaire de création/édition d'événements scolaires.

**Champs** :
- Titre *
- Type * (Cérémonie, Journée thématique, Compétition, Sortie pédagogique, Spectacle, Autre)
- Statut (Planifié, En cours, Terminé, Annulé)
- Date et heures *
- Lieu *
- Organisateurs (multi-sélection enseignants)
- Public cible * (Élèves, Parents, Enseignants, Personnel, Public)
- Participants estimés
- Budget
- Description *

**Validation** : Titre, description, date, heure de début, lieu et public cible obligatoires.

#### `MeetingForm.tsx`
Formulaire de planification de réunions.

**Champs** :
- Titre *
- Type * (Conseil de classe, Parents-Professeurs, Réunion pédagogique, Assemblée générale, Autre)
- Statut (Planifiée, En cours, Terminée, Annulée, Reportée)
- Date et heures *
- Lieu *
- Organisateur * (sélection enseignant)
- Participants invités (multi-sélection enseignants)
- Ordre du jour
- Description

**Validation** : Titre, date, heure de début, lieu et organisateur obligatoires.

#### `IncidentForm.tsx`
Formulaire de signalement d'incidents disciplinaires.

**Champs** :
- Élève concerné * (sélection)
- Date et heure *
- Lieu *
- Type d'incident * (Comportement inapproprié, Violence physique/verbale, Harcèlement, Retard répété, Absence injustifiée, Non-respect du règlement, Dégradation du matériel, Autre)
- Gravité (Mineur, Modéré, Grave, Très grave)
- Statut (Signalé, En traitement, Résolu, Clos)
- Rapporté par * (sélection enseignant)
- Témoins (multi-sélection enseignants)
- Description détaillée *
- Actions prises

**Validation** : Élève, date, heure, lieu, type, description et rapporteur obligatoires.

#### `AssociationForm.tsx`
Formulaire de création/gestion d'associations.

**Champs** :
- Nom *
- Type (Club étudiant, Association parents, Partenariat ONG, Autre)
- Statut (Active, Inactive, En création)
- Président (sélection élève)
- Conseiller/Référent (sélection enseignant)
- Date de fondation
- Budget annuel
- Membres (multi-sélection élèves)
- Description *
- Objectifs *

**Validation** : Nom, description et objectifs obligatoires.

#### `AnnouncementForm.tsx`
Formulaire de publication d'annonces.

**Champs** :
- Titre *
- Catégorie (Général, Urgent, Événement, Académique, Administratif)
- Priorité (Bas, Normal, Élevé, Urgent)
- Date de publication *
- Date d'expiration (optionnelle)
- Public cible * (Élèves, Parents, Enseignants, Personnel, Tout le monde)
- Contenu *
- Pièces jointes

**Validation** : Titre, contenu, date de publication et public cible obligatoires.

**Fonctionnalités** :
- Aperçu du badge de priorité
- Zone de glisser-déposer pour pièces jointes
- Auto-masquage après date d'expiration

#### `index.ts`
Fichier d'export centralisé pour faciliter les imports.

### 2. Composants UI

#### `Modal.tsx`
Composant modal réutilisable avec 4 tailles (sm, md, lg, xl).

**Props** :
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `children`: ReactNode
- `size`: 'sm' | 'md' | 'lg' | 'xl' (défaut: 'lg')

**Fonctionnalités** :
- Overlay avec flou d'arrière-plan
- Fermeture par bouton X
- Hauteur max 90vh avec scroll interne
- Animation d'apparition

### 3. Modifications de fichiers existants

#### `SchoolLife.tsx`
**Ajouts** :
- Import des formulaires et du composant Modal
- États pour contrôler l'affichage de chaque modale
- Données mock pour enseignants et élèves (à remplacer par API)
- Handlers onClick sur tous les boutons "Nouvelle..." pour ouvrir les modales
- 6 modales à la fin du composant avec handlers de sauvegarde

**Modales ajoutées** :
1. Modal Activité avec ActivityForm
2. Modal Événement avec EventForm
3. Modal Réunion avec MeetingForm
4. Modal Incident avec IncidentForm
5. Modal Association avec AssociationForm
6. Modal Annonce avec AnnouncementForm

**Boutons modifiés** :
- "Nouvelle Activité" → ouvre modal
- "Nouvel Événement" → ouvre modal
- "Nouvelle Réunion" → ouvre modal
- "Nouveau Signalement" → ouvre modal
- "Nouvelle Association" → ouvre modal
- "Nouvelle" (annonces) → ouvre modal

#### `types.ts`
**Ajouts** :
- 9 nouvelles interfaces : Activity, Event, Meeting, Incident, Sanction, Achievement, Association, Announcement
- 15+ types d'énumération pour les statuts et catégories

## Structure des types

### Activity
```typescript
{
  id, name, category, description, 
  responsibleTeacherId, schedule, location,
  maxParticipants, currentParticipants, participants[],
  startDate, endDate, status,
  createdAt, updatedAt
}
```

### Event
```typescript
{
  id, title, type, description,
  date, startTime, endTime, location,
  organizers[], targetAudience, 
  maxParticipants, participants[], 
  budget, expenses,
  photos[], documents[],
  status, createdBy, createdAt, updatedAt
}
```

### Meeting
```typescript
{
  id, title, type, description,
  date, startTime, endTime, location,
  organizer, organizerName,
  invitees[], attendees[],
  agenda, minutes, status,
  isRecurrent, recurrencePattern,
  createdAt, updatedAt
}
```

### Incident
```typescript
{
  id, studentId, studentName,
  date, time, location, type, description,
  severity, reportedBy, reportedByName,
  witnessIds[], witnessNames[],
  actionsTaken, followUp,
  sanctions[], parentNotified,
  status, createdAt, updatedAt
}
```

### Association
```typescript
{
  id, name, type, description,
  presidentId, presidentName,
  members[], advisorId, advisorName,
  foundingDate, status,
  activities[], budget,
  contactEmail, contactPhone, logo,
  createdAt, updatedAt
}
```

### Announcement
```typescript
{
  id, title, content,
  category, priority, targetAudience[],
  publishDate, expiryDate,
  authorId, authorName,
  attachments[], views[], acknowledged[],
  isActive, createdAt, updatedAt
}
```

## Intégration API (à implémenter)

### Endpoints nécessaires

```
POST   /api/v1/activities
GET    /api/v1/activities
GET    /api/v1/activities/:id
PUT    /api/v1/activities/:id
DELETE /api/v1/activities/:id

POST   /api/v1/events
GET    /api/v1/events
GET    /api/v1/events/:id
PUT    /api/v1/events/:id
DELETE /api/v1/events/:id

POST   /api/v1/meetings
GET    /api/v1/meetings
GET    /api/v1/meetings/:id
PUT    /api/v1/meetings/:id
DELETE /api/v1/meetings/:id

POST   /api/v1/incidents
GET    /api/v1/incidents
GET    /api/v1/incidents/:id
PUT    /api/v1/incidents/:id
DELETE /api/v1/incidents/:id
POST   /api/v1/incidents/:id/sanctions

POST   /api/v1/associations
GET    /api/v1/associations
GET    /api/v1/associations/:id
PUT    /api/v1/associations/:id
DELETE /api/v1/associations/:id

POST   /api/v1/announcements
GET    /api/v1/announcements
GET    /api/v1/announcements/:id
PUT    /api/v1/announcements/:id
DELETE /api/v1/announcements/:id
POST   /api/v1/announcements/:id/views
```

### Modification des handlers

Dans `SchoolLife.tsx`, remplacer les `console.log` par des appels API :

```typescript
// Exemple pour Activity
onSave={async (activity) => {
  try {
    const response = await fetch('/api/v1/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    if (response.ok) {
      // Recharger la liste des activités
      setShowActivityModal(false);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}}
```

## Fonctionnalités à ajouter

### Court terme
1. [ ] Charger les enseignants et élèves réels depuis l'API
2. [ ] Implémenter les appels API pour toutes les entités
3. [ ] Ajouter les vues détaillées pour chaque entité
4. [ ] Ajouter les fonctions de modification/suppression

### Moyen terme
1. [ ] Système de notifications pour les événements
2. [ ] Calendrier visuel intégré
3. [ ] Gestion des inscriptions aux activités
4. [ ] Export PDF des rapports disciplinaires
5. [ ] Système de commentaires sur les annonces
6. [ ] Statistiques et graphiques pour chaque module

### Long terme
1. [ ] Envoi automatique d'emails pour réunions
2. [ ] Notifications push mobile
3. [ ] Signature électronique pour convocations
4. [ ] Intégration avec module financier pour budgets
5. [ ] Historique complet et audit trail
6. [ ] Permissions granulaires par rôle

## Tests recommandés

1. **Validation des formulaires** : Tester tous les champs obligatoires
2. **Multi-sélection** : Vérifier les checkboxes pour organisateurs, témoins, membres
3. **Dates** : Valider que date de fin > date de début
4. **Modales** : Tester ouverture/fermeture avec bouton X et fond
5. **Responsive** : Vérifier affichage mobile/tablette
6. **Types** : Compiler avec TypeScript en mode strict

## Notes de migration

- Les anciennes définitions de types dans `SchoolLife.tsx` ont été supprimées
- Les imports doivent maintenant utiliser `import type { ... } from '../types'`
- Tous les formulaires utilisent la même structure de props (entity?, onSave, onCancel)
- Les modales sont contrôlées par des états React booléens

## Performance

- Utilisation de `React.memo` pour les composants répétitifs
- Multi-sélection avec checkboxes optimisée
- Validation côté client avant envoi API
- États locaux pour éviter re-renders inutiles

## Accessibilité

- Labels associés aux inputs
- Messages d'erreur clairs
- Boutons avec icônes descriptives
- Navigation au clavier supportée
- Contraste WCAG AA respecté

## Prochaines étapes

1. **Backend** : Créer les tables dans la base de données
2. **API** : Implémenter tous les endpoints listés ci-dessus
3. **Data** : Créer des seeds pour tester avec données réalistes
4. **UI** : Ajouter vues liste et détail pour chaque entité
5. **Notifications** : Système d'alertes pour événements importants
6. **Tests** : Tests unitaires et E2E avec Vitest/Playwright

## Date de création
20 novembre 2025

## Auteur
Développé pour KDS School Management System
