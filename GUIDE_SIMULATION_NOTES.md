# 🎓 GUIDE COMPLET - SIMULATION DES NOTES KSP SCHOOL

**Berakhot ve-Shalom** 🙏  
**Date**: 21 novembre 2025

---

## 📋 Table des Matières

1. [Résumé Exécutif](#résumé-exécutif)
2. [Fichiers Créés](#fichiers-créés)
3. [Ce Qui a Été Généré](#ce-qui-a-été-généré)
4. [Comment Utiliser](#comment-utiliser)
5. [Requêtes Essentielles](#requêtes-essentielles)
6. [Cas d'Usage](#cas-dusage)
7. [Maintenance](#maintenance)

---

## 📊 Résumé Exécutif

### Objectif Accompli

✅ **Simulation complète de notes** pour toutes les classes et années académiques  
✅ **14,385 notes générées** de manière réaliste  
✅ **46 matières créées** couvrant tous les niveaux (Primaire, Collège, Lycée)  
✅ **2 années académiques** (2023-2024, 2024-2025)  
✅ **3 trimestres** par année avec distribution équilibrée  
✅ **121 élèves évalués** avec notes cohérentes

### Résultats Clés

| Métrique | Valeur |
|----------|--------|
| **Moyenne générale** | 13.02/20 |
| **Notes par élève** | ~119 notes en moyenne |
| **Notes par trimestre** | ~4,800 notes |
| **Taux de réussite** | ~75% (notes ≥ 10) |

---

## 📁 Fichiers Créés

### 1. Script de Génération Principal
**Fichier**: `backend/seed-grades-simulation.sql`

**Contenu**:
- Création de 46 matières par niveau
- Fonction de génération de notes réalistes
- Boucle automatique sur toutes les classes/élèves
- Statistiques de vérification

**Exécution**:
```bash
cd backend
docker exec -i kds-postgres psql -U kds_admin -d kds_school_db < seed-grades-simulation.sql
```

### 2. Collection de Requêtes Utiles
**Fichier**: `backend/queries-notes-utiles.sql`

**Catégories de requêtes**:
1. Bulletins et moyennes individuelles
2. Classements et rankings
3. Statistiques par classe
4. Analyse temporelle (trimestres)
5. Détection d'élèves en difficulté
6. Analyse par type d'évaluation
7. Exports pour bulletins
8. Statistiques globales école

### 3. Rapport de Simulation
**Fichier**: `RAPPORT_SIMULATION_NOTES.md`

**Contenu**: Documentation complète avec statistiques, top élèves, moyennes par classe

### 4. Ce Guide
**Fichier**: `GUIDE_SIMULATION_NOTES.md`

---

## 🎯 Ce Qui a Été Généré

### Matières (46 au total)

#### Primaire
- **CP1-CP2** (5 matières): Français, Mathématiques, EPS, Arts, Éveil Scientifique
- **CE1-CE2** (7 matières): + Sciences, Histoire-Géo, Anglais
- **CM1-CM2** (8 matières chacun): + Éducation Civique, avec coefficients plus élevés

#### Collège
- **6ème à 3ème** (10 matières): Français, Maths, Anglais, Histoire-Géo, SVT, Physique-Chimie, Techno, EPS, Arts, Musique

#### Lycée
- **2nde à Tle** (8 matières): Français, Maths, PC, SVT, Histoire-Géo, Anglais, Philo, EPS

### Notes Générées

**Distribution par type**:
- **Devoirs**: 3,627 notes (moyenne 12.98)
- **Examens**: 3,623 notes (moyenne 13.04)
- **Interrogations**: 3,562 notes (moyenne 13.02)
- **Contrôle continu**: 3,505 notes (moyenne 13.04)
- **Oral**: 68 notes (moyenne 14.13)

**Caractéristiques**:
- Notes entre 0 et 20
- Distribution réaliste (suivant une courbe normale)
- Variance adaptée au type d'évaluation
- Commentaires pédagogiques automatiques
- Coefficients différenciés (Examen: 3.0, Devoir: 2.0, etc.)

### Années et Trimestres

**2023-2024**:
- 7,076 notes
- Moyenne: 13.02/20

**2024-2025**:
- 7,309 notes
- Moyenne: 13.03/20

**Trimestres équilibrés**:
- T1: 4,920 notes (13.05)
- T2: 4,718 notes (13.04)
- T3: 4,747 notes (12.99)

---

## 🚀 Comment Utiliser

### Accès Direct PostgreSQL

```bash
# Connexion à la base
docker exec -it kds-postgres psql -U kds_admin -d kds_school_db

# Une fois connecté
kds_school_db=#
```

### Exécution de Requêtes

#### 1. Bulletin d'un Élève

```bash
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    s.name as matiere,
    s.coefficient,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes
FROM grades g
JOIN subjects s ON g.subject_id = s.id
JOIN students st ON g.student_id = st.id
WHERE st.first_name = 'Lea' AND st.last_name = 'Kalfon'
AND g.academic_year = '2024-2025'
GROUP BY s.name, s.coefficient
ORDER BY moyenne DESC;
"
```

**Résultat attendu**:
```
     matiere      | coefficient | moyenne | nb_notes 
------------------+-------------+---------+----------
 Mathématiques    |         4.0 |   15.23 |       12
 Français         |         4.0 |   14.87 |       10
 ...
```

#### 2. Classement d'une Classe

```bash
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    RANK() OVER (ORDER BY AVG(g.value) DESC) as rang,
    st.first_name || ' ' || st.last_name as eleve,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes
FROM students st
JOIN grades g ON g.student_id = st.id
WHERE st.class_id = (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1)
AND g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name
ORDER BY rang
LIMIT 10;
"
```

#### 3. Statistiques Classe

```bash
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    c.name as classe,
    COUNT(DISTINCT st.id) as nb_eleves,
    COUNT(g.id) as total_notes,
    ROUND(AVG(g.value), 2) as moyenne_classe,
    ROUND(MIN(g.value), 2) as note_min,
    ROUND(MAX(g.value), 2) as note_max
FROM classes c
JOIN students st ON st.class_id = c.id
JOIN grades g ON g.student_id = st.id
WHERE c.name = 'CM2-A'
AND g.academic_year = '2024-2025'
GROUP BY c.id, c.name;
"
```

### Export CSV

```bash
# Export bulletin complet en CSV
docker exec kds-postgres psql -U kds_admin -d kds_school_db \
  -c "COPY (
    SELECT 
      st.first_name || ' ' || st.last_name as eleve,
      c.name as classe,
      s.name as matiere,
      g.value as note,
      g.evaluation_date as date
    FROM grades g
    JOIN students st ON g.student_id = st.id
    JOIN classes c ON st.class_id = c.id
    JOIN subjects s ON g.subject_id = s.id
    WHERE g.academic_year = '2024-2025'
    ORDER BY st.last_name, g.evaluation_date
  ) TO STDOUT WITH CSV HEADER" > notes_export.csv
```

---

## 🔍 Requêtes Essentielles

### Vue d'Ensemble

```sql
-- Statistiques globales
SELECT 
    COUNT(DISTINCT st.id) as eleves,
    COUNT(DISTINCT c.id) as classes,
    COUNT(g.id) as total_notes,
    ROUND(AVG(g.value), 2) as moyenne
FROM grades g
JOIN students st ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE g.academic_year = '2024-2025';
```

### Top Performers

```sql
-- Top 10 élèves
SELECT 
    RANK() OVER (ORDER BY AVG(g.value) DESC) as rang,
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    ROUND(AVG(g.value), 2) as moyenne
FROM students st
JOIN grades g ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name, c.name
HAVING COUNT(g.id) >= 10
ORDER BY rang
LIMIT 10;
```

### Élèves en Difficulté

```sql
-- Élèves avec moyenne < 10
SELECT 
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(CASE WHEN g.value < 10 THEN 1 END) as nb_echecs
FROM students st
JOIN grades g ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name, c.name
HAVING AVG(g.value) < 10
ORDER BY moyenne;
```

### Évolution Temporelle

```sql
-- Évolution par trimestre
SELECT 
    g.trimester,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes
FROM grades g
WHERE g.academic_year = '2024-2025'
GROUP BY g.trimester
ORDER BY 
    CASE g.trimester
        WHEN 'Premier trimestre' THEN 1
        WHEN 'Deuxième trimestre' THEN 2
        WHEN 'Troisième trimestre' THEN 3
    END;
```

### Performance par Matière

```sql
-- Moyennes par matière
SELECT 
    s.name as matiere,
    s.coefficient,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_evaluations
FROM grades g
JOIN subjects s ON g.subject_id = s.id
WHERE g.academic_year = '2024-2025'
GROUP BY s.id, s.name, s.coefficient
ORDER BY moyenne DESC
LIMIT 10;
```

---

## 💼 Cas d'Usage

### 1. Conseil de Classe

**Besoin**: Préparer le conseil de classe pour CM2-A, T1 2024-2025

```bash
# Statistiques globales classe
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    COUNT(DISTINCT st.id) as nb_eleves,
    ROUND(AVG(g.value), 2) as moyenne_classe,
    ROUND(MIN(g.value), 2) as note_min,
    ROUND(MAX(g.value), 2) as note_max,
    COUNT(CASE WHEN g.value >= 10 THEN 1 END) as notes_reussies,
    ROUND(
        COUNT(CASE WHEN g.value >= 10 THEN 1 END) * 100.0 / COUNT(g.id),
        1
    ) as taux_reussite
FROM students st
JOIN grades g ON g.student_id = st.id
WHERE st.class_id = (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1)
AND g.trimester = 'Premier trimestre'
AND g.academic_year = '2024-2025';
"

# Classement de la classe
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    RANK() OVER (ORDER BY AVG(g.value) DESC) as rang,
    st.first_name || ' ' || st.last_name as eleve,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(CASE WHEN g.value < 10 THEN 1 END) as nb_echecs
FROM students st
JOIN grades g ON g.student_id = st.id
WHERE st.class_id = (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1)
AND g.trimester = 'Premier trimestre'
AND g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name
ORDER BY rang;
"
```

### 2. Bulletin Scolaire Individuel

**Besoin**: Générer le bulletin complet de Lea Kalfon pour l'année 2024-2025

```bash
# Moyennes par matière et par trimestre
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    s.name as matiere,
    s.coefficient,
    g.trimester,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes
FROM grades g
JOIN subjects s ON g.subject_id = s.id
JOIN students st ON g.student_id = st.id
WHERE st.first_name = 'Lea' AND st.last_name = 'Kalfon'
AND g.academic_year = '2024-2025'
GROUP BY s.name, s.coefficient, g.trimester
ORDER BY s.name, 
    CASE g.trimester
        WHEN 'Premier trimestre' THEN 1
        WHEN 'Deuxième trimestre' THEN 2
        WHEN 'Troisième trimestre' THEN 3
    END;
"

# Moyenne générale annuelle
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    ROUND(AVG(g.value), 2) as moyenne_annuelle,
    COUNT(g.id) as total_evaluations,
    RANK() OVER (
        PARTITION BY st.class_id 
        ORDER BY AVG(g.value) DESC
    ) as rang_classe
FROM students st
JOIN grades g ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE st.first_name = 'Lea' AND st.last_name = 'Kalfon'
AND g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name, c.name, st.class_id;
"
```

### 3. Alerte Parents

**Besoin**: Identifier les élèves à signaler aux parents (moyenne < 10 ou baisse > 2 points)

```bash
# Élèves en échec scolaire
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    st.first_name || ' ' || st.last_name as eleve,
    st.phone as telephone_parent,
    c.name as classe,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(CASE WHEN g.value < 10 THEN 1 END) as nb_echecs,
    'URGENCE - Moyenne < 10' as alerte
FROM students st
JOIN grades g ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name, st.phone, c.name
HAVING AVG(g.value) < 10
ORDER BY moyenne;
"
```

### 4. Analyse Comparative

**Besoin**: Comparer les performances de toutes les classes CM2

```bash
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    c.name as classe,
    COUNT(DISTINCT st.id) as nb_eleves,
    ROUND(AVG(g.value), 2) as moyenne,
    ROUND(STDDEV(g.value), 2) as ecart_type,
    COUNT(CASE WHEN g.value >= 16 THEN 1 END) as nb_mentions_tb
FROM classes c
JOIN students st ON st.class_id = c.id
JOIN grades g ON g.student_id = st.id
WHERE c.level = 'CM2'
AND g.academic_year = '2024-2025'
GROUP BY c.id, c.name
ORDER BY moyenne DESC;
"
```

---

## 🔧 Maintenance

### Régénérer Toutes les Notes

```bash
# 1. Supprimer les notes existantes
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
TRUNCATE TABLE grades CASCADE;
"

# 2. Régénérer avec le script
cd /Users/apple/Desktop/kds-school-management-system/backend
docker exec -i kds-postgres psql -U kds_admin -d kds_school_db < seed-grades-simulation.sql
```

### Ajouter des Notes pour Une Classe Spécifique

```bash
# Insérer manuellement des notes
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
INSERT INTO grades (
    student_id,
    subject_id,
    teacher_id,
    evaluation_type,
    value,
    max_value,
    trimester,
    academic_year,
    evaluation_date,
    comments
) VALUES (
    (SELECT id FROM students WHERE first_name = 'Lea' AND last_name = 'Kalfon'),
    (SELECT id FROM subjects WHERE code = 'MATH-CM' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'Devoir',
    18.5,
    20,
    'Deuxième trimestre',
    '2024-2025',
    CURRENT_DATE,
    'Excellent travail en géométrie!'
);
"
```

### Vérifier l'Intégrité des Données

```bash
# Vérifier que tous les élèves ont des notes
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    COUNT(g.id) as nb_notes
FROM students st
JOIN classes c ON st.class_id = c.id
LEFT JOIN grades g ON g.student_id = st.id 
    AND g.academic_year = '2024-2025'
WHERE st.status = 'Actif'
GROUP BY st.id, st.first_name, st.last_name, c.name
HAVING COUNT(g.id) = 0;
"
```

### Backup des Notes

```bash
# Export complet en SQL
docker exec kds-postgres pg_dump -U kds_admin -d kds_school_db \
  --table=grades --inserts > backup_grades_$(date +%Y%m%d).sql

# Export en CSV
docker exec kds-postgres psql -U kds_admin -d kds_school_db \
  -c "COPY grades TO STDOUT WITH CSV HEADER" > backup_grades_$(date +%Y%m%d).csv
```

---

## 📞 Ressources

### Fichiers Référence
- **Script principal**: `backend/seed-grades-simulation.sql`
- **Requêtes utiles**: `backend/queries-notes-utiles.sql`
- **Rapport complet**: `RAPPORT_SIMULATION_NOTES.md`

### Commandes Rapides

```bash
# Connexion interactive
docker exec -it kds-postgres psql -U kds_admin -d kds_school_db

# Compter les notes
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "SELECT COUNT(*) FROM grades;"

# Voir les matières
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "SELECT name, code, grade_level FROM subjects ORDER BY grade_level, name;"

# Statistiques rapides
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    academic_year,
    COUNT(*) as total_notes,
    ROUND(AVG(value), 2) as moyenne
FROM grades
GROUP BY academic_year;
"
```

---

## ✅ Checklist d'Utilisation

- [ ] Script de génération exécuté avec succès
- [ ] 14,385 notes confirmées dans la base
- [ ] Requêtes de test validées
- [ ] Export CSV fonctionnel
- [ ] Bulletin test généré pour un élève
- [ ] Classement de classe vérifié
- [ ] Statistiques globales consultées

---

**Baruch HaShem!** 🙏

Tous les outils sont en place pour une simulation complète et réaliste du système de notation.

**Dernière mise à jour**: 21 novembre 2025
