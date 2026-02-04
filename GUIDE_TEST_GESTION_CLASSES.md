# 🧪 GUIDE DE TEST RAPIDE - GESTION DES CLASSES

## ✅ CHECKLIST DE VÉRIFICATION

### 1. Test Emploi du Temps (5 minutes)

#### Étape 1: Accès au module
- [ ] Ouvrir l'application: `http://localhost:5173`
- [ ] Cliquer sur "Gestion des Classes"
- [ ] Sélectionner n'importe quelle classe (ex: CP1, CM2, etc.)
- [ ] Cliquer sur l'onglet "Emploi du temps"

**✅ Résultat attendu**: Aucune erreur, affichage de l'emploi du temps (vide ou avec données)

#### Étape 2: Ajouter un cours
- [ ] Cliquer sur "Ajouter un cours"
- [ ] Remplir le formulaire:
  - Jour: Lundi
  - Matière: Mathématiques
  - Heure début: 08:00
  - Heure fin: 10:00
  - Salle: A101 (optionnel)
- [ ] Cliquer sur "Ajouter"

**✅ Résultat attendu**: Le cours apparaît dans la section "Lundi"

#### Étape 3: Vérifier la persistance
- [ ] Rafraîchir la page (F5)
- [ ] Retourner à la classe
- [ ] Vérifier que le cours est toujours là

**✅ Résultat attendu**: Le cours est toujours présent après rechargement

#### Étape 4: Modifier un cours
- [ ] Survoler un cours existant
- [ ] Cliquer sur l'icône "Modifier" (crayon)
- [ ] Changer l'heure de fin à 09:30
- [ ] Cliquer sur "Modifier"

**✅ Résultat attendu**: Le cours est mis à jour

#### Étape 5: Supprimer un cours
- [ ] Survoler un cours
- [ ] Cliquer sur l'icône "Supprimer" (poubelle)
- [ ] Confirmer la suppression

**✅ Résultat attendu**: Le cours disparaît

---

### 2. Test Présences (5 minutes)

#### Étape 1: Accès au module
- [ ] Dans la même classe, cliquer sur l'onglet "Présences"
- [ ] Vérifier que la date du jour est affichée

**✅ Résultat attendu**: Liste des élèves avec boutons de statut

#### Étape 2: Marquer les présences
- [ ] Marquer 3 élèves comme "Présent" (vert)
- [ ] Marquer 1 élève comme "Absent" (rouge)
- [ ] Marquer 1 élève comme "Retard" (orange)
- [ ] Marquer 1 élève comme "Justifié" (bleu)

**✅ Résultat attendu**: Les boutons changent de couleur selon le statut

#### Étape 3: Ajouter des remarques
- [ ] Pour l'élève absent, ajouter une remarque: "Malade"
- [ ] Pour l'élève en retard, ajouter: "Transport"

**✅ Résultat attendu**: Les champs de remarque apparaissent et acceptent le texte

#### Étape 4: Sauvegarder
- [ ] Cliquer sur "Enregistrer"
- [ ] Attendre le message de confirmation

**✅ Résultat attendu**: Message vert "✅ Fiche d'appel enregistrée avec succès"

#### Étape 5: Vérifier les statistiques
- [ ] Vérifier les compteurs en haut:
  - Présents: 3
  - Absents: 1
  - Retards: 1
  - Justifiés: 1
  - Marqués: 6/[total]

**✅ Résultat attendu**: Les statistiques correspondent aux marquages

#### Étape 6: Tester "Tous présents"
- [ ] Cliquer sur "Tous présents"
- [ ] Vérifier que tous les élèves sont marqués présents
- [ ] Cliquer sur "Enregistrer"

**✅ Résultat attendu**: Tous les statuts passent à "Présent"

---

## 🔍 VÉRIFICATION CONSOLE DÉVELOPPEUR

### Ouvrir la console
- Windows/Linux: `F12` ou `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

### Messages attendus (Emploi du temps)
```
📅 EMPLOI DU TEMPS chargé: X sessions
✅ ClassesService: Emploi du temps API chargé (X sessions)
```

### Messages attendus (Présences)
```
📝 Sauvegarde de la fiche d'appel: {...}
✅ Fiche d'appel sauvegardée avec succès
```

### ❌ Erreurs à NE PAS voir
```
TypeError: Cannot read properties of undefined (reading 'length')
TypeError: Cannot read properties of null
Uncaught Error
```

---

## 🐛 DÉPANNAGE RAPIDE

### Problème: Erreur "Cannot read properties of undefined"
**Solution**: 
1. Vérifier que les corrections ont été appliquées
2. Rafraîchir complètement le navigateur (Ctrl+F5)
3. Vider le cache du navigateur

### Problème: Emploi du temps ne se sauvegarde pas
**Vérifications**:
1. Backend est démarré: `http://localhost:3001/api/v1/health`
2. Console backend pour voir les requêtes
3. Vérifier que la matière sélectionnée existe

### Problème: Présences ne se sauvegardent pas
**Vérifications**:
1. Vérifier la console pour les erreurs API
2. Si message "sauvegardée localement", le backend n'est pas accessible
3. Vérifier que `recordedBy` a une valeur UUID valide

### Problème: Page blanche
**Solution**:
1. Ouvrir la console (F12)
2. Regarder les erreurs en rouge
3. Rafraîchir la page
4. Redémarrer le serveur de développement

---

## 📊 CRITÈRES DE SUCCÈS

### ✅ Module Stable si:
- [ ] Aucune erreur dans la console
- [ ] Emploi du temps s'affiche sans crash
- [ ] Ajout de cours fonctionne
- [ ] Modification de cours fonctionne
- [ ] Suppression de cours fonctionne
- [ ] Présences peuvent être marquées
- [ ] Présences se sauvegardent
- [ ] Statistiques s'affichent correctement
- [ ] Rechargement de page ne perd pas les données

### ⚠️ À investiguer si:
- [ ] Erreurs dans la console
- [ ] Données ne se sauvegardent pas
- [ ] Messages d'erreur API
- [ ] Lenteur excessive
- [ ] Données disparaissent au rechargement

---

## 🚀 COMMANDES UTILES

### Démarrer l'application
```bash
# Frontend
cd /Users/apple/Desktop/kds-school-management-system
npm run dev

# Backend (dans un autre terminal)
cd /Users/apple/Desktop/kds-school-management-system/backend
npm run start:dev
```

### Vérifier que tout fonctionne
```bash
# Frontend accessible
curl http://localhost:5173

# Backend accessible
curl http://localhost:3001/api/v1/health

# Base de données accessible
# (vérifier dans les logs du backend)
```

### Nettoyer et redémarrer
```bash
# Frontend
npm run dev

# Backend
cd backend
npm run start:dev
```

---

## 📞 CONTACT

Si tous les tests passent: **Mazel Tov!** 🎉

Si des problèmes persistent:
1. Noter l'erreur exacte de la console
2. Noter les étapes pour reproduire
3. Vérifier les logs du backend
4. Prendre une capture d'écran

**Berakhot!** 🙏
