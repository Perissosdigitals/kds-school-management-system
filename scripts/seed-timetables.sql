-- ========================================================================
-- SCRIPT DE GÉNÉRATION D'EMPLOIS DU TEMPS DE TEST
-- Système Scolaire KDS - Emplois du temps réalistes
-- ========================================================================

-- Nettoyer les anciennes entrées
DELETE FROM timetable_slots;

-- Variables pour faciliter la maintenance
-- On récupère les IDs directement depuis les tables

-- ========================================================================
-- EMPLOI DU TEMPS POUR CM2-A (Primaire)
-- ========================================================================

-- Lundi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-lun-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'A-101',
    'Lundi',
    '08:00',
    '09:30',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-lun-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'A-101',
    'Lundi',
    '09:45',
    '11:15',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-lun-3', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Histoire-Géographie' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-8' LIMIT 1),
    'A-101',
    'Lundi',
    '11:30',
    '13:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-lun-4', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Anglais' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'A-101',
    'Lundi',
    '14:30',
    '16:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

-- Mardi - 6ème-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-mar-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Sciences et Vie de la Terre' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-8' LIMIT 1),
    'LAB-1',
    'Mardi',
    '08:00',
    '09:30',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-mar-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'A-101',
    'Mardi',
    '09:45',
    '11:15',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-mar-3', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Éducation Physique et Sportive' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'GYMNASE',
    'Mardi',
    '11:30',
    '13:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-mar-4', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'A-101',
    'Mardi',
    '14:30',
    '16:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

-- Mercredi - 6ème-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-mer-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Anglais' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'A-101',
    'Mercredi',
    '08:00',
    '09:30',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-mer-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Arts Plastiques' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-8' LIMIT 1),
    'A-203',
    'Mercredi',
    '09:45',
    '11:15',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

-- Jeudi - 6ème-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-jeu-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Physique-Chimie' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-8' LIMIT 1),
    'LAB-2',
    'Jeudi',
    '08:00',
    '09:30',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-jeu-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'A-101',
    'Jeudi',
    '09:45',
    '11:15',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-jeu-3', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'A-101',
    'Jeudi',
    '11:30',
    '13:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-jeu-4', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Informatique' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'SALLE-INFO',
    'Jeudi',
    '14:30',
    '16:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

-- Vendredi - 6ème-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-ven-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Histoire-Géographie' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-8' LIMIT 1),
    'A-101',
    'Vendredi',
    '08:00',
    '09:30',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-ven-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Anglais' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'A-101',
    'Vendredi',
    '09:45',
    '11:15',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-6a-ven-3', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Éducation Civique et Morale' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'A-101',
    'Vendredi',
    '11:30',
    '13:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = '6ème-A' LIMIT 1;

-- ========================================================================
-- EMPLOI DU TEMPS POUR CM2-A (Primaire)
-- ========================================================================

-- Lundi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-lun-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'B-201',
    'Lundi',
    '08:00',
    '10:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-lun-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'B-201',
    'Lundi',
    '10:15',
    '12:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-lun-3', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Histoire-Géographie' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-8' LIMIT 1),
    'B-201',
    'Lundi',
    '14:00',
    '15:30',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

-- Mardi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-mar-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'B-201',
    'Mardi',
    '08:00',
    '10:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-mar-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Sciences et Vie de la Terre' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-8' LIMIT 1),
    'B-201',
    'Mardi',
    '10:15',
    '12:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-mar-3', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Éducation Physique et Sportive' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'COUR-RECRE',
    'Mardi',
    '14:00',
    '15:30',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

-- Mercredi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-mer-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'B-201',
    'Mercredi',
    '08:00',
    '10:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-mer-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Arts Plastiques' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-8' LIMIT 1),
    'B-201',
    'Mercredi',
    '10:15',
    '12:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

-- Jeudi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-jeu-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Français' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'B-201',
    'Jeudi',
    '08:00',
    '10:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-jeu-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'B-201',
    'Jeudi',
    '10:15',
    '12:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-jeu-3', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Anglais' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'B-201',
    'Jeudi',
    '14:00',
    '15:30',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

-- Vendredi - CM2-A
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-ven-1', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Mathématiques' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'B-201',
    'Vendredi',
    '08:00',
    '10:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-ven-2', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Éducation Civique et Morale' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-7' LIMIT 1),
    'B-201',
    'Vendredi',
    '10:15',
    '12:00',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at)
SELECT 
    'tt-cm2a-ven-3', 
    c.id, 
    (SELECT id FROM subjects WHERE name = 'Informatique' LIMIT 1),
    (SELECT id FROM teachers WHERE user_id = 'user-6' LIMIT 1),
    'SALLE-INFO',
    'Vendredi',
    '14:00',
    '15:30',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM classes c WHERE c.name = 'CM2-A' LIMIT 1;

-- ========================================================================
-- VÉRIFICATION DES EMPLOIS DU TEMPS CRÉÉS
-- ========================================================================

-- Afficher les emplois du temps créés
SELECT 
    c.name as classe,
    ts.day_of_week as jour,
    ts.start_time as debut,
    ts.end_time as fin,
    s.name as matiere,
    ts.room as salle,
    u.first_name || ' ' || u.last_name as enseignant
FROM timetable_slots ts
JOIN classes c ON ts.class_id = c.id
JOIN subjects s ON ts.subject_id = s.id
JOIN teachers t ON ts.teacher_id = t.id
JOIN users u ON t.user_id = u.id
WHERE ts.is_active = 1
ORDER BY c.name, 
    CASE ts.day_of_week 
        WHEN 'Lundi' THEN 1
        WHEN 'Mardi' THEN 2
        WHEN 'Mercredi' THEN 3
        WHEN 'Jeudi' THEN 4
        WHEN 'Vendredi' THEN 5
    END,
    ts.start_time;
