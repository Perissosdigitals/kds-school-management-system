# 🚀 Quick Start - Frontend-Backend

## Démarrage Rapide (2 minutes)

### Terminal 1 - Backend
```bash
cd /Users/apple/Desktop/kds-school-management-system/backend
npm run dev:gateway
```
✅ Attendre: `🚀 KSP API Gateway running on http://localhost:3001`

### Terminal 2 - Frontend
```bash
cd /Users/apple/Desktop/kds-school-management-system
npm run dev
```
✅ Attendre: `➜  Local:   http://localhost:3000/`

### Terminal 3 - Test
```bash
./test-integration.sh
```
✅ Vérifier: `✓ Réussis: 10`

---

## 🧪 Vérifier que Tout Fonctionne

### Health Check
```bash
curl http://localhost:3001/api/v1/health
```
Résultat attendu:
```json
{"status":"ok","timestamp":"2025-11-19T01:34:13.613Z","service":"kds-api-gateway"}
```

### Login Test
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kds-school.com","password":"admin123"}'
```
Résultat attendu:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {...}
}
```

### Récupérer les Élèves
```bash
curl http://localhost:3001/api/v1/students | jq .
```

---

## 💻 Utiliser dans React

### Exemple 1: Récupérer les élèves
```tsx
import { useEffect, useState } from 'react';
import { StudentsService } from '@/services/api/students.service';

export function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentsService.getStudents()
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

### Exemple 2: Formulaire de login
```tsx
import { AuthService } from '@/services/api/auth.service';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('admin@kds-school.com');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await AuthService.login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
      />
      <button>Se connecter</button>
    </form>
  );
}
```

---

## 📚 Documentation

| Document | Contenu |
|----------|---------|
| **INTEGRATION_GUIDE.md** | Guide complet avec tous les exemples |
| **INTEGRATION_STATUS.md** | État détaillé du système |
| **INTEGRATION_COMPLETE.md** | Résumé final et checklist |
| **API Docs** | http://localhost:3001/api/docs |

---

## 🔗 Endpoints Principaux

```
Base URL: http://localhost:3001/api/v1

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
  GET    /teachers/:id                  # Récupérer un enseignant
  PUT    /teachers/:id                  # Mettre à jour un enseignant

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

Et plus...
```

---

## ⚙️ Configuration

### .env.local (Frontend)
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_USE_MOCK_DATA=false
```

### Credentials de Test
```
Email: admin@kds-school.com
Password: admin123
```

---

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| Backend ne démarre pas | Vérifier: `npm install` dans backend/ |
| Frontend ne démarre pas | Vérifier: `npm install` dans racine |
| Erreur CORS | Vérifier que le backend tourne sur 3001 |
| Erreur 401 | Vérifier le token dans localStorage |
| Données mock au lieu de l'API | Vérifier VITE_API_URL et les logs |

---

## 📊 Architecture

```
localhost:3000 (Frontend)
        ↓
    React App
        ↓
Services (AuthService, StudentsService, etc.)
        ↓
HttpClient + Intercepteurs
        ↓
localhost:3001 (Backend)
        ↓
NestJS API
        ↓
Database
```

---

## ✅ Checklist

- [x] Backend tourne sur http://localhost:3001
- [x] Frontend tourne sur http://localhost:3000
- [x] Services API créés et fonctionnels
- [x] HttpClient configuré
- [x] Intercepteurs JWT en place
- [x] CORS configuré
- [x] Authentification teste
- [x] Tests d'intégration réussis
- [x] Documentation fournie

---

## 🎯 Prochaines Étapes

1. Adapter les composants React pour utiliser les services API
2. Ajouter la gestion des erreurs dans les composants
3. Tester chaque module complètement
4. Optimiser les performances
5. Préparer la production

---

## 📞 Support

Pour plus d'aide, consulter:
- `INTEGRATION_GUIDE.md` - Guide détaillé
- `http://localhost:3001/api/docs` - Documentation API
- Les logs du terminal du backend/frontend

---

**Status: ✅ PRÊT À L'EMPLOI**

Bérakhot ve-Hatzlakha! 🚀
