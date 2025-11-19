## Intégration Frontend-Backend - Guide Pratique

### ✅ État Actuel (19 novembre 2025)

**Backend:** Tourne sur `http://localhost:3001`
- ✅ Endpoint de santé: `/api/v1/health`
- ✅ Authentification: `POST /api/v1/auth/login`
- ✅ Students: `GET /api/v1/students`, `POST /api/v1/students`
- ✅ Teachers: `GET /api/v1/teachers`, `POST /api/v1/teachers`
- ✅ Classes, Grades, Timetable, Attendance, Finance, etc.
- ✅ CORS configuré pour `localhost:3000`

**Frontend:** Tourne sur `http://localhost:3000`
- ✅ HttpClient configuré avec `baseURL: http://localhost:3001/api/v1`
- ✅ Intercepteurs de tokens JWT en place
- ✅ Services API avec fallback sur mock data
- ✅ Variables d'environnement: `.env.local`

---

## 🚀 Comment Utiliser les Services

### 1. Authentification

```typescript
import { AuthService } from '@/services/api/auth.service';

// Login
const response = await AuthService.login({
  email: 'admin@kds-school.com',
  password: 'admin123'
});

// Token et user sont automatiquement stockés dans localStorage
console.log(response.access_token);
console.log(response.user);

// Vérifier l'authentification
const isAuth = AuthService.isAuthenticated();

// Récupérer l'utilisateur courant
const user = AuthService.getCurrentUser();

// Logout
AuthService.logout();
```

### 2. Gestion des Élèves

```typescript
import { StudentsService } from '@/services/api/students.service';

// Récupérer tous les élèves
const students = await StudentsService.getStudents({ page: 1, limit: 10 });

// Récupérer un élève par ID
const student = await StudentsService.getStudentById('id-123');

// Créer un élève
const newStudent = await StudentsService.createStudent({
  firstName: 'Jean',
  lastName: 'Dupont',
  dob: '2015-05-20',
  gender: 'Masculin',
  // ... autres champs
});

// Mettre à jour un élève
const updated = await StudentsService.updateStudent('id-123', {
  firstName: 'Jean-Pierre'
});

// Supprimer un élève
await StudentsService.deleteStudent('id-123');
```

### 3. Gestion des Enseignants

```typescript
import { TeachersService } from '@/services/api/teachers.service';

// Récupérer tous les enseignants
const teachers = await TeachersService.getTeachers();

// Récupérer un enseignant
const teacher = await TeachersService.getTeacherById('id-456');

// Créer un enseignant
const newTeacher = await TeachersService.createTeacher({
  firstName: 'Marie',
  lastName: 'Martin',
  subject: 'Mathématiques',
  email: 'marie@kds.com',
  phone: '0612345678'
});
```

### 4. Gestion des Classes

```typescript
import { ClassesService } from '@/services/api/classes.service';

// Récupérer toutes les classes
const classes = await ClassesService.getClasses();

// Récupérer les détails d'une classe (avec élèves, emploi du temps, notes)
const classDetail = await ClassesService.getClassById('class-789');
if (classDetail) {
  console.log(classDetail.students);
  console.log(classDetail.timetable);
  console.log(classDetail.grades);
}
```

### 5. Gestion des Notes

```typescript
import { GradesService } from '@/services/api/grades.service';

// Récupérer les évaluations
const evaluations = await GradesService.getEvaluations({ classId: 'class-123' });

// Récupérer les notes
const grades = await GradesService.getGrades({ studentId: 'student-123' });

// Enregistrer une note
const newGrade = await GradesService.recordGrade({
  studentId: 'student-123',
  evaluationId: 'eval-456',
  score: 18.5
});
```

### 6. Présences

```typescript
import { AttendanceService } from '@/services/api/attendance.service';

// Récupérer les enregistrements de présence
const records = await AttendanceService.getAttendanceRecords({
  studentId: 'student-123'
});

// Enregistrer une présence
const attendance = await AttendanceService.recordAttendance({
  studentId: 'student-123',
  date: '2025-11-19',
  status: 'Présent'
});
```

### 7. Emploi du Temps

```typescript
import { TimetableService } from '@/services/api/timetable.service';

// Récupérer l'emploi du temps
const schedule = await TimetableService.getSchedule({ classId: 'class-123' });

// Créer une séance
const session = await TimetableService.createSession({
  classId: 'class-123',
  teacherId: 'teacher-456',
  subject: 'Français',
  day: 'Lundi',
  startTime: '09:00',
  endTime: '10:00'
});
```

### 8. Finances

```typescript
import { FinancesService } from '@/services/api/finances.service';

// Récupérer les transactions
const transactions = await FinancesService.getTransactions({
  status: 'En attente'
});

// Créer une transaction
const transaction = await FinancesService.createTransaction({
  studentName: 'Jean Dupont',
  description: 'Scolarité Novembre',
  type: 'Paiement Scolarité',
  amount: 500,
  status: 'En attente'
});
```

### 9. Dashboard

```typescript
import { DashboardService } from '@/services/api/dashboard.service';

// Dashboard pour enseignant
const teacherDash = await DashboardService.getTeacherDashboard('teacher-id');

// Dashboard pour administrateur
const adminDash = await DashboardService.getAdminDashboard();
```

### 10. Dossier Pédagogique

```typescript
import { PedagogicalFileService } from '@/services/api/pedagogicalFile.service';

// Récupérer le dossier pédagogique complet
const file = await PedagogicalFileService.getPedagogicalFile('student-id');

// Ajouter une note pédagogique
const note = await PedagogicalFileService.addPedagogicalNote('student-id', {
  title: 'Comportement',
  content: 'Très bon comportement en classe',
  date: '2025-11-19'
});
```

---

## 🎯 Intégration dans les Composants React

### Exemple : StudentManagement.tsx

```typescript
import { useState, useEffect } from 'react';
import { StudentsService } from '@/services/api/students.service';
import type { Student } from '@/types';

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await StudentsService.getStudents({ page: 1, limit: 10 });
      setStudents(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des élèves:', err);
      setError('Impossible de charger les élèves');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await StudentsService.deleteStudent(id);
      setStudents(students.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Impossible de supprimer l\'élève');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {students.map(student => (
        <div key={student.id} className="student-card">
          <h3>{student.firstName} {student.lastName}</h3>
          <p>Classe: {student.gradeLevel}</p>
          <button onClick={() => handleDelete(student.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
};

export default StudentManagement;
```

### Exemple : Login.tsx

```typescript
import { useState } from 'react';
import { AuthService } from '@/services/api/auth.service';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AuthService.login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};

export default Login;
```

---

## 🔍 Tests Manuels avec curl

```bash
# Test de santé
curl http://localhost:3001/api/v1/health

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kds-school.com","password":"admin123"}'

# Récupérer les élèves (sans token)
curl http://localhost:3001/api/v1/students

# Récupérer les élèves (avec token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/v1/students

# Créer un élève
curl -X POST http://localhost:3001/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "Test",
    "lastName": "Student",
    "dob": "2015-01-01",
    "gender": "Masculin",
    "nationality": "Française"
  }'
```

---

## 📋 Checklist de Vérification

- [x] Backend démarre sur `http://localhost:3001`
- [x] Frontend démarre sur `http://localhost:3000`
- [x] Endpoint `/api/v1/health` répond
- [x] Authentification JWT fonctionne
- [x] CORS configuré pour `localhost:3000`
- [x] Services API avec fallback mock data
- [x] HttpClient avec intercepteurs
- [x] Variables d'environnement `.env.local`
- [x] Tous les modules backend chargés

---

## 🛠️ Prochaines Étapes

1. **Adapter les composants existants:**
   - `StudentManagement.tsx` → utiliser `StudentsService`
   - `TeacherManagement.tsx` → utiliser `TeachersService`
   - `ClassManagement.tsx` → utiliser `ClassesService`
   - `GradesManagement.tsx` → utiliser `GradesService`
   - Et ainsi de suite...

2. **Ajouter la gestion des erreurs:**
   - Afficher les messages d'erreur à l'utilisateur
   - Implémenter la retry logic
   - Logger les erreurs pour le débogage

3. **Optimiser les performances:**
   - Implémenter le caching côté client
   - Ajouter la pagination
   - Utiliser React Query ou SWR pour les données

4. **Tester en profondeur:**
   - Tests unitaires des services
   - Tests d'intégration des composants
   - Tests E2E du flux utilisateur complet

---

## 📞 Support

Pour plus d'informations, consulter:
- Documentation API: `http://localhost:3001/api/docs`
- Structure du backend: `/backend/README.md`
- Types TypeScript: `/types.ts`

**Bérakhot ve-Hatzlakha! 🚀**
