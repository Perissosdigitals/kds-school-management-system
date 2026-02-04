# 🎯 GUIDE DE TEST RAPIDE - Persistence Frontend

**Date**: 22 Janvier 2026  
**Objectif**: Vérifier que les données d'attendance persistent après rafraîchissement

---

## 🔑 Identifiants de Test

```
Email: admin@ksp-school.ci
Mot de passe: admin123
Rôle: 👑 Fondatrice
```

---

## ✅ Test en 5 Minutes

### Étape 1: Ouvrir l'Application (30 secondes)

1. Ouvrez votre navigateur
2. Allez sur: **http://localhost:5173**
3. Ouvrez la Console Développeur: **F12** (ou Cmd+Option+I sur Mac)
4. Allez dans l'onglet **"Console"**

---

### Étape 2: Login (30 secondes)

1. Entrez les identifiants:
   - Email: `admin@ksp-school.ci`
   - Mot de passe: `admin123`
2. Cliquez "Se connecter"
3. Vous devriez voir le Dashboard

---

### Étape 3: Aller à la Fiche d'Appel (1 minute)

1. Dans le menu de gauche, cliquez **"Gestion des Classes"**
2. Sélectionnez une classe (ex: **CP1**)
3. Cliquez sur l'onglet **"Présences"**
4. Sélectionnez la date d'aujourd'hui
5. Sélectionnez la session **"Matin"**

---

### Étape 4: Observer les Logs (1 minute)

**Dans la Console, vous devriez voir**:

```
[AttendanceDailyEntry] 🔄 Loading attendance for class=xxx, date=2026-01-22, session=morning
[AttendanceDailyEntry] ✅ Loaded 18 attendance records: [...]
[Attendance] Student: ALLEBY ELIE-SCHAMA, Status: "Absent"
[Attendance] Student: AYAWA DJIPRO, Status: "Présent"
[Attendance] Student: BA ARIELLE SORAYA, Status: "Présent"
...
```

✅ **Si vous voyez ces logs**: Les données sont chargées correctement!

❌ **Si vous ne voyez rien**: Il y a un problème de connexion backend

---

### Étape 5: Tester la Persistence (2 minutes)

1. **Marquer des présences**:
   - Cliquez sur "Tous présents" (pour réinitialiser)
   - Marquez **2-3 élèves comme "Absent"** (bouton rouge)
   - Marquez **1 élève comme "Retard"** (bouton jaune)
   - Entrez une heure pour le retard (ex: 08:30)

2. **Sauvegarder**:
   - Cliquez le bouton **"Enregistrer les présences"**
   - Attendez le message de succès vert

3. **Rafraîchir la page**:
   - Appuyez sur **F5** (ou Cmd+R sur Mac)
   - Ou fermez et rouvrez l'onglet

4. **Vérifier**:
   - Retournez dans "Gestion des Classes" → CP1 → Présences
   - **Les statuts doivent être conservés** ✅
   - Les élèves marqués "Absent" doivent avoir le bouton rouge actif
   - L'élève marqué "Retard" doit avoir le bouton jaune actif avec l'heure

---

## 🎯 Résultats Attendus

### ✅ Succès
- Les logs apparaissent dans la console
- Les statuts sont affichés correctement
- Après F5, les données persistent
- Pas de "flash" de tous présents

### ❌ Échec
Si les données ne persistent pas:

1. **Vérifiez la console** pour les erreurs
2. **Vérifiez l'onglet Network**:
   - Filtrez par "attendance"
   - Cliquez sur la requête `POST /attendance/bulk`
   - Vérifiez que le status est 200 ou 201
   - Cliquez sur la requête `GET /attendance/daily/...`
   - Vérifiez que les données retournées contiennent les bons statuts

3. **Partagez**:
   - Screenshot de la console
   - Screenshot de l'onglet Network
   - Message d'erreur si présent

---

## 🔍 Debugging Rapide

### Problème: Aucun log dans la console

**Cause**: Le composant ne se charge pas

**Solution**:
```javascript
// Dans la console navigateur, tapez:
console.log("Test");
```
Si ça n'affiche rien, rechargez la page.

---

### Problème: Logs montrent "0 records"

**Cause**: Aucune donnée d'attendance pour cette date/classe

**Solution**: C'est normal si c'est la première fois. Créez des données en marquant des présences.

---

### Problème: Status toujours "Présent" après reload

**Cause**: Mapping de status incorrect

**Solution**: Vérifiez dans la console:
```
[Attendance] Student: XXX, Status: "???"
```
Si Status = "present" (minuscule anglais) au lieu de "Présent" (français), il y a un problème de mapping.

---

## 📊 Checklist de Validation

- [ ] Backend tourne (http://localhost:3002)
- [ ] Frontend tourne (http://localhost:5173)
- [ ] Login réussi avec admin@ksp-school.ci
- [ ] Navigation vers Fiche d'appel réussie
- [ ] Logs apparaissent dans la console
- [ ] Données chargées correctement
- [ ] Sauvegarde réussie (message vert)
- [ ] Données persistent après F5 ✅

---

## 🎉 Si Tout Fonctionne

**Félicitations!** Le problème de persistence est résolu.

**Prochaines étapes**:
1. Tester sur d'autres classes
2. Tester avec d'autres utilisateurs (enseignants)
3. Vérifier les autres modules (Students, Classes, etc.)

---

## 🆘 Si Problème Persiste

**Contactez avec**:
1. Screenshot de la console (avec les logs)
2. Screenshot de l'onglet Network
3. Description exacte du problème
4. Étapes pour reproduire

---

**Berakhot ve-Hatzlakha!** 🙏

*Test rapide - 5 minutes maximum*
