# 🔐 Comptes de Test - KSP School Management System

## 📌 URL de l'Application
- **Frontend**: https://1128523e.kds-school-management.pages.dev
- **Backend API**: https://kds-backend-api.perissosdigitals.workers.dev

---

## 👨‍💼 Compte Administrateur

### Admin Principal
- **Email**: `admin@kds-school.ci`
- **Mot de passe**: N'importe quel mot de passe (ex: `admin123` ou `test123`)
- **Nom**: David COHEN
- **Rôle**: Administrateur
- **Permissions**: Accès complet à tous les modules

---

## 👨‍🏫 Comptes Enseignants

### Enseignant 1 - Mohamed KONE
- **Email**: `mkone@kds-school.ci`
- **Mot de passe**: N'importe quel mot de passe (ex: `teacher123`)
- **Nom**: Mohamed KONE
- **Rôle**: Enseignant
- **Classe**: CP1-A (12 élèves)

### Enseignant 2 - Aminata COULIBALY
- **Email**: `acoulibaly@kds-school.ci`
- **Mot de passe**: N'importe quel mot de passe
- **Nom**: Aminata COULIBALY
- **Rôle**: Enseignant

### Enseignant 3 - Jean TRAORE
- **Email**: `jtraore@kds-school.ci`
- **Mot de passe**: N'importe quel mot de passe
- **Nom**: Jean TRAORE
- **Rôle**: Enseignant

### Enseignant 4 - Sarah YAO
- **Email**: `syao@kds-school.ci`
- **Mot de passe**: N'importe quel mot de passe
- **Nom**: Sarah YAO
- **Rôle**: Enseignant

### Enseignant 5 - Rachel BAMBA
- **Email**: `rbamba@kds-school.ci`
- **Mot de passe**: N'importe quel mot de passe
- **Nom**: Rachel BAMBA
- **Rôle**: Enseignant

---

## 👪 Comptes Parents

### Parent 1
- **Email**: `parent1@example.ci`
- **Mot de passe**: N'importe quel mot de passe
- **Rôle**: Parent

### Parent 2
- **Email**: `parent2@example.ci`
- **Mot de passe**: N'importe quel mot de passe
- **Rôle**: Parent

---

## 🔒 Note Importante sur la Sécurité

⚠️ **Environnement de Démo**: Pour faciliter les tests, le système accepte actuellement **n'importe quel mot de passe** pour tous les comptes.

En production, il faudra:
1. Implémenter la vérification réelle des mots de passe hashés avec bcrypt
2. Forcer le changement de mot de passe à la première connexion
3. Activer les politiques de mots de passe forts
4. Mettre en place l'authentification à deux facteurs (2FA)

---

## 📊 Données de Test Disponibles

### Classes (10 au total)
- **CP1-A**: 12 élèves
- **CP2-A**: 10 élèves
- **CE1-A**: 10 élèves
- **CE2-A**: 10 élèves
- **CM1-A**: 10 élèves
- **CM2-A**: 15 élèves
- **6ème-A**: 3 élèves
- **5ème-A, 4ème-A, 3ème-A**: 0 élèves

**Total**: 70 élèves dans le système

### Noms des Élèves
Les élèves ont des prénoms bibliques/hébraïques (Abigail, Benjamin, David, Esther, Isaac, Rachel, Samuel, etc.) et des noms de famille ivoiriens (KOUAME, OUATTARA, KOFFI, KONE, BAMBA, DIABATE, TOURE, SANOGO, COULIBALY, YAO).

---

## 🧪 Test de Connexion

### Via cURL:
```bash
curl -X POST "https://kds-backend-api.perissosdigitals.workers.dev/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@kds-school.ci", "password": "test123"}'
```

### Réponse attendue:
```json
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": "admin-001",
    "email": "admin@kds-school.ci",
    "role": "admin",
    "firstName": "David",
    "lastName": "COHEN"
  }
}
```

---

## 🎯 Fonctionnalités Testables

Une fois connecté avec n'importe quel compte ci-dessus, vous pouvez tester:

### Module Gestion de Classes (6 onglets)
1. ✅ **Vue d'ensemble** - Informations générales
2. ✅ **Élèves** - Liste avec sélection multiple, export CSV, impression
3. ✅ **Présences** - Fiche d'appel quotidienne
4. ✅ **Emploi du temps** - Création/modification/suppression de cours
5. ✅ **Statistiques** - Répartition par genre et âge
6. ✅ **Notes** - Gestion des notes par trimestre et matière

### Autres Modules
- Gestion des Élèves
- Gestion des Enseignants
- Vie Scolaire
- Finances
- Inventaire
- Utilisateurs

---

## 📞 Support

Pour toute question ou problème de connexion, vérifiez:
1. L'email est correct (doit exister dans la base de données)
2. Le compte est actif (`is_active = 1`)
3. L'API backend est accessible

**Berakhot veShalom!** 🙏
