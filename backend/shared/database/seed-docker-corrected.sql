-- ========================================================================
-- KDS SCHOOL - CORRECTED SEED FOR DOCKER DATABASE
-- Matches actual TypeORM entity schema
-- ========================================================================

-- Clear existing data
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE financial_transactions CASCADE;
TRUNCATE TABLE import_batches CASCADE;
TRUNCATE TABLE student_documents CASCADE;
TRUNCATE TABLE attendance CASCADE;
TRUNCATE TABLE timetable_slots CASCADE;
TRUNCATE TABLE grades CASCADE;
TRUNCATE TABLE grade_categories CASCADE;
TRUNCATE TABLE subjects CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE classes CASCADE;
TRUNCATE TABLE teachers CASCADE;
TRUNCATE TABLE users CASCADE;

-- ========================================================================
-- 1. USERS
-- ========================================================================

-- Admin
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'director@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'director', 'Kouassi', 'Koffi', '+2250700000001', true),
('00000000-0000-0000-0000-000000000002', 'admin@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', 'Aïcha', 'Diallo', '+2250700000002', true);

-- 10 Teachers
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
SELECT 
    ('10000000-0000-0000-0000-' || LPAD(n::text, 12, '0'))::uuid,
    'teacher' || n || '@kds.ci',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'teacher',
    CASE (n % 5)
        WHEN 0 THEN 'Marie'
        WHEN 1 THEN 'Jean'
        WHEN 2 THEN 'Fatou'
        WHEN 3 THEN 'Yao'
        ELSE 'Aminata'
    END,
    CASE (n % 5)
        WHEN 0 THEN 'Kouamé'
        WHEN 1 THEN 'Traoré'
        WHEN 2 THEN 'Bamba'
        WHEN 3 THEN 'Kouassi'
        ELSE 'Sanogo'
    END,
    '+225070000' || LPAD(n::text, 4, '0'),
    true
FROM generate_series(1, 10) AS n;

-- 5 Workers
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
('20000000-0000-0000-0000-000000000001', 'accountant@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'accountant', 'Raissa', 'Yao', '+2250700000201', true),
('20000000-0000-0000-0000-000000000002', 'manager@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'manager', 'Emmanuel', 'Kouadio', '+2250700000202', true),
('20000000-0000-0000-0000-000000000003', 'agent1@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'agent', 'Fofana', 'Mohamed', '+2250700000203', true),
('20000000-0000-0000-0000-000000000004', 'agent2@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'agent', 'Bintou', 'Cissé', '+2250700000204', true),
('20000000-0000-0000-0000-000000000005', 'agent3@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'agent', 'Sekou', 'Camara', '+2250700000205', true);

-- 100 Parents  
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
SELECT 
    ('30000000-0000-0000-0000-' || LPAD(n::text, 12, '0'))::uuid,
    'parent' || n || '@famille.ci',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'parent',
    CASE (n % 8)
        WHEN 0 THEN 'Amadou'
        WHEN 1 THEN 'Awa'
        WHEN 2 THEN 'Karim'
        WHEN 3 THEN 'Aissata'
        WHEN 4 THEN 'Moussa'
        WHEN 5 THEN 'Mariame'
        WHEN 6 THEN 'Seydou'
        ELSE 'Fatoumata'
    END,
    CASE (n % 10)
        WHEN 0 THEN 'Ouattara'
        WHEN 1 THEN 'Coulibaly'
        WHEN 2 THEN 'Koné'
        WHEN 3 THEN 'Diallo'
        WHEN 4 THEN 'Touré'
        WHEN 5 THEN 'Yao'
        WHEN 6 THEN 'Sanogo'
        WHEN 7 THEN 'Traoré'
        WHEN 8 THEN 'Bamba'
        ELSE 'Kouassi'
    END,
    '+225070' || LPAD((n + 100)::text, 7, '0'),
    true
FROM generate_series(1, 100) AS n;

-- 100 Students (users)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
SELECT 
    ('40000000-0000-0000-0000-' || LPAD(n::text, 12, '0'))::uuid,
    'eleve' || n || '@kds.ci',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'student',
    CASE (n % 20)
        WHEN 0 THEN 'Kouamé' WHEN 1 THEN 'Aya' WHEN 2 THEN 'Kofi' WHEN 3 THEN 'Akissi'
        WHEN 4 THEN 'Yao' WHEN 5 THEN 'Adjoua' WHEN 6 THEN 'Kouassi' WHEN 7 THEN 'Amoin'
        WHEN 8 THEN 'N''Guessan' WHEN 9 THEN 'Affoué' WHEN 10 THEN 'Kouadio' WHEN 11 THEN 'Mariam'
        WHEN 12 THEN 'Koffi' WHEN 13 THEN 'Fatou' WHEN 14 THEN 'Konan' WHEN 15 THEN 'Aïcha'
        WHEN 16 THEN 'Adama' WHEN 17 THEN 'Aminata' WHEN 18 THEN 'Sekou' ELSE 'Bintou'
    END,
    CASE (n % 15)
        WHEN 0 THEN 'Traoré' WHEN 1 THEN 'Koné' WHEN 2 THEN 'Diallo' WHEN 3 THEN 'Sanogo'
        WHEN 4 THEN 'Touré' WHEN 5 THEN 'Bamba' WHEN 6 THEN 'Ouattara' WHEN 7 THEN 'Coulibaly'
        WHEN 8 THEN 'Diabaté' WHEN 9 THEN 'Camara' WHEN 10 THEN 'Fofana' WHEN 11 THEN 'Cissé'
        WHEN 12 THEN 'Doumbia' WHEN 13 THEN 'Keïta' ELSE 'Sissoko'
    END,
    NULL,
    true
FROM generate_series(1, 100) AS n;

-- ========================================================================
-- 2. TEACHERS (with correct status enum)
-- ========================================================================

INSERT INTO teachers (id, user_id, first_name, last_name, subject, phone, email, specialization, hire_date, status) VALUES
('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Marie', 'Kouamé', 'Maternelle', '+2250700000001', 'teacher1@kds.ci', 'Éveil', '2023-09-01', 'Actif'),
('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Jean', 'Traoré', 'Maternelle', '+2250700000002', 'teacher2@kds.ci', 'Arts', '2023-09-01', 'Actif'),
('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Fatou', 'Bamba', 'Maternelle', '+2250700000003', 'teacher3@kds.ci', 'Musique', '2024-01-15', 'Actif'),
('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Yao', 'Kouassi', 'Français', '+2250700000004', 'teacher4@kds.ci', 'Histoire', '2022-09-01', 'Actif'),
('11000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Aminata', 'Sanogo', 'Mathématiques', '+2250700000005', 'teacher5@kds.ci', 'Sciences', '2022-09-01', 'Actif'),
('11000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Konan', 'Yao', 'Français', '+2250700000006', 'teacher6@kds.ci', 'Géographie', '2023-01-10', 'Actif'),
('11000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Mariam', 'Diabaté', 'Mathématiques', '+2250700000007', 'teacher7@kds.ci', 'Mathématiques', '2023-09-01', 'Actif'),
('11000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Adama', 'Koné', 'Sciences', '+2250700000008', 'teacher8@kds.ci', 'Sport', '2024-09-01', 'Actif'),
('11000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'Sylvie', 'N''Guessan', 'Anglais', '+2250700000009', 'teacher9@kds.ci', 'Arts', '2023-09-01', 'Actif'),
('11000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 'Ibrahim', 'Touré', 'Informatique', '+2250700000010', 'teacher10@kds.ci', 'Technologie', '2024-01-01', 'Actif');

-- ========================================================================
-- 3. CLASSES
-- ========================================================================

INSERT INTO classes (id, name, level, academic_year, main_teacher_id, room_number, capacity, is_active) VALUES
-- Maternelle
('50000000-0000-0000-0000-000000000001', 'Petite Section A', 'Maternelle', '2024-2025', '11000000-0000-0000-0000-000000000001', 'M101', 25, true),
('50000000-0000-0000-0000-000000000002', 'Moyenne Section A', 'Maternelle', '2024-2025', '11000000-0000-0000-0000-000000000002', 'M102', 25, true),
('50000000-0000-0000-0000-000000000003', 'Grande Section A', 'Maternelle', '2024-2025', '11000000-0000-0000-0000-000000000003', 'M103', 25, true),
-- Primaire
('50000000-0000-0000-0000-000000000004', 'CP1 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000004', 'P201', 30, true),
('50000000-0000-0000-0000-000000000005', 'CP2 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000005', 'P202', 30, true),
('50000000-0000-0000-0000-000000000006', 'CE1 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000006', 'P203', 30, true),
('50000000-0000-0000-0000-000000000007', 'CE2 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000007', 'P204', 30, true),
('50000000-0000-0000-0000-000000000008', 'CM1 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000008', 'P205', 30, true),
('50000000-0000-0000-0000-000000000009', 'CM1 B', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000009', 'P206', 30, true),
('50000000-0000-0000-0000-000000000010', 'CM2 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000010', 'P207', 30, true);

-- ========================================================================
-- 4. STUDENTS (with correct column names)
-- ========================================================================

-- Helper function to distribute students across classes
DO $$
DECLARE
    class_configs JSON[] := ARRAY[
        '{"class_id": "50000000-0000-0000-0000-000000000001", "count": 10, "year": 2021, "level": "Maternelle"}'::json,
        '{"class_id": "50000000-0000-0000-0000-000000000002", "count": 10, "year": 2020, "level": "Maternelle"}'::json,
        '{"class_id": "50000000-0000-0000-0000-000000000003", "count": 10, "year": 2019, "level": "Maternelle"}'::json,
        '{"class_id": "50000000-0000-0000-0000-000000000004", "count": 10, "year": 2018, "level": "CP1"}'::json,
        '{"class_id": "50000000-0000-0000-0000-000000000005", "count": 10, "year": 2017, "level": "CP2"}'::json,
        '{"class_id": "50000000-0000-0000-0000-000000000006", "count": 10, "year": 2016, "level": "CE1"}'::json,
        '{"class_id": "50000000-0000-0000-0000-000000000007", "count": 10, "year": 2015, "level": "CE2"}'::json,
        '{"class_id": "50000000-0000-0000-0000-000000000008", "count": 15, "year": 2014, "level": "CM1"}'::json,
        '{"class_id": "50000000-0000-0000-0000-000000000009", "count": 10, "year": 2014, "level": "CM1"}'::json,
        '{"class_id": "50000000-0000-0000-0000-000000000010", "count": 5, "year": 2013, "level": "CM2"}'::json
    ];
    config JSON;
    offset_counter INTEGER := 0;
BEGIN
    FOREACH config IN ARRAY class_configs
    LOOP
        INSERT INTO students (
            id, user_id, registration_number, first_name, last_name, dob, phone, email,
            nationality, address, birth_place, gender, grade_level, status,
            emergency_contact_name, emergency_contact_phone, registration_date, class_id, documents
        )
        SELECT 
            ('60000000-0000-0000-0000-' || LPAD((offset_counter + n)::text, 12, '0'))::uuid,
            ('40000000-0000-0000-0000-' || LPAD((offset_counter + n)::text, 12, '0'))::uuid,
            'KDS-2024-' || LPAD((offset_counter + n)::text, 4, '0'),
            u.first_name,
            u.last_name,
            DATE ((config->>'year')::text || '-01-01') + (n * 10 || ' days')::interval,
            '+225070' || LPAD((offset_counter + n + 200)::text, 7, '0'),
            'eleve' || (offset_counter + n) || '@kds.ci',
            'Ivoirienne',
            'Abidjan, Cocody',
            'Abidjan',
            CASE WHEN n % 2 = 0 THEN 'Masculin'::students_gender_enum ELSE 'Féminin'::students_gender_enum END,
            config->>'level',
            'Actif'::students_status_enum,
            p.first_name || ' ' || p.last_name,
            p.phone,
            '2024-09-01',
            (config->>'class_id')::uuid,
            '[]'::jsonb
        FROM generate_series(1, (config->>'count')::int) AS n
        JOIN users u ON u.id = ('40000000-0000-0000-0000-' || LPAD((offset_counter + n)::text, 12, '0'))::uuid
        JOIN users p ON p.id = ('30000000-0000-0000-0000-' || LPAD((offset_counter + n)::text, 12, '0'))::uuid;
        
        offset_counter := offset_counter + (config->>'count')::int;
    END LOOP;
END $$;

-- ========================================================================
-- 5. SUBJECTS (with required fields)
-- ========================================================================

INSERT INTO subjects (id, name, code, color, grade_level, weekly_hours, coefficient, is_active) VALUES
-- Maternelle
('70000000-0000-0000-0000-000000000001', 'Éveil', 'EVEIL', '#FF6B6B', 'Maternelle', 5, 1.0, true),
('70000000-0000-0000-0000-000000000002', 'Motricité', 'MOTOR', '#4ECDC4', 'Maternelle', 3, 1.0, true),
('70000000-0000-0000-0000-000000000003', 'Arts Plastiques', 'ARTS-MAT', '#95E1D3', 'Maternelle', 2, 1.0, true),
('70000000-0000-0000-0000-000000000004', 'Musique', 'MUSIC', '#F38181', 'Maternelle', 2, 1.0, true),
-- Primaire
('70000000-0000-0000-0000-000000000005', 'Français', 'FR', '#3B82F6', 'Primaire', 8, 3.0, true),
('70000000-0000-0000-0000-000000000006', 'Mathématiques', 'MATH', '#10B981', 'Primaire', 8, 3.0, true),
('70000000-0000-0000-0000-000000000007', 'Sciences', 'SCI', '#8B5CF6', 'Primaire', 4, 2.0, true),
('70000000-0000-0000-0000-000000000008', 'Histoire-Géographie', 'HISTGEO', '#F59E0B', 'Primaire', 3, 1.5, true),
('70000000-0000-0000-0000-000000000009', 'Anglais', 'ANG', '#EF4444', 'Primaire', 3, 1.5, true),
('70000000-0000-0000-0000-000000000010', 'Éducation Physique', 'EPS', '#06B6D4', 'Primaire', 4, 1.0, true),
('70000000-0000-0000-0000-000000000011', 'Arts Plastiques', 'ARTS-PRIM', '#EC4899', 'Primaire', 2, 1.0, true),
('70000000-0000-0000-0000-000000000012', 'Informatique', 'INFO', '#6366F1', 'Primaire', 2, 1.0, true);

-- ========================================================================
-- 6. GRADES (with correct schema)
-- ========================================================================

INSERT INTO grades (id, student_id, subject_id, teacher_id, score, max_score, evaluation_date, evaluation_type, comment, trimester)
SELECT 
    gen_random_uuid(),
    s.id,
    subj.id,
    t.id,
    -- Realistic scores
    CASE 
        WHEN EXTRACT(EPOCH FROM s.id::text::bytea)::bigint % 3 = 0 THEN (12 + random() * 6)::numeric(5,2)
        WHEN EXTRACT(EPOCH FROM s.id::text::bytea)::bigint % 3 = 1 THEN (8 + random() * 6)::numeric(5,2)
        ELSE (5 + random() * 7)::numeric(5,2)
    END,
    20.0,
    DATE '2024-09-01' + ((eval_num * 15 + (random() * 10)::int) || ' days')::interval,
    CASE eval_num % 3
        WHEN 0 THEN 'Devoir'
        WHEN 1 THEN 'Composition'
        ELSE 'Contrôle'
    END,
    NULL,
    1
FROM 
    students s
JOIN classes c ON s.class_id = c.id
CROSS JOIN 
    (SELECT id FROM subjects WHERE grade_level = 'Primaire') AS subj
CROSS JOIN
    (SELECT id FROM teachers LIMIT 1) AS t
CROSS JOIN
    generate_series(1, 6) AS eval_num
WHERE 
    s.grade_level IN ('CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2')
    AND random() > 0.05;

-- ========================================================================
-- 7. ATTENDANCE
-- ========================================================================

INSERT INTO attendance (id, student_id, date, present, status, reason, recorded_by)
SELECT 
    gen_random_uuid(),
    s.id,
    d.date,
    CASE WHEN random() < 0.85 THEN true ELSE false END,
    CASE 
        WHEN random() < 0.85 THEN 'Présent'
        WHEN random() < 0.95 THEN 'Absent'
        ELSE 'Retard'
    END,
    NULL,
    '00000000-0000-0000-0000-000000000002'
FROM 
    students s
CROSS JOIN (
    SELECT generate_series(
        DATE '2024-09-02',
        DATE '2024-12-03',
        '1 day'::interval
    )::date AS date
) d
WHERE 
    EXTRACT(DOW FROM d.date) BETWEEN 1 AND 5
    AND d.date NOT IN ('2024-11-01', '2024-11-15')
    AND random() > 0.02;

-- ========================================================================
-- SUMMARY
-- ========================================================================

DO $$
DECLARE
    total_users INT;
    total_students INT;
    total_teachers INT;
    total_classes INT;
    total_grades INT;
    total_attendance INT;
BEGIN
    SELECT COUNT(*) INTO total_users FROM users;
    SELECT COUNT(*) INTO total_students FROM students;
    SELECT COUNT(*) INTO total_teachers FROM teachers;
    SELECT COUNT(*) INTO total_classes FROM classes;
    SELECT COUNT(*) INTO total_grades FROM grades;
    SELECT COUNT(*) INTO total_attendance FROM attendance;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'KDS DOCKER DATABASE SEEDED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Users: %', total_users;
    RAISE NOTICE 'Total Students: %', total_students;
    RAISE NOTICE 'Total Teachers: %', total_teachers;
    RAISE NOTICE 'Total Classes: %', total_classes;
    RAISE NOTICE 'Total Grades: %', total_grades;
    RAISE NOTICE 'Total Attendance: %', total_attendance;
    RAISE NOTICE '========================================';
END $$;
