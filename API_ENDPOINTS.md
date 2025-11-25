# 📡 API Endpoints Complets - KSP School Management System

**Backend URL:** https://kds-backend-api.perissosdigitals.workers.dev  
**Database:** Cloudflare D1 (kds-school-db)  
**Last Updated:** 19 novembre 2025

---

## 🎯 Résumé Global

| Module | GET | POST | PUT | DELETE | Status |
|--------|-----|------|-----|--------|--------|
| **Students** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Teachers** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Classes** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Grades** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Attendance** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Finances** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Timetable** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Users** | ✅ | ✅ | ✅ | ✅ | 100% |
| **School Events** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Inventory** | ✅ | ✅ | ✅ | ✅ | 100% |
| **Dashboard** | ✅ | - | - | - | 100% |
| **Subjects** | ✅ | - | - | - | 100% |

**Total:** 12 modules avec CRUD complet ✅

---

## 🔐 Authentication

### POST `/api/v1/auth/login`
Login avec email/password

**Request:**
```json
{
  "email": "user@kds.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@kds.com",
    "role": "admin"
  }
}
```

---

## 👨‍🎓 Students (Élèves)

### GET `/api/v1/students`
Liste de tous les élèves actifs avec leurs informations utilisateur et classe.

### GET `/api/v1/students/:id`
Détails d'un élève spécifique.

### GET `/api/v1/students/stats/count`
Nombre total d'élèves actifs.

### POST `/api/v1/students`
Créer un nouvel élève.

**Request:**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@student.kds.edu",
  "phone": "0601020304",
  "birthDate": "2010-05-15",
  "gender": "male",
  "nationality": "Sénégalaise",
  "address": "Dakar, Senegal",
  "classId": "class-uuid"
}
```

### PUT `/api/v1/students/:id`
Modifier un élève existant (mise à jour partielle).

### DELETE `/api/v1/students/:id`
Supprimer un élève (soft delete - status='inactive').

---

## 👨‍🏫 Teachers (Enseignants)

### GET `/api/v1/teachers`
Liste de tous les enseignants actifs.

### GET `/api/v1/teachers/stats/count`
Nombre total d'enseignants actifs.

### POST `/api/v1/teachers`
Créer un nouvel enseignant.

**Request:**
```json
{
  "firstName": "Marie",
  "lastName": "Martin",
  "email": "marie.martin@kds.com",
  "phone": "0605060708",
  "specializations": ["Mathématiques", "Physique"],
  "hireDate": "2024-09-01"
}
```

### PUT `/api/v1/teachers/:id`
Modifier un enseignant existant.

### DELETE `/api/v1/teachers/:id`
Supprimer un enseignant (soft delete).

---

## 🏫 Classes

### GET `/api/v1/classes`
Liste de toutes les classes actives avec occupation et enseignant principal.

### GET `/api/v1/classes/stats/count`
Nombre total de classes actives.

### POST `/api/v1/classes`
Créer une nouvelle classe.

**Request:**
```json
{
  "name": "6ème-A",
  "level": "6ème",
  "academicYear": "2024-2025",
  "mainTeacherId": "teacher-uuid",
  "roomNumber": "101",
  "capacity": 30
}
```

### PUT `/api/v1/classes/:id`
Modifier une classe existante.

### DELETE `/api/v1/classes/:id`
Supprimer une classe (soft delete - is_active=0).

---

## 📊 Grades (Notes)

### GET `/api/v1/grades`
Liste des notes avec filtres optionnels.

**Query params:**
- `studentId` - Filtrer par élève
- `subjectId` - Filtrer par matière

### POST `/api/v1/grades`
Créer une nouvelle note.

**Request:**
```json
{
  "studentId": "student-uuid",
  "subjectId": "subject-uuid",
  "categoryId": "category-uuid",
  "grade": 15.5,
  "maxGrade": 20,
  "evaluationDate": "2025-11-15",
  "comment": "Très bon travail"
}
```

### PUT `/api/v1/grades/:id`
Modifier une note existante.

### DELETE `/api/v1/grades/:id`
Supprimer une note.

---

## 📅 Attendance (Présence)

### GET `/api/v1/attendance`
Liste des présences avec filtres optionnels.

**Query params:**
- `studentId` - Filtrer par élève
- `date` - Filtrer par date (YYYY-MM-DD)

### POST `/api/v1/attendance`
Enregistrer une présence/absence.

**Request:**
```json
{
  "studentId": "student-uuid",
  "date": "2025-11-19",
  "status": "present",
  "period": "morning",
  "reason": null
}
```

**Status values:** `present`, `absent`, `late`, `excused`

### PUT `/api/v1/attendance/:id`
Modifier un enregistrement de présence.

### DELETE `/api/v1/attendance/:id`
Supprimer un enregistrement.

---

## 💰 Finance (Transactions Financières)

### GET `/api/v1/finance/transactions`
Liste des transactions financières.

**Query params:**
- `studentId` - Filtrer par élève
- `status` - Filtrer par statut (pending, paid, cancelled)
- `type` - Filtrer par type (tuition, books, uniform, etc.)

### POST `/api/v1/finance/transactions`
Créer une nouvelle transaction.

**Request:**
```json
{
  "studentId": "student-uuid",
  "type": "tuition",
  "amount": 500000,
  "currency": "XOF",
  "status": "pending",
  "dueDate": "2025-12-31",
  "description": "Frais de scolarité Q1"
}
```

### PUT `/api/v1/finance/transactions/:id`
Modifier une transaction (ex: marquer comme payée).

**Request:**
```json
{
  "status": "paid",
  "paidDate": "2025-11-19"
}
```

### DELETE `/api/v1/finance/transactions/:id`
Supprimer une transaction.

---

## 📅 Timetable (Emploi du Temps)

### GET `/api/v1/timetable`
Liste des créneaux d'emploi du temps.

**Query params:**
- `classId` - Filtrer par classe
- `teacherId` - Filtrer par enseignant
- `dayOfWeek` - Filtrer par jour (1=Lundi, 7=Dimanche)

### POST `/api/v1/timetable`
Créer un nouveau créneau.

**Request:**
```json
{
  "classId": "class-uuid",
  "subjectId": "subject-uuid",
  "teacherId": "teacher-uuid",
  "room": "Salle 201",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "10:00",
  "recurrencePattern": "weekly"
}
```

### PUT `/api/v1/timetable/:id`
Modifier un créneau existant.

### DELETE `/api/v1/timetable/:id`
Supprimer un créneau (soft delete).

---

## 👥 Users (Gestion Utilisateurs)

### GET `/api/v1/users`
Liste de tous les utilisateurs.

**Query params:**
- `role` - Filtrer par rôle (admin, teacher, student, parent)
- `isActive` - Filtrer par statut (true/false)

### POST `/api/v1/users`
Créer un nouvel utilisateur.

**Request:**
```json
{
  "email": "user@kds.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "phone": "0601020304",
  "password": "password123"
}
```

### PUT `/api/v1/users/:id`
Modifier un utilisateur.

**Request:**
```json
{
  "email": "newemail@kds.com",
  "role": "teacher",
  "isActive": true
}
```

### DELETE `/api/v1/users/:id`
Désactiver un utilisateur (soft delete - is_active=0).

---

## 🎭 School Events (Vie Scolaire)

### GET `/api/v1/school-life/events`
Liste des événements scolaires.

**Query params:**
- `eventType` - Type d'événement (open_house, sports, cultural, etc.)
- `status` - Statut (scheduled, ongoing, completed, cancelled)
- `startDate` - Date début (YYYY-MM-DD)
- `endDate` - Date fin (YYYY-MM-DD)

### POST `/api/v1/school-life/events`
Créer un nouvel événement.

**Request:**
```json
{
  "title": "Journée Portes Ouvertes",
  "description": "Découverte de l'établissement",
  "eventType": "open_house",
  "startDate": "2025-12-15",
  "endDate": "2025-12-15",
  "location": "École KSP - Dakar",
  "status": "scheduled"
}
```

### PUT `/api/v1/school-life/events/:id`
Modifier un événement.

### DELETE `/api/v1/school-life/events/:id`
Supprimer un événement.

---

## 📦 Inventory (Inventaire)

### GET `/api/v1/inventory`
Liste des articles d'inventaire.

**Query params:**
- `category` - Filtrer par catégorie (Informatique, Mobilier, etc.)
- `status` - Filtrer par statut (available, in_use, damaged, etc.)

### POST `/api/v1/inventory`
Créer un nouvel article.

**Request:**
```json
{
  "name": "Ordinateur Portable Dell",
  "category": "Informatique",
  "quantity": 25,
  "unit": "unité",
  "location": "Salle Informatique",
  "status": "available",
  "purchaseDate": "2024-01-15",
  "purchasePrice": 450000,
  "condition": "Bon état"
}
```

### PUT `/api/v1/inventory/:id`
Modifier un article d'inventaire.

### DELETE `/api/v1/inventory/:id`
Supprimer un article.

---

## 📊 Dashboard (Tableau de Bord)

### GET `/api/v1/analytics/dashboard`
Statistiques globales pour le tableau de bord.

**Response:**
```json
{
  "studentsCount": 150,
  "teachersCount": 20,
  "classesCount": 12,
  "averageGrade": 14.5,
  "absencesCount": 5
}
```

---

## 📚 Subjects (Matières)

### GET `/api/v1/subjects`
Liste de toutes les matières actives.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Mathématiques",
    "code": "MATH",
    "coefficient": 4,
    "is_active": 1
  }
]
```

---

## 🏥 Health Check

### GET `/api/v1/health`
Vérifier l'état de l'API.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T06:30:00.000Z"
}
```

---

## 📝 Notes d'Implémentation

### Soft Delete
Les modules suivants utilisent le soft delete (marquent comme inactif au lieu de supprimer):
- Students (`status='inactive'`)
- Teachers (`status='inactive'`)
- Classes (`is_active=0`)
- Users (`is_active=0`)
- Timetable (`is_active=0`)

### Hard Delete
Les modules suivants utilisent le hard delete (suppression définitive):
- Grades
- Attendance
- Financial Transactions
- School Events
- Inventory

### UUID Generation
Tous les IDs sont générés avec `crypto.randomUUID()` pour garantir l'unicité.

### Date Format
- Dates stockées: `YYYY-MM-DD`
- Timestamps: ISO 8601 format

### Currency
Par défaut: `EUR` (peut être changé en `XOF`, `USD`, etc.)

---

## 🎯 Prochaines Améliorations

1. **Authentification JWT** - Middleware de validation des tokens
2. **Permissions** - Contrôle d'accès basé sur les rôles
3. **Pagination** - Pour les listes longues
4. **Recherche** - Endpoints de recherche full-text
5. **Exports** - Génération de rapports PDF/Excel
6. **Notifications** - Système de notifications push/email
7. **Webhooks** - Pour intégrations externes
8. **Rate Limiting** - Protection contre les abus
9. **Audit Logs** - Traçabilité des modifications
10. **Batch Operations** - Import/Export en masse

---

## 📞 Support

Pour toute question ou problème:
- GitHub: https://github.com/Perissosdigitals/kds-school-management-system
- Backend: https://kds-backend-api.perissosdigitals.workers.dev
- Frontend: https://10172ddc.kds-school-management.pages.dev
