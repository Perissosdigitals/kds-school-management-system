-- ========================================================================
-- SCRIPT DE GÉNÉRATION D'EMPLOIS DU TEMPS DE TEST
-- Système Scolaire KDS - Emplois du temps réalistes
-- ========================================================================

-- Nettoyer les anciennes entrées
DELETE FROM timetable_slots;

-- Note: Ce script utilise le premier enseignant disponible pour toutes les matières
-- Dans un système réel, chaque matière aurait son propre enseignant spécialisé

-- ========================================================================
-- EMPLOI DU TEMPS POUR CM2-A (Primaire)
-- ========================================================================

-- Lundi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Lundi',
    '08:00',
    '10:00',
    '2024-2025',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Lundi',
    '10:15',
    '12:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Histoire-Géographie' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Lundi',
    '14:00',
    '15:30',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

-- Mardi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Mardi',
    '08:00',
    '10:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Sciences' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Mardi',
    '10:15',
    '12:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Sport' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'GYMNASE',
    'Mardi',
    '14:00',
    '15:30',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

-- Mercredi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Mercredi',
    '08:00',
    '10:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Torah' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Mercredi',
    '10:15',
    '12:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

-- Jeudi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Jeudi',
    '08:00',
    '10:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Jeudi',
    '10:15',
    '12:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Anglais' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Jeudi',
    '14:00',
    '15:30',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

-- Vendredi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Vendredi',
    '08:00',
    '10:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CM2-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Hébreu' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'B-201',
    'Vendredi',
    '10:15',
    '12:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CM2-A');

-- ========================================================================
-- EMPLOI DU TEMPS POUR CP-A (Primaire)
-- ========================================================================

-- Lundi - CP-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Lundi',
    '08:00',
    '09:30',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Lundi',
    '09:45',
    '11:15',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Sport' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'COUR',
    'Lundi',
    '14:00',
    '15:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

-- Mardi - CP-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Mardi',
    '08:00',
    '09:30',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Mardi',
    '09:45',
    '11:15',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Torah' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Mardi',
    '14:00',
    '15:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

-- Mercredi - CP-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Mercredi',
    '08:00',
    '09:30',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Sciences' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Mercredi',
    '09:45',
    '11:15',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

-- Jeudi - CP-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Jeudi',
    '08:00',
    '09:30',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Hébreu' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Jeudi',
    '09:45',
    '11:15',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Sport' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'COUR',
    'Jeudi',
    '14:00',
    '15:00',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

-- Vendredi - CP-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Vendredi',
    '08:00',
    '09:30',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, academic_year, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    (SELECT id FROM classes WHERE name = 'CP-A' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Torah' LIMIT 1),
    (SELECT id FROM teachers LIMIT 1),
    'A-101',
    'Vendredi',
    '09:45',
    '11:15',
    '2024-2025',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM classes WHERE name = 'CP-A');

-- ========================================================================
-- VÉRIFICATION DES EMPLOIS DU TEMPS CRÉÉS
-- ========================================================================

SELECT 
    c.name as classe,
    ts.day_of_week as jour,
    ts.start_time as debut,
    ts.end_time as fin,
    s.name as matiere,
    ts.room as salle
FROM timetable_slots ts
JOIN classes c ON ts.class_id = c.id
JOIN subjects s ON ts.subject_id = s.id
WHERE ts.is_active = true
ORDER BY c.name, 
    CASE ts.day_of_week 
        WHEN 'Lundi' THEN 1
        WHEN 'Mardi' THEN 2
        WHEN 'Mercredi' THEN 3
        WHEN 'Jeudi' THEN 4
        WHEN 'Vendredi' THEN 5
    END,
    ts.start_time;
