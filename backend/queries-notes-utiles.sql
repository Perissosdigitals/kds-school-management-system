-- ========================================================================
-- 📊 REQUÊTES UTILES POUR ANALYSER LES NOTES - KDS SCHOOL
-- ========================================================================
-- Collection de requêtes SQL pour exploiter les données de simulation
-- Berakhot ve-Shalom! 🙏
-- ========================================================================

-- ========================================================================
-- 1. BULLETINS ET MOYENNES INDIVIDUELLES
-- ========================================================================

-- Bulletin complet d'un élève pour un trimestre
SELECT 
    s.name as matiere,
    s.coefficient,
    g.evaluation_type as type,
    g.value as note,
    g.evaluation_date as date,
    g.comments
FROM grades g
JOIN subjects s ON g.subject_id = s.id
JOIN students st ON g.student_id = st.id
WHERE st.first_name = 'Daniel' AND st.last_name = 'Cohen'
AND g.trimester = 'Premier trimestre'
AND g.academic_year = '2024-2025'
ORDER BY s.name, g.evaluation_date;

-- Moyennes par matière pour un élève
SELECT 
    s.name as matiere,
    s.coefficient,
    ROUND(AVG(g.value), 2) as moyenne,
    ROUND(AVG(g.value) * s.coefficient, 2) as moyenne_ponderee,
    COUNT(g.id) as nb_evaluations,
    ROUND(MIN(g.value), 2) as note_min,
    ROUND(MAX(g.value), 2) as note_max
FROM grades g
JOIN subjects s ON g.subject_id = s.id
JOIN students st ON g.student_id = st.id
WHERE st.id = (SELECT id FROM students WHERE first_name = 'Daniel' AND last_name = 'Cohen' LIMIT 1)
AND g.academic_year = '2024-2025'
GROUP BY s.name, s.coefficient
ORDER BY moyenne_ponderee DESC;

-- Moyenne générale pondérée d'un élève
SELECT 
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    g.academic_year as annee,
    ROUND(
        SUM(AVG(g.value) * s.coefficient) / SUM(s.coefficient),
        2
    ) as moyenne_generale_ponderee,
    COUNT(DISTINCT s.id) as nb_matieres,
    COUNT(g.id) as total_evaluations
FROM grades g
JOIN subjects s ON g.subject_id = s.id
JOIN students st ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE st.id = (SELECT id FROM students WHERE first_name = 'Daniel' AND last_name = 'Cohen' LIMIT 1)
AND g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name, c.name, g.academic_year;

-- Évolution des notes d'un élève dans une matière
SELECT 
    g.evaluation_date as date,
    g.evaluation_type as type,
    g.value as note,
    g.trimester,
    ROUND(AVG(g.value) OVER (
        ORDER BY g.evaluation_date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) as moyenne_mobile
FROM grades g
JOIN subjects s ON g.subject_id = s.id
JOIN students st ON g.student_id = st.id
WHERE st.first_name = 'Daniel' AND st.last_name = 'Cohen'
AND s.name = 'Mathématiques'
AND g.academic_year = '2024-2025'
ORDER BY g.evaluation_date;

-- ========================================================================
-- 2. CLASSEMENTS ET RANKINGS
-- ========================================================================

-- Classement général d'une classe
SELECT 
    RANK() OVER (ORDER BY AVG(g.value) DESC) as rang,
    st.first_name || ' ' || st.last_name as eleve,
    ROUND(AVG(g.value), 2) as moyenne_generale,
    COUNT(g.id) as nb_notes,
    ROUND(MIN(g.value), 2) as note_min,
    ROUND(MAX(g.value), 2) as note_max
FROM students st
JOIN grades g ON g.student_id = st.id
WHERE st.class_id = (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1)
AND g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name
ORDER BY rang;

-- Top 20 élèves toutes classes confondues
SELECT 
    RANK() OVER (ORDER BY AVG(g.value) DESC) as rang,
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    c.level as niveau,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes
FROM students st
JOIN grades g ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name, c.name, c.level
HAVING COUNT(g.id) >= 10  -- Au moins 10 notes
ORDER BY rang
LIMIT 20;

-- Meilleurs élèves par matière
SELECT 
    s.name as matiere,
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes
FROM grades g
JOIN subjects s ON g.subject_id = s.id
JOIN students st ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE g.academic_year = '2024-2025'
GROUP BY s.id, s.name, st.id, st.first_name, st.last_name, c.name
HAVING COUNT(g.id) >= 3  -- Au moins 3 notes dans la matière
ORDER BY s.name, moyenne DESC;

-- ========================================================================
-- 3. STATISTIQUES PAR CLASSE
-- ========================================================================

-- Tableau de bord complet d'une classe
SELECT 
    c.name as classe,
    c.level as niveau,
    COUNT(DISTINCT st.id) as nb_eleves,
    COUNT(g.id) as total_notes,
    ROUND(AVG(g.value), 2) as moyenne_classe,
    ROUND(STDDEV(g.value), 2) as ecart_type,
    ROUND(MIN(g.value), 2) as note_min,
    ROUND(MAX(g.value), 2) as note_max,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY g.value), 2) as mediane
FROM classes c
JOIN students st ON st.class_id = c.id
JOIN grades g ON g.student_id = st.id
WHERE c.name = 'CM2-A'
AND g.academic_year = '2024-2025'
GROUP BY c.id, c.name, c.level;

-- Performance par matière dans une classe
SELECT 
    s.name as matiere,
    s.coefficient,
    COUNT(g.id) as nb_evaluations,
    ROUND(AVG(g.value), 2) as moyenne,
    ROUND(MIN(g.value), 2) as note_min,
    ROUND(MAX(g.value), 2) as note_max,
    COUNT(CASE WHEN g.value >= 10 THEN 1 END) as nb_reussites,
    ROUND(
        COUNT(CASE WHEN g.value >= 10 THEN 1 END) * 100.0 / COUNT(g.id),
        1
    ) as taux_reussite
FROM grades g
JOIN subjects s ON g.subject_id = s.id
JOIN students st ON g.student_id = st.id
WHERE st.class_id = (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1)
AND g.academic_year = '2024-2025'
GROUP BY s.id, s.name, s.coefficient
ORDER BY moyenne DESC;

-- Comparaison des classes d'un même niveau
SELECT 
    c.name as classe,
    COUNT(DISTINCT st.id) as nb_eleves,
    ROUND(AVG(g.value), 2) as moyenne_classe,
    COUNT(g.id) as total_notes,
    ROUND(
        COUNT(CASE WHEN g.value >= 10 THEN 1 END) * 100.0 / COUNT(g.id),
        1
    ) as taux_reussite
FROM classes c
JOIN students st ON st.class_id = c.id
JOIN grades g ON g.student_id = st.id
WHERE c.level = 'CM2'
AND g.academic_year = '2024-2025'
GROUP BY c.id, c.name
ORDER BY moyenne_classe DESC;

-- ========================================================================
-- 4. ANALYSE TEMPORELLE (TRIMESTRES)
-- ========================================================================

-- Évolution des moyennes par trimestre
SELECT 
    g.trimester,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes,
    ROUND(STDDEV(g.value), 2) as ecart_type
FROM grades g
WHERE g.academic_year = '2024-2025'
GROUP BY g.trimester
ORDER BY 
    CASE g.trimester
        WHEN 'Premier trimestre' THEN 1
        WHEN 'Deuxième trimestre' THEN 2
        WHEN 'Troisième trimestre' THEN 3
    END;

-- Progression d'un élève sur les trimestres
SELECT 
    g.trimester,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes,
    ROUND(
        AVG(g.value) - LAG(AVG(g.value)) OVER (
            ORDER BY CASE g.trimester
                WHEN 'Premier trimestre' THEN 1
                WHEN 'Deuxième trimestre' THEN 2
                WHEN 'Troisième trimestre' THEN 3
            END
        ),
        2
    ) as progression
FROM grades g
JOIN students st ON g.student_id = st.id
WHERE st.first_name = 'Daniel' AND st.last_name = 'Cohen'
AND g.academic_year = '2024-2025'
GROUP BY g.trimester
ORDER BY 
    CASE g.trimester
        WHEN 'Premier trimestre' THEN 1
        WHEN 'Deuxième trimestre' THEN 2
        WHEN 'Troisième trimestre' THEN 3
    END;

-- Matières avec le plus de progression
SELECT 
    s.name as matiere,
    ROUND(AVG(CASE WHEN g.trimester = 'Premier trimestre' THEN g.value END), 2) as t1,
    ROUND(AVG(CASE WHEN g.trimester = 'Deuxième trimestre' THEN g.value END), 2) as t2,
    ROUND(AVG(CASE WHEN g.trimester = 'Troisième trimestre' THEN g.value END), 2) as t3,
    ROUND(
        AVG(CASE WHEN g.trimester = 'Troisième trimestre' THEN g.value END) -
        AVG(CASE WHEN g.trimester = 'Premier trimestre' THEN g.value END),
        2
    ) as progression_totale
FROM grades g
JOIN subjects s ON g.subject_id = s.id
WHERE g.academic_year = '2024-2025'
GROUP BY s.id, s.name
HAVING AVG(CASE WHEN g.trimester = 'Premier trimestre' THEN g.value END) IS NOT NULL
AND AVG(CASE WHEN g.trimester = 'Troisième trimestre' THEN g.value END) IS NOT NULL
ORDER BY progression_totale DESC;

-- ========================================================================
-- 5. DÉTECTION D'ÉLÈVES EN DIFFICULTÉ
-- ========================================================================

-- Élèves avec moyenne < 10
SELECT 
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes,
    COUNT(CASE WHEN g.value < 10 THEN 1 END) as nb_echecs,
    ROUND(
        COUNT(CASE WHEN g.value < 10 THEN 1 END) * 100.0 / COUNT(g.id),
        1
    ) as taux_echec
FROM students st
JOIN grades g ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name, c.name
HAVING AVG(g.value) < 10
ORDER BY moyenne;

-- Matières en échec pour un élève
SELECT 
    s.name as matiere,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes,
    COUNT(CASE WHEN g.value < 10 THEN 1 END) as nb_echecs
FROM grades g
JOIN subjects s ON g.subject_id = s.id
JOIN students st ON g.student_id = st.id
WHERE st.first_name = 'Daniel' AND st.last_name = 'Cohen'
AND g.academic_year = '2024-2025'
GROUP BY s.id, s.name
HAVING AVG(g.value) < 10
ORDER BY moyenne;

-- Élèves en baisse de performance
SELECT 
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    ROUND(AVG(CASE WHEN g.trimester = 'Premier trimestre' THEN g.value END), 2) as t1,
    ROUND(AVG(CASE WHEN g.trimester = 'Deuxième trimestre' THEN g.value END), 2) as t2,
    ROUND(AVG(CASE WHEN g.trimester = 'Troisième trimestre' THEN g.value END), 2) as t3,
    ROUND(
        AVG(CASE WHEN g.trimester = 'Troisième trimestre' THEN g.value END) -
        AVG(CASE WHEN g.trimester = 'Premier trimestre' THEN g.value END),
        2
    ) as evolution
FROM students st
JOIN grades g ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name, c.name
HAVING AVG(CASE WHEN g.trimester = 'Premier trimestre' THEN g.value END) IS NOT NULL
AND AVG(CASE WHEN g.trimester = 'Troisième trimestre' THEN g.value END) IS NOT NULL
AND AVG(CASE WHEN g.trimestre = 'Troisième trimestre' THEN g.value END) < 
    AVG(CASE WHEN g.trimester = 'Premier trimestre' THEN g.value END) - 2
ORDER BY evolution;

-- ========================================================================
-- 6. ANALYSE PAR TYPE D'ÉVALUATION
-- ========================================================================

-- Performance par type d'évaluation
SELECT 
    g.evaluation_type,
    COUNT(g.id) as nb_evaluations,
    ROUND(AVG(g.value), 2) as moyenne,
    ROUND(STDDEV(g.value), 2) as ecart_type,
    ROUND(MIN(g.value), 2) as note_min,
    ROUND(MAX(g.value), 2) as note_max
FROM grades g
WHERE g.academic_year = '2024-2025'
GROUP BY g.evaluation_type
ORDER BY moyenne DESC;

-- Meilleurs types d'évaluation par élève
SELECT 
    st.first_name || ' ' || st.last_name as eleve,
    g.evaluation_type,
    ROUND(AVG(g.value), 2) as moyenne,
    COUNT(g.id) as nb_notes
FROM grades g
JOIN students st ON g.student_id = st.id
WHERE st.first_name = 'Daniel' AND st.last_name = 'Cohen'
AND g.academic_year = '2024-2025'
GROUP BY st.id, st.first_name, st.last_name, g.evaluation_type
ORDER BY moyenne DESC;

-- ========================================================================
-- 7. EXPORTS POUR BULLETINS
-- ========================================================================

-- Export bulletin complet (format conseil de classe)
SELECT 
    st.first_name || ' ' || st.last_name as eleve,
    c.name as classe,
    s.name as matiere,
    s.coefficient,
    g.trimester,
    ROUND(AVG(g.value), 2) as moyenne,
    ROUND(AVG(g.value) * s.coefficient, 2) as moyenne_ponderee,
    COUNT(g.id) as nb_notes,
    string_agg(DISTINCT g.comments, ' | ') as commentaires
FROM students st
JOIN classes c ON st.class_id = c.id
JOIN grades g ON g.student_id = st.id
JOIN subjects s ON g.subject_id = s.id
WHERE c.name = 'CM2-A'
AND g.academic_year = '2024-2025'
AND g.trimester = 'Premier trimestre'
GROUP BY st.id, st.first_name, st.last_name, c.name, s.id, s.name, s.coefficient, g.trimester
ORDER BY st.last_name, st.first_name, s.name;

-- Relevé de notes complet CSV
SELECT 
    st.first_name || ' ' || st.last_name as "Élève",
    c.name as "Classe",
    s.name as "Matière",
    g.evaluation_type as "Type",
    g.value as "Note",
    g.max_value as "Sur",
    g.evaluation_date as "Date",
    g.trimester as "Trimestre",
    g.comments as "Commentaire"
FROM grades g
JOIN students st ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
JOIN subjects s ON g.subject_id = s.id
WHERE g.academic_year = '2024-2025'
ORDER BY st.last_name, st.first_name, g.evaluation_date;

-- ========================================================================
-- 8. STATISTIQUES GLOBALES ÉCOLE
-- ========================================================================

-- Statistiques générales
SELECT 
    'Statistiques Globales' as type,
    COUNT(DISTINCT st.id) as nb_eleves,
    COUNT(DISTINCT c.id) as nb_classes,
    COUNT(DISTINCT s.id) as nb_matieres,
    COUNT(g.id) as total_notes,
    ROUND(AVG(g.value), 2) as moyenne_ecole,
    ROUND(
        COUNT(CASE WHEN g.value >= 10 THEN 1 END) * 100.0 / COUNT(g.id),
        1
    ) as taux_reussite
FROM grades g
JOIN students st ON g.student_id = st.id
JOIN classes c ON st.class_id = c.id
JOIN subjects s ON g.subject_id = s.id
WHERE g.academic_year = '2024-2025';

-- Répartition des notes (histogramme)
SELECT 
    CASE 
        WHEN g.value >= 18 THEN '18-20 (Excellent)'
        WHEN g.value >= 16 THEN '16-18 (Très bien)'
        WHEN g.value >= 14 THEN '14-16 (Bien)'
        WHEN g.value >= 12 THEN '12-14 (Assez bien)'
        WHEN g.value >= 10 THEN '10-12 (Passable)'
        ELSE '0-10 (Insuffisant)'
    END as tranche,
    COUNT(g.id) as nb_notes,
    ROUND(COUNT(g.id) * 100.0 / SUM(COUNT(g.id)) OVER(), 1) as pourcentage
FROM grades g
WHERE g.academic_year = '2024-2025'
GROUP BY tranche
ORDER BY 
    CASE tranche
        WHEN '18-20 (Excellent)' THEN 1
        WHEN '16-18 (Très bien)' THEN 2
        WHEN '14-16 (Bien)' THEN 3
        WHEN '12-14 (Assez bien)' THEN 4
        WHEN '10-12 (Passable)' THEN 5
        ELSE 6
    END;

-- ========================================================================
-- 📝 NOTES D'UTILISATION
-- ========================================================================
-- 
-- Pour exécuter une requête:
-- docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "VOTRE_REQUETE"
--
-- Pour exporter en CSV:
-- docker exec kds-postgres psql -U kds_admin -d kds_school_db \
--   -c "COPY (VOTRE_REQUETE) TO STDOUT WITH CSV HEADER" > export.csv
--
-- Berakhot ve-Shalom! 🙏
-- ========================================================================
