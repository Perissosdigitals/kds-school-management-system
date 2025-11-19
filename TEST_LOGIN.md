# 🔍 Guide de Test - Page de Login

## ✅ Problème Résolu

Le problème "Network Error" était causé par:
1. ❌ Configuration CORS - Le backend n'autorisait pas le port 3002
2. ❌ Mode Mock Data - Le fichier config.ts utilisait des données mockées

## 🎯 Corrections Appliquées

1. ✅ **CORS Backend** - Ajout du port 3002 aux origines autorisées
2. ✅ **Backend Redémarré** - Nouvelle configuration chargée
3. ✅ **config.ts** - USE_MOCK_DATA mis à false
4. ✅ **Frontend Redémarré** - Utilise maintenant l'API REST

## 🌐 URLs de l'Application

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3001/api/v1
- **Documentation API**: http://localhost:3001/api/docs

## 👤 Comptes de Test Disponibles

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Fondatrice | fondatrice@kds-school.com | password123 |
| Directrice | directrice@kds-school.com | password123 |
| Comptable | comptable@kds-school.com | password123 |
| Enseignant | enseignant@kds-school.com | password123 |
| Agent | agent@kds-school.com | password123 |

## 🧪 Test de Connexion

### Option 1: Sélection Rapide des Rôles
1. Ouvrez http://localhost:3002
2. Cliquez sur une des cartes de rôle
3. La connexion devrait être automatique

### Option 2: Connexion Manuelle
1. Ouvrez http://localhost:3002
2. Cliquez sur "Connexion manuelle"
3. Entrez email et mot de passe
4. Cliquez sur "Se connecter"

## 🔧 Vérification Backend (via curl)

```bash
# Test de l'API backend
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fondatrice@kds-school.com","password":"password123"}'
```

Si tout fonctionne, vous devriez recevoir:
```json
{
  "access_token": "eyJ...",
  "user": {
    "id": "...",
    "email": "fondatrice@kds-school.com",
    "role": "fondatrice",
    "firstName": "Madame",
    "lastName": "Fondatrice"
  }
}
```

## 🐛 Debugging

Si vous voyez encore "Network Error":

1. **Vérifier que les services tournent**:
```bash
# Frontend
curl http://localhost:3002

# Backend
curl http://localhost:3001/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{}'
```

2. **Vérifier la console du navigateur**:
   - Ouvrez F12 (DevTools)
   - Allez dans l'onglet "Console"
   - Recherchez les erreurs réseau ou CORS

3. **Vérifier les logs du backend**:
```bash
tail -f backend.log
```

## 📊 État des Services

```bash
# Vérifier tous les services
ps aux | grep -E "(vite|nest)" | grep -v grep
docker ps | grep kds
```

## 🔄 Redémarrage des Services

Si nécessaire, redémarrez les services:

```bash
# Frontend
lsof -ti:3002 | xargs kill -9
npm run dev &

# Backend
lsof -ti:3001 | xargs kill -9
cd backend && npm run dev &
```

---

**Date**: 2025-11-19  
**Status**: ✅ Résolu et Testé
