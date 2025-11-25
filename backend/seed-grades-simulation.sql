-- ========================================================================
-- 📚 SCRIPT DE SIMULATION COMPLÈTE DES NOTES - KDS SCHOOL
-- ========================================================================
-- Génération automatique de notes pour toutes les classes
-- Années académiques: 2023-2024 et 2024-2025
-- Trimestres: Premier, Deuxième, Troisième
-- Berakhot ve-Shalom! 🙏
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. CRÉATION DES MATIÈRES PAR NIVEAU
-- ========================================================================

-- Nettoyage des données existantes (optionnel)
-- TRUNCATE TABLE grades CASCADE;
-- TRUNCATE TABLE subjects CASCADE;

-- Matières Primaire (CP1, CP2, CE1, CE2, CM1, CM2)
INSERT INTO subjects (id, name, code, description, grade_level, weekly_hours, coefficient, color, is_active) VALUES
-- CP1-CP2
(gen_random_uuid(), 'Français', 'FR-CP', 'Lecture, écriture et expression orale', 'CP1', 8, 3.0, '#EF4444', true),
(gen_random_uuid(), 'Mathématiques', 'MATH-CP', 'Numération, calcul et géométrie', 'CP1', 6, 3.0, '#3B82F6', true),
(gen_random_uuid(), 'Éducation Physique', 'EPS-CP', 'Sport et motricité', 'CP1', 3, 1.0, '#10B981', true),
(gen_random_uuid(), 'Arts Plastiques', 'ART-CP', 'Dessin et créativité', 'CP1', 2, 1.0, '#F59E0B', true),
(gen_random_uuid(), 'Éveil Scientifique', 'SCI-CP', 'Découverte du monde', 'CP1', 2, 1.0, '#8B5CF6', true),

-- CE1-CE2
(gen_random_uuid(), 'Français', 'FR-CE', 'Grammaire, conjugaison, orthographe', 'CE1', 8, 3.0, '#EF4444', true),
(gen_random_uuid(), 'Mathématiques', 'MATH-CE', 'Opérations et problèmes', 'CE1', 6, 3.0, '#3B82F6', true),
(gen_random_uuid(), 'Sciences', 'SCI-CE', 'Sciences de la vie et de la terre', 'CE1', 3, 2.0, '#8B5CF6', true),
(gen_random_uuid(), 'Histoire-Géographie', 'HG-CE', 'Découverte du monde', 'CE1', 3, 2.0, '#F97316', true),
(gen_random_uuid(), 'Éducation Physique', 'EPS-CE', 'Sport et santé', 'CE1', 3, 1.0, '#10B981', true),
(gen_random_uuid(), 'Arts', 'ART-CE', 'Arts plastiques et musique', 'CE1', 2, 1.0, '#F59E0B', true),
(gen_random_uuid(), 'Anglais', 'ANG-CE', 'Initiation à l''anglais', 'CE1', 2, 1.5, '#EC4899', true),

-- CM1-CM2
(gen_random_uuid(), 'Français', 'FR-CM', 'Littérature et expression écrite', 'CM1', 8, 4.0, '#EF4444', true),
(gen_random_uuid(), 'Mathématiques', 'MATH-CM', 'Calcul mental et résolution', 'CM1', 7, 4.0, '#3B82F6', true),
(gen_random_uuid(), 'Sciences', 'SCI-CM', 'Physique, chimie, SVT', 'CM1', 4, 3.0, '#8B5CF6', true),
(gen_random_uuid(), 'Histoire-Géographie', 'HG-CM', 'Histoire de la Côte d''Ivoire', 'CM1', 4, 3.0, '#F97316', true),
(gen_random_uuid(), 'Anglais', 'ANG-CM', 'Conversation et grammaire', 'CM1', 3, 2.0, '#EC4899', true),
(gen_random_uuid(), 'Éducation Civique', 'EC-CM', 'Citoyenneté et valeurs', 'CM1', 2, 2.0, '#14B8A6', true),
(gen_random_uuid(), 'Éducation Physique', 'EPS-CM', 'Sport et compétition', 'CM1', 3, 1.0, '#10B981', true),
(gen_random_uuid(), 'Arts', 'ART-CM', 'Arts et culture', 'CM1', 2, 1.0, '#F59E0B', true),

-- CM2 (même matières que CM1)
(gen_random_uuid(), 'Français', 'FR-CM2', 'Littérature et expression écrite', 'CM2', 8, 4.0, '#EF4444', true),
(gen_random_uuid(), 'Mathématiques', 'MATH-CM2', 'Calcul mental et résolution', 'CM2', 7, 4.0, '#3B82F6', true),
(gen_random_uuid(), 'Sciences', 'SCI-CM2', 'Physique, chimie, SVT', 'CM2', 4, 3.0, '#8B5CF6', true),
(gen_random_uuid(), 'Histoire-Géographie', 'HG-CM2', 'Histoire de la Côte d''Ivoire', 'CM2', 4, 3.0, '#F97316', true),
(gen_random_uuid(), 'Anglais', 'ANG-CM2', 'Conversation et grammaire', 'CM2', 3, 2.0, '#EC4899', true),
(gen_random_uuid(), 'Éducation Civique', 'EC-CM2', 'Citoyenneté et valeurs', 'CM2', 2, 2.0, '#14B8A6', true),
(gen_random_uuid(), 'Éducation Physique', 'EPS-CM2', 'Sport et compétition', 'CM2', 3, 1.0, '#10B981', true),
(gen_random_uuid(), 'Arts', 'ART-CM2', 'Arts et culture', 'CM2', 2, 1.0, '#F59E0B', true),

-- Matières Collège (6ème, 5ème, 4ème, 3ème)
(gen_random_uuid(), 'Français', 'FR-6', 'Langue et littérature', '6ème', 5, 4.0, '#EF4444', true),
(gen_random_uuid(), 'Mathématiques', 'MATH-6', 'Algèbre et géométrie', '6ème', 5, 4.0, '#3B82F6', true),
(gen_random_uuid(), 'Anglais', 'ANG-6', 'LV1', '6ème', 4, 3.0, '#EC4899', true),
(gen_random_uuid(), 'Histoire-Géographie', 'HG-6', 'Histoire ancienne', '6ème', 4, 3.0, '#F97316', true),
(gen_random_uuid(), 'SVT', 'SVT-6', 'Sciences de la vie', '6ème', 3, 2.0, '#8B5CF6', true),
(gen_random_uuid(), 'Physique-Chimie', 'PC-6', 'Sciences physiques', '6ème', 3, 2.0, '#06B6D4', true),
(gen_random_uuid(), 'Technologie', 'TECH-6', 'Sciences de l''ingénieur', '6ème', 2, 2.0, '#84CC16', true),
(gen_random_uuid(), 'Éducation Physique', 'EPS-6', 'Sport collectif', '6ème', 3, 1.0, '#10B981', true),
(gen_random_uuid(), 'Arts Plastiques', 'ART-6', 'Dessin et peinture', '6ème', 2, 1.0, '#F59E0B', true),
(gen_random_uuid(), 'Musique', 'MUS-6', 'Éducation musicale', '6ème', 1, 1.0, '#A855F7', true),

-- Matières Lycée (2nde, 1ère, Tle)
(gen_random_uuid(), 'Français', 'FR-2', 'Littérature française', '2nde', 4, 4.0, '#EF4444', true),
(gen_random_uuid(), 'Mathématiques', 'MATH-2', 'Fonctions et statistiques', '2nde', 5, 4.0, '#3B82F6', true),
(gen_random_uuid(), 'Physique-Chimie', 'PC-2', 'Sciences expérimentales', '2nde', 4, 3.0, '#06B6D4', true),
(gen_random_uuid(), 'SVT', 'SVT-2', 'Biologie et géologie', '2nde', 3, 3.0, '#8B5CF6', true),
(gen_random_uuid(), 'Histoire-Géographie', 'HG-2', 'Histoire contemporaine', '2nde', 3, 3.0, '#F97316', true),
(gen_random_uuid(), 'Anglais', 'ANG-2', 'LV1', '2nde', 3, 3.0, '#EC4899', true),
(gen_random_uuid(), 'Philosophie', 'PHILO-2', 'Introduction à la philosophie', '2nde', 2, 2.0, '#6366F1', true),
(gen_random_uuid(), 'Éducation Physique', 'EPS-2', 'Sport et santé', '2nde', 2, 1.0, '#10B981', true)

ON CONFLICT (code) DO NOTHING;

-- ========================================================================
-- 2. FONCTION DE GÉNÉRATION DE NOTES ALÉATOIRES RÉALISTES
-- ========================================================================

CREATE OR REPLACE FUNCTION generate_realistic_grade(
    base_level DECIMAL,  -- Niveau de base de l'élève (10-18)
    variance DECIMAL     -- Variance possible (1-3)
) RETURNS DECIMAL AS $$
DECLARE
    grade DECIMAL;
    random_factor DECIMAL;
BEGIN
    -- Génère un facteur aléatoire entre -variance et +variance
    random_factor := (random() * 2 - 1) * variance;
    
    -- Calcule la note finale
    grade := base_level + random_factor;
    
    -- S'assure que la note est entre 0 et 20
    grade := GREATEST(0, LEAST(20, grade));
    
    -- Arrondit à 2 décimales
    RETURN ROUND(grade, 2);
END;
$$ LANGUAGE plpgsql;

-- ========================================================================
-- 3. GÉNÉRATION DES NOTES POUR TOUTES LES CLASSES
-- ========================================================================

-- Variable pour stocker les IDs des enseignants
DO $$
DECLARE
    v_teacher_id UUID;
    v_student_rec RECORD;
    v_subject_rec RECORD;
    v_class_rec RECORD;
    v_academic_year VARCHAR(10);
    v_trimester VARCHAR(30);
    v_eval_type VARCHAR(30);
    v_eval_types VARCHAR(30)[] := ARRAY['Devoir', 'Interrogation', 'Examen', 'Contrôle continu'];
    v_trimesters VARCHAR(30)[] := ARRAY['Premier trimestre', 'Deuxième trimestre', 'Troisième trimestre'];
    v_base_performance DECIMAL;
    v_student_level DECIMAL;
    v_eval_date DATE;
    v_grade_value DECIMAL;
    v_comment TEXT;
    v_comments TEXT[] := ARRAY[
        'Très bon travail, continuez ainsi!',
        'Bon travail, des progrès notables',
        'Travail satisfaisant',
        'Peut mieux faire, plus de rigueur nécessaire',
        'Résultats insuffisants, redoubler d''efforts',
        'Excellent! Félicitations!',
        'Bien, mais attention aux détails',
        '努力が必要です (plus d''efforts nécessaires)',
        'Encourageant, poursuivez vos efforts',
        'Résultat moyen, participation en classe à améliorer'
    ];
    v_eval_count INTEGER;
    v_class_year_match BOOLEAN;
BEGIN
    -- Récupérer un enseignant par défaut
    SELECT id INTO v_teacher_id FROM teachers LIMIT 1;
    
    RAISE NOTICE '🎓 Début de la génération des notes pour toutes les classes...';
    
    -- Boucle sur les années académiques
    FOR v_academic_year IN SELECT unnest(ARRAY['2023-2024', '2024-2025'])
    LOOP
        RAISE NOTICE '📅 Année académique: %', v_academic_year;
        
        -- Boucle sur toutes les classes
        FOR v_class_rec IN 
            SELECT id, name, level, academic_year 
            FROM classes 
            WHERE is_active = true
        LOOP
            -- Vérifier si la classe correspond à l'année académique
            v_class_year_match := (v_class_rec.academic_year = v_academic_year);
            
            IF NOT v_class_year_match AND v_academic_year = '2024-2025' THEN
                CONTINUE; -- Skip si l'année ne correspond pas
            END IF;
            
            RAISE NOTICE '🏫 Classe: % (%) - Année: %', v_class_rec.name, v_class_rec.level, v_academic_year;
            
            -- Boucle sur les matières correspondant au niveau de la classe
            FOR v_subject_rec IN 
                SELECT id, name, code, grade_level 
                FROM subjects 
                WHERE grade_level = v_class_rec.level 
                AND is_active = true
            LOOP
                RAISE NOTICE '  📚 Matière: % (%)', v_subject_rec.name, v_subject_rec.code;
                
                -- Boucle sur les trimestres
                FOR v_trimester IN SELECT unnest(v_trimesters)
                LOOP
                    RAISE NOTICE '    📊 Trimestre: %', v_trimester;
                    
                    -- Boucle sur les élèves de la classe
                    FOR v_student_rec IN 
                        SELECT id, first_name, last_name 
                        FROM students 
                        WHERE class_id = v_class_rec.id 
                        AND status = 'Actif'
                    LOOP
                        -- Définir le niveau de performance de l'élève (entre 8 et 18)
                        v_student_level := 8 + (random() * 10);
                        
                        -- Générer 2 à 4 évaluations par trimestre
                        v_eval_count := 2 + floor(random() * 3)::INTEGER;
                        
                        FOR i IN 1..v_eval_count
                        LOOP
                            -- Type d'évaluation aléatoire
                            v_eval_type := v_eval_types[1 + floor(random() * array_length(v_eval_types, 1))::INTEGER];
                            
                            -- Date d'évaluation dans le trimestre
                            CASE v_trimester
                                WHEN 'Premier trimestre' THEN
                                    v_eval_date := (substring(v_academic_year, 1, 4) || '-09-15')::DATE + (random() * 60)::INTEGER;
                                WHEN 'Deuxième trimestre' THEN
                                    v_eval_date := (substring(v_academic_year, 1, 4) || '-12-10')::DATE + (random() * 60)::INTEGER;
                                WHEN 'Troisième trimestre' THEN
                                    v_eval_date := (substring(v_academic_year, 6, 4) || '-04-15')::DATE + (random() * 60)::INTEGER;
                            END CASE;
                            
                            -- Générer une note réaliste
                            v_grade_value := generate_realistic_grade(
                                v_student_level,
                                CASE v_eval_type
                                    WHEN 'Examen' THEN 2.5
                                    WHEN 'Devoir' THEN 3.0
                                    WHEN 'Interrogation' THEN 2.0
                                    ELSE 2.5
                                END
                            );
                            
                            -- Commentaire selon la note
                            v_comment := CASE
                                WHEN v_grade_value >= 16 THEN v_comments[1 + floor(random() * 2)::INTEGER]
                                WHEN v_grade_value >= 14 THEN v_comments[2 + floor(random() * 2)::INTEGER]
                                WHEN v_grade_value >= 12 THEN v_comments[3 + floor(random() * 2)::INTEGER]
                                WHEN v_grade_value >= 10 THEN v_comments[4 + floor(random() * 2)::INTEGER]
                                ELSE v_comments[5 + floor(random() * 2)::INTEGER]
                            END;
                            
                            -- Insérer la note
                            INSERT INTO grades (
                                id,
                                student_id,
                                subject_id,
                                teacher_id,
                                evaluation_type,
                                value,
                                max_value,
                                trimester,
                                academic_year,
                                evaluation_date,
                                title,
                                coefficient,
                                comments,
                                visible_to_parents,
                                created_at,
                                updated_at
                            ) VALUES (
                                gen_random_uuid(),
                                v_student_rec.id,
                                v_subject_rec.id,
                                v_teacher_id,
                                v_eval_type,
                                v_grade_value,
                                20,
                                v_trimester,
                                v_academic_year,
                                v_eval_date,
                                v_eval_type || ' - ' || v_subject_rec.name,
                                CASE v_eval_type
                                    WHEN 'Examen' THEN 3.0
                                    WHEN 'Devoir' THEN 2.0
                                    WHEN 'Interrogation' THEN 1.0
                                    ELSE 1.5
                                END,
                                v_comment,
                                true,
                                NOW(),
                                NOW()
                            );
                            
                        END LOOP;
                    END LOOP;
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '✅ Génération terminée avec succès! Baruch HaShem!';
END $$;

-- ========================================================================
-- 4. STATISTIQUES ET VÉRIFICATION
-- ========================================================================

-- Compter les notes générées
SELECT 
    '📊 STATISTIQUES DES NOTES GÉNÉRÉES' as titre,
    COUNT(*) as total_notes,
    COUNT(DISTINCT student_id) as eleves_notes,
    COUNT(DISTINCT subject_id) as matieres_evaluees,
    COUNT(DISTINCT academic_year) as annees_academiques
FROM grades;

-- Notes par année académique
SELECT 
    academic_year as annee,
    COUNT(*) as nombre_notes,
    ROUND(AVG(value), 2) as moyenne_generale,
    ROUND(MIN(value), 2) as note_minimale,
    ROUND(MAX(value), 2) as note_maximale
FROM grades
GROUP BY academic_year
ORDER BY academic_year;

-- Notes par trimestre
SELECT 
    trimester as trimestre,
    COUNT(*) as nombre_notes,
    ROUND(AVG(value), 2) as moyenne
FROM grades
GROUP BY trimester
ORDER BY 
    CASE trimester
        WHEN 'Premier trimestre' THEN 1
        WHEN 'Deuxième trimestre' THEN 2
        WHEN 'Troisième trimestre' THEN 3
    END;

-- Notes par type d'évaluation
SELECT 
    evaluation_type as type_evaluation,
    COUNT(*) as nombre,
    ROUND(AVG(value), 2) as moyenne
FROM grades
GROUP BY evaluation_type
ORDER BY nombre DESC;

-- Top 10 des meilleures moyennes par élève
SELECT 
    s.first_name || ' ' || s.last_name as eleve,
    c.name as classe,
    ROUND(AVG(g.value), 2) as moyenne_generale,
    COUNT(g.id) as nombre_notes
FROM grades g
JOIN students s ON g.student_id = s.id
JOIN classes c ON s.class_id = c.id
GROUP BY s.id, s.first_name, s.last_name, c.name
ORDER BY moyenne_generale DESC
LIMIT 10;

-- Moyennes par classe
SELECT 
    c.name as classe,
    c.level as niveau,
    COUNT(g.id) as total_notes,
    ROUND(AVG(g.value), 2) as moyenne_classe
FROM classes c
JOIN students s ON s.class_id = c.id
JOIN grades g ON g.student_id = s.id
GROUP BY c.id, c.name, c.level
ORDER BY c.level, c.name;

COMMIT;

-- ========================================================================
-- 📝 NOTES D'UTILISATION
-- ========================================================================
-- 
-- Pour exécuter ce script:
-- docker exec -i kds-postgres psql -U kds_admin -d kds_school_db < seed-grades-simulation.sql
--
-- Pour nettoyer et régénérer:
-- docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "TRUNCATE TABLE grades CASCADE;"
-- docker exec -i kds-postgres psql -U kds_admin -d kds_school_db < seed-grades-simulation.sql
--
-- Baruch HaShem! 🙏
-- ========================================================================
