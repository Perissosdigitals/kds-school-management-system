# 🚀 Quick Start - KDS School System

## ⏱️ Démarrage Rapide (2 minutes)

### Option A : Mode Simulation (Sans Backend)
*Idéal pour tester l'interface rapidement sans base de données.*

```bash
# Terminal 1 - Frontend
npm run dev
```
✅ Accès: `http://localhost:5173`
(Les données seront simulées automatiquement)

---

### Option B : Mode Complet (Avec Backend & DB)
*Pour le développement complet avec persistance des données.*

#### 1. Démarrer la Base de Données (Docker)
Assurez-vous que Docker Desktop est lancé.

```bash
# 1. Start DB containers
cd backend
docker-compose up -d postgres redis

# 2. Start Backend & Frontend using our helper script
cd ..
./start-local.sh
```

✅ Accès Frontend: `http://localhost:5173`
✅ Accès Backend: `http://localhost:3002`

---

## 🧪 Vérifier que Tout Fonctionne

### Health Check (Backend)
```bash
curl http://localhost:3002/api/v1/health
```
Résultat attendu: `{"status":"ok", ...}`

### Login Test
```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kds.ci","password":"password123"}'
```

---

## 💻 Utiliser dans React

### Exemple 1: Récupérer les élèves
```tsx
import { useEffect, useState } from 'react';
import { StudentsService } from '../services/api/students.service';

export function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fonctionne en mode connecté ET en mode simulation à l'aide des adaptateurs
    StudentsService.getAllStudents()
      .then(setStudents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <ul>
      {students.map(s => (
        <li key={s.id}>{s.firstName} {s.lastName}</li>
      ))}
    </ul>
  );
}
```

---

## 📚 Documentation

| Document | Contenu |
|----------|---------|
| **INTEGRATION_GUIDE.md** | Guide complet avec tous les exemples |
| **INTEGRATION_STATUS.md** | État détaillé du système |
| **QUICK_START.md** | Ce fichier |
| **API Docs** | http://localhost:3002/api/docs |

---

## 🔗 Endpoints Principaux

```
Base URL: http://localhost:3002/api/v1

Auth:
  POST   /auth/login                    # Se connecter

Students:
  GET    /students                      # Récupérer tous les élèves
  POST   /students                      # Créer un élève
  GET    /students/:id                  # Récupérer un élève
  PUT    /students/:id                  # Mettre à jour un élève
  DELETE /students/:id                  # Supprimer un élève

Teachers:
  GET    /teachers                      # Récupérer tous les enseignants
  POST   /teachers                      # Créer un enseignant
...

Classes:
  GET    /classes                       # Récupérer toutes les classes
  POST   /classes                       # Créer une classe
  GET    /classes/:id                   # Récupérer une classe

Grades:
  GET    /grades                        # Récupérer toutes les notes
  POST   /grades                        # Enregistrer une note

Timetable:
  GET    /timetable                     # Récupérer l'emploi du temps
  POST   /timetable                     # Créer une séance

Attendance:
  GET    /attendance                    # Récupérer les présences
  POST   /attendance                    # Enregistrer une présence

Finance:
  GET    /finance                       # Récupérer les transactions
  POST   /finance                       # Créer une transaction
```

---

## ⚙️ Configuration

### .env.local (Frontend)
```env
VITE_API_URL=http://localhost:3002/api/v1
VITE_USE_MOCK_DATA=false
```

### Credentials de Test
```
Email: admin@kds.ci (ou admin@kds-school.com selon seed)
Password: password123
```

---

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| Backend ne démarre pas | Vérifier: `npm install` dans backend/ |
| Docker error | `open -a Docker` sur Mac ou lancer Docker Desktop |
| Frontend ne démarre pas | Vérifier: `npm install` dans racine |
| Erreur CORS | Vérifier que le backend tourne sur 3002 |
| Erreur 401 | Vérifier le token dans localStorage |
| Données mock au lieu de l'API | Vérifier VITE_API_URL et les logs |

---

## 📊 Architecture

```
localhost:5173 (Frontend)
        ↓
    React App
        ↓
Services (AuthService, StudentsService, etc.)
        ↓
HttpClient + Intercepteurs
        ↓
localhost:3002 (Backend)
        ↓
NestJS API
        ↓
Database (Postgres :5432)
```

---

## ✅ Checklist

- [x] Backend tourne sur http://localhost:3002
- [x] Frontend tourne sur http://localhost:5173
- [x] Services API créés et fonctionnels
- [x] HttpClient configuré
- [x] Intercepteurs JWT en place
- [x] CORS configuré
- [x] Authentification teste
- [x] Tests d'intégration réussis
- [x] Documentation fournie

---

## 🎯 Prochaines Étapes

1. Utiliser le frontend pour naviguer dans l'application
2. Vérifier les logs dans `/tmp/ksp-backend.log` en cas de problème
3. Consulter `INTEGRATION_GUIDE.md` pour des détails avancés

---

## 📞 Support

Pour plus d'aide, consulter:
- `INTEGRATION_GUIDE.md` - Guide détaillé
- `http://localhost:3002/api/docs` - Documentation API
- Les logs du terminal du backend/frontend

---

**Status: ✅ PRÊT À L'EMPLOI**

Bérakhot ve-Hatzlakha! 🚀
