-- ========================================================================
-- KDS SCHOOL MANAGEMENT SYSTEM - FULL SCHOOL YEAR SEED DATA
-- 100 Students, 10 Teachers, 5 Workers, 10 Classes (3 Maternelle + 7 Primaire)
-- Complete with Grades, Attendance, Documents, Transactions
-- ========================================================================

-- Clear existing data (in reverse order of dependencies)
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
-- 1. USERS (Admin + Teachers + Workers + Parents + Students)
-- ========================================================================

-- Admin/Director
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'director@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'director', 'Kouassi', 'Koffi', '+2250700000001', true),
('00000000-0000-0000-0000-000000000002', 'admin@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', 'Aïcha', 'Diallo', '+2250700000002', true);

-- 10 Teachers
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
('10000000-0000-0000-0000-000000000001', 'teacher1@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Marie', 'Kouamé', '+2250700000101', true),
('10000000-0000-0000-0000-000000000002', 'teacher2@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Jean', 'Traoré', '+2250700000102', true),
('10000000-0000-0000-0000-000000000003', 'teacher3@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Fatou', 'Bamba', '+2250700000103', true),
('10000000-0000-0000-0000-000000000004', 'teacher4@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Yao', 'Kouassi', '+2250700000104', true),
('10000000-0000-0000-0000-000000000005', 'teacher5@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Aminata', 'Sanogo', '+2250700000105', true),
('10000000-0000-0000-0000-000000000006', 'teacher6@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Konan', 'Yao', '+2250700000106', true),
('10000000-0000-0000-0000-000000000007', 'teacher7@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Mariam', 'Diabaté', '+2250700000107', true),
('10000000-0000-0000-0000-000000000008', 'teacher8@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Adama', 'Koné', '+2250700000108', true),
('10000000-0000-0000-0000-000000000009', 'teacher9@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Sylvie', 'N''Guessan', '+2250700000109', true),
('10000000-0000-0000-0000-000000000010', 'teacher10@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'Ibrahim', 'Touré', '+2250700000110', true);

-- 5 Workers (Accountant, Manager, Agents)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
('20000000-0000-0000-0000-000000000001', 'accountant@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'accountant', 'Raissa', 'Yao', '+2250700000201', true),
('20000000-0000-0000-0000-000000000002', 'manager@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'manager', 'Emmanuel', 'Kouadio', '+2250700000202', true),
('20000000-0000-0000-0000-000000000003', 'agent1@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'agent', 'Fofana', 'Mohamed', '+2250700000203', true),
('20000000-0000-0000-0000-000000000004', 'agent2@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'agent', 'Bintou', 'Cissé', '+2250700000204', true),
('20000000-0000-0000-0000-000000000005', 'agent3@kds.ci', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'agent', 'Sekou', 'Camara', '+2250700000205', true);

-- 100 Parents (for 100 students)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
SELECT 
    ('30000000-0000-0000-0000-' || LPAD(n::text, 12, '0'))::uuid,
    'parent' || n || '@famille.ci',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'parent',
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
    '+225070' || LPAD((n + 100)::text, 7, '0'),
    true
FROM generate_series(1, 100) AS n;

-- 100 Student Users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
SELECT 
    ('40000000-0000-0000-0000-' || LPAD(n::text, 12, '0'))::uuid,
    'eleve' || n || '@kds.ci',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'student',
    CASE (n % 20)
        WHEN 0 THEN 'Kouamé'
        WHEN 1 THEN 'Aya'
        WHEN 2 THEN 'Kofi'
        WHEN 3 THEN 'Akissi'
        WHEN 4 THEN 'Yao'
        WHEN 5 THEN 'Adjoua'
        WHEN 6 THEN 'Kouassi'
        WHEN 7 THEN 'Amoin'
        WHEN 8 THEN 'N''Guessan'
        WHEN 9 THEN 'Affoué'
        WHEN 10 THEN 'Kouadio'
        WHEN 11 THEN 'Mariam'
        WHEN 12 THEN 'Koffi'
        WHEN 13 THEN 'Fatou'
        WHEN 14 THEN 'Konan'
        WHEN 15 THEN 'Aïcha'
        WHEN 16 THEN 'Adama'
        WHEN 17 THEN 'Aminata'
        WHEN 18 THEN 'Sekou'
        ELSE 'Bintou'
    END,
    CASE (n % 15)
        WHEN 0 THEN 'Traoré'
        WHEN 1 THEN 'Koné'
        WHEN 2 THEN 'Diallo'
        WHEN 3 THEN 'Sanogo'
        WHEN 4 THEN 'Touré'
        WHEN 5 THEN 'Bamba'
        WHEN 6 THEN 'Ouattara'
        WHEN 7 THEN 'Coulibaly'
        WHEN 8 THEN 'Diabaté'
        WHEN 9 THEN 'Camara'
        WHEN 10 THEN 'Fofana'
        WHEN 11 THEN 'Cissé'
        WHEN 12 THEN 'Doumbia'
        WHEN 13 THEN 'Keïta'
        ELSE 'Sissoko'
    END,
    NULL,
    true
FROM generate_series(1, 100) AS n;

-- ========================================================================
-- 2. TEACHERS
-- ========================================================================

INSERT INTO teachers (id, user_id, specialization, hire_date, status) VALUES
('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', ARRAY['Maternelle', 'Éveil'], '2023-09-01', 'active'),
('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', ARRAY['Maternelle', 'Arts'], '2023-09-01', 'active'),
('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', ARRAY['Maternelle', 'Musique'], '2024-01-15', 'active'),
('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', ARRAY['Français', 'Histoire'], '2022-09-01', 'active'),
('11000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', ARRAY['Mathématiques', 'Sciences'], '2022-09-01', 'active'),
('11000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', ARRAY['Français', 'Géographie'], '2023-01-10', 'active'),
('11000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', ARRAY['Mathématiques'], '2023-09-01', 'active'),
('11000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', ARRAY['Sciences', 'Sport'], '2024-09-01', 'active'),
('11000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', ARRAY['Anglais', 'Arts'], '2023-09-01', 'active'),
('11000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', ARRAY['Informatique', 'Technologie'], '2024-01-01', 'active');

-- ========================================================================
-- 3. CLASSES (3 Maternelle + 7 Primaire)
-- ========================================================================

INSERT INTO classes (id, name, level, academic_year, main_teacher_id, room_number, capacity, is_active) VALUES
-- Maternelle (3 classes)
('50000000-0000-0000-0000-000000000001', 'Petite Section A', 'Maternelle', '2024-2025', '11000000-0000-0000-0000-000000000001', 'M101', 25, true),
('50000000-0000-0000-0000-000000000002', 'Moyenne Section A', 'Maternelle', '2024-2025', '11000000-0000-0000-0000-000000000002', 'M102', 25, true),
('50000000-0000-0000-0000-000000000003', 'Grande Section A', 'Maternelle', '2024-2025', '11000000-0000-0000-0000-000000000003', 'M103', 25, true),

-- Primaire (7 classes)
('50000000-0000-0000-0000-000000000004', 'CP1 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000004', 'P201', 30, true),
('50000000-0000-0000-0000-000000000005', 'CP2 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000005', 'P202', 30, true),
('50000000-0000-0000-0000-000000000006', 'CE1 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000006', 'P203', 30, true),
('50000000-0000-0000-0000-000000000007', 'CE2 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000007', 'P204', 30, true),
('50000000-0000-0000-0000-000000000008', 'CM1 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000008', 'P205', 30, true),
('50000000-0000-0000-0000-000000000009', 'CM1 B', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000009', 'P206', 30, true),
('50000000-0000-0000-0000-000000000010', 'CM2 A', 'Primaire', '2024-2025', '11000000-0000-0000-0000-000000000010', 'P207', 30, true);

-- ========================================================================
-- 4. STUDENTS (100 students distributed across 10 classes)
-- ========================================================================

-- Petite Section A: 10 students (ages 3-4)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD(n::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD(n::text, 12, '0'))::uuid,
    'KDS-2024-PS-' || LPAD(n::text, 3, '0'),
    DATE '2021-01-01' + (n * 10 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'male' ELSE 'female' END,
    'Ivoirienne',
    CASE (n % 3)
        WHEN 0 THEN 'Abidjan'
        WHEN 1 THEN 'Bouaké'
        ELSE 'Yamoussoukro'
    END,
    'Abidjan, Cocody',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000001',
    ('30000000-0000-0000-0000-' || LPAD(n::text, 12, '0'))::uuid,
    'Maternelle',
    'active'
FROM generate_series(1, 10) AS n;

-- Moyenne Section A: 10 students (ages 4-5)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD((n + 10)::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD((n + 10)::text, 12, '0'))::uuid,
    'KDS-2024-MS-' || LPAD(n::text, 3, '0'),
    DATE '2020-01-01' + (n * 10 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'female' ELSE 'male' END,
    'Ivoirienne',
    'Abidjan',
    'Abidjan, Plateau',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000002',
    ('30000000-0000-0000-0000-' || LPAD((n + 10)::text, 12, '0'))::uuid,
    'Maternelle',
    'active'
FROM generate_series(1, 10) AS n;

-- Grande Section A: 10 students (ages 5-6)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD((n + 20)::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD((n + 20)::text, 12, '0'))::uuid,
    'KDS-2024-GS-' || LPAD(n::text, 3, '0'),
    DATE '2019-01-01' + (n * 10 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'male' ELSE 'female' END,
    'Ivoirienne',
    'Yamoussoukro',
    'Abidjan, Marcory',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000003',
    ('30000000-0000-0000-0000-' || LPAD((n + 20)::text, 12, '0'))::uuid,
    'Maternelle',
    'active'
FROM generate_series(1, 10) AS n;

-- CP1 A: 10 students (ages 6-7)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD((n + 30)::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD((n + 30)::text, 12, '0'))::uuid,
    'KDS-2024-CP1-' || LPAD(n::text, 3, '0'),
    DATE '2018-01-01' + (n * 10 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'female' ELSE 'male' END,
    'Ivoirienne',
    'Bouaké',
    'Abidjan, Adjamé',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000004',
    ('30000000-0000-0000-0000-' || LPAD((n + 30)::text, 12, '0'))::uuid,
    'Primaire',
    'active'
FROM generate_series(1, 10) AS n;

-- CP2 A: 10 students (ages 7-8)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD((n + 40)::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD((n + 40)::text, 12, '0'))::uuid,
    'KDS-2024-CP2-' || LPAD(n::text, 3, '0'),
    DATE '2017-01-01' + (n * 10 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'male' ELSE 'female' END,
    'Ivoirienne',
    'Abidjan',
    'Abidjan, Yopougon',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000005',
    ('30000000-0000-0000-0000-' || LPAD((n + 40)::text, 12, '0'))::uuid,
    'Primaire',
    'active'
FROM generate_series(1, 10) AS n;

-- CE1 A: 10 students (ages 8-9)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD((n + 50)::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD((n + 50)::text, 12, '0'))::uuid,
    'KDS-2024-CE1-' || LPAD(n::text, 3, '0'),
    DATE '2016-01-01' + (n * 10 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'female' ELSE 'male' END,
    'Ivoirienne',
    'San Pedro',
    'Abidjan, Treichville',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000006',
    ('30000000-0000-0000-0000-' || LPAD((n + 50)::text, 12, '0'))::uuid,
    'Primaire',
    'active'
FROM generate_series(1, 10) AS n;

-- CE2 A: 10 students (ages 9-10)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD((n + 60)::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD((n + 60)::text, 12, '0'))::uuid,
    'KDS-2024-CE2-' || LPAD(n::text, 3, '0'),
    DATE '2015-01-01' + (n * 10 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'male' ELSE 'female' END,
    'Ivoirienne',
    'Daloa',
    'Abidjan, Abobo',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000007',
    ('30000000-0000-0000-0000-' || LPAD((n + 60)::text, 12, '0'))::uuid,
    'Primaire',
    'active'
FROM generate_series(1, 10) AS n;

-- CM1 A: 15 students (ages 10-11)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD((n + 70)::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD((n + 70)::text, 12, '0'))::uuid,
    'KDS-2024-CM1A-' || LPAD(n::text, 3, '0'),
    DATE '2014-01-01' + (n * 8 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'female' ELSE 'male' END,
    'Ivoirienne',
    'Korhogo',
    'Abidjan, Koumassi',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000008',
    ('30000000-0000-0000-0000-' || LPAD((n + 70)::text, 12, '0'))::uuid,
    'Primaire',
    'active'
FROM generate_series(1, 15) AS n;

-- CM1 B: 15 students (ages 10-11)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD((n + 85)::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD((n + 85)::text, 12, '0'))::uuid,
    'KDS-2024-CM1B-' || LPAD(n::text, 3, '0'),
    DATE '2014-03-01' + (n * 8 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'male' ELSE 'female' END,
    'Ivoirienne',
    'Abidjan',
    'Abidjan, Port-Bouët',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000009',
    ('30000000-0000-0000-0000-' || LPAD((n + 85)::text, 12, '0'))::uuid,
    'Primaire',
    'active'
FROM generate_series(1, 10) AS n;

-- CM2 A: 10 students (ages 11-12)
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, parent_id, academic_level, status)
SELECT 
    ('60000000-0000-0000-0000-' || LPAD((n + 95)::text, 12, '0'))::uuid,
    ('40000000-0000-0000-0000-' || LPAD((n + 95)::text, 12, '0'))::uuid,
    'KDS-2024-CM2-' || LPAD(n::text, 3, '0'),
    DATE '2013-01-01' + (n * 10 || ' days')::interval,
    CASE WHEN n % 2 = 0 THEN 'female' ELSE 'male' END,
    'Ivoirienne',
    'Gagnoa',
    'Abidjan, Bingerville',
    '2024-09-01',
    '50000000-0000-0000-0000-000000000010',
    ('30000000-0000-0000-0000-' || LPAD((n + 95)::text, 12, '0'))::uuid,
    'Primaire',
    'active'
FROM generate_series(1, 5) AS n;

-- ========================================================================
-- 5. SUBJECTS (Maternelle + Primaire subjects)
-- ========================================================================

INSERT INTO subjects (id, name, code, color, is_active) VALUES
-- Maternelle Subjects
('70000000-0000-0000-0000-000000000001', 'Éveil', 'EVEIL', '#FF6B6B', true),
('70000000-0000-0000-0000-000000000002', 'Motricité', 'MOTOR', '#4ECDC4', true),
('70000000-0000-0000-0000-000000000003', 'Arts Plastiques', 'ARTS', '#95E1D3', true),
('70000000-0000-0000-0000-000000000004', 'Musique', 'MUSIC', '#F38181', true),

-- Primaire Subjects
('70000000-0000-0000-0000-000000000005', 'Français', 'FR', '#3B82F6', true),
('70000000-0000-0000-0000-000000000006', 'Mathématiques', 'MATH', '#10B981', true),
('70000000-0000-0000-0000-000000000007', 'Sciences', 'SCI', '#8B5CF6', true),
('70000000-0000-0000-0000-000000000008', 'Histoire-Géographie', 'HISTGEO', '#F59E0B', true),
('70000000-0000-0000-0000-000000000009', 'Anglais', 'ANG', '#EF4444', true),
('70000000-0000-0000-0000-000000000010', 'Éducation Physique', 'EPS', '#06B6D4', true),
('70000000-0000-0000-0000-000000000011', 'Arts Plastiques', 'ARTS-PRIM', '#EC4899', true),
('70000000-0000-0000-0000-000000000012', 'Informatique', 'INFO', '#6366F1', true);

-- ========================================================================
-- 6. GRADE CATEGORIES (for Primaire only)
-- ========================================================================

-- For each Primaire class and main subjects, create grade categories
INSERT INTO grade_categories (id, name, weight, subject_id, class_id, created_by)
SELECT 
    gen_random_uuid(),
    cat.name,
    cat.weight,
    subj.id,
    cls.id,
    '00000000-0000-0000-0000-000000000001'
FROM 
    (VALUES 
        ('Devoir', 0.30),
        ('Composition 1', 0.25),
        ('Composition 2', 0.25),
        ('Composition 3', 0.20)
    ) AS cat(name, weight)
CROSS JOIN 
    (SELECT id FROM subjects WHERE code IN ('FR', 'MATH', 'SCI', 'HISTGEO', 'ANG')) AS subj
CROSS JOIN
    (SELECT id FROM classes WHERE level = 'Primaire') AS cls;

-- ========================================================================
-- 7. GRADES (Full year of grades for all Primaire students)
-- ========================================================================

-- Generate realistic grades for each student in Primaire classes
INSERT INTO grades (id, student_id, subject_id, grade, max_grade, evaluation_date, recorded_by)
SELECT 
    gen_random_uuid(),
    s.id,
    subj.id,
    -- Generate realistic grades: better students get 12-18, average 8-14, weaker 5-12
    CASE 
        WHEN (s.id::text)::bytea[16] % 3 = 0 THEN (12 + random() * 6)::decimal(5,2)
        WHEN (s.id::text)::bytea[16] % 3 = 1 THEN (8 + random() * 6)::decimal(5,2)
        ELSE (5 + random() * 7)::decimal(5,2)
    END,
    20,
    -- Spread evaluations across the school year (Sept 2024 - May 2025)
    DATE '2024-09-01' + ((eval_num * 30 + (random() * 20)::int) || ' days')::interval,
    '10000000-0000-0000-0000-000000000004'
FROM 
    students s
CROSS JOIN 
    (SELECT id FROM subjects WHERE code IN ('FR', 'MATH', 'SCI', 'HISTGEO', 'ANG', 'EPS', 'INFO')) AS subj
CROSS JOIN
    generate_series(1, 8) AS eval_num
WHERE 
    s.class_id IN (SELECT id FROM classes WHERE level = 'Primaire')
    AND random() > 0.1; -- Some missing grades (90% coverage)

-- ========================================================================
-- 8. ATTENDANCE (Full year attendance for all students)
-- ========================================================================

-- Generate attendance records from Sept 1, 2024 to Dec 3, 2024 (school days only)
INSERT INTO attendance (id, student_id, date, status, period, recorded_by)
SELECT 
    gen_random_uuid(),
    s.id,
    d.date,
    -- 85% present, 10% absent, 5% late
    CASE 
        WHEN random() < 0.85 THEN 'present'
        WHEN random() < 0.95 THEN 'absent'
        ELSE 'late'
    END,
    'full_day',
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
    -- Only school days (Monday to Friday)
    EXTRACT(DOW FROM d.date) BETWEEN 1 AND 5
    -- Skip holidays
    AND d.date NOT IN ('2024-11-01', '2024-11-15', '2024-12-25')
    AND random() > 0.05; -- Some missing attendance records

-- ========================================================================
-- 9. TIMETABLE SLOTS (Weekly schedules for all classes)
-- ========================================================================

-- Maternelle schedules (simpler, more play-based)
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time)
SELECT 
    gen_random_uuid(),
    c.id,
    s.id,
    c.main_teacher_id,
    c.room_number,
    dow,
    start_time,
    end_time
FROM 
    classes c
CROSS JOIN (
    VALUES 
        (1, '70000000-0000-0000-0000-000000000001', '08:00'::time, '10:00'::time), -- Monday Éveil
        (1, '70000000-0000-0000-0000-000000000002', '10:30'::time, '11:30'::time), -- Monday Motricité
        (2, '70000000-0000-0000-0000-000000000003', '08:00'::time, '10:00'::time), -- Tuesday Arts
        (2, '70000000-0000-0000-0000-000000000001', '10:30'::time, '11:30'::time), -- Tuesday Éveil
        (3, '70000000-0000-0000-0000-000000000004', '08:00'::time, '09:30'::time), -- Wednesday Musique
        (3, '70000000-0000-0000-0000-000000000002', '10:00'::time, '11:30'::time), -- Wednesday Motricité
        (4, '70000000-0000-0000-0000-000000000001', '08:00'::time, '10:00'::time), -- Thursday Éveil
        (4, '70000000-0000-0000-0000-000000000003', '10:30'::time, '11:30'::time), -- Thursday Arts
        (5, '70000000-0000-0000-0000-000000000002', '08:00'::time, '09:30'::time), -- Friday Motricité
        (5, '70000000-0000-0000-0000-000000000004', '10:00'::time, '11:30'::time)  -- Friday Musique
) AS schedule(dow, subject_id, start_time, end_time)
CROSS JOIN subjects s
WHERE 
    c.level = 'Maternelle'
    AND s.id = schedule.subject_id;

-- Primaire schedules (more structured)
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time)
SELECT 
    gen_random_uuid(),
    c.id,
    s.id,
    COALESCE(
        (SELECT t.id FROM teachers t WHERE s.code = ANY(t.specialization) LIMIT 1),
        c.main_teacher_id
    ),
    c.room_number,
    dow,
    start_time,
    end_time
FROM 
    classes c
CROSS JOIN (
    VALUES 
        (1, 'FR', '08:00'::time, '09:30'::time),
        (1, 'MATH', '09:45'::time, '11:15'::time),
        (1, 'SCI', '11:30'::time, '12:30'::time),
        (2, 'MATH', '08:00'::time, '09:30'::time),
        (2, 'HISTGEO', '09:45'::time, '11:15'::time),
        (2, 'EPS', '11:30'::time, '12:30'::time),
        (3, 'FR', '08:00'::time, '09:30'::time),
        (3, 'ANG', '09:45'::time, '11:15'::time),
        (4, 'MATH', '08:00'::time, '09:30'::time),
        (4, 'SCI', '09:45'::time, '11:15'::time),
        (4, 'INFO', '11:30'::time, '12:30'::time),
        (5, 'FR', '08:00'::time, '09:30'::time),
        (5, 'ARTS-PRIM', '09:45'::time, '11:15'::time),
        (5, 'EPS', '11:30'::time, '12:30'::time)
) AS schedule(dow, subject_code, start_time, end_time)
CROSS JOIN subjects s
WHERE 
    c.level = 'Primaire'
    AND s.code = schedule.subject_code;

-- ========================================================================
-- 10. FINANCIAL TRANSACTIONS (Tuition fees for all students)
-- ========================================================================

-- Generate 3 terms of tuition fees
INSERT INTO financial_transactions (id, student_id, type, amount, currency, status, due_date, paid_date, description, created_by)
SELECT 
    gen_random_uuid(),
    s.id,
    'tuition',
    CASE 
        WHEN c.level = 'Maternelle' THEN 150000
        ELSE 200000
    END,
    'XOF',
    CASE 
        WHEN term = 1 THEN 'paid'
        WHEN term = 2 AND random() > 0.2 THEN 'paid'
        WHEN term = 3 AND random() > 0.5 THEN 'pending'
        ELSE 'overdue'
    END,
    CASE 
        WHEN term = 1 THEN DATE '2024-09-30'
        WHEN term = 2 THEN DATE '2024-12-31'
        ELSE DATE '2025-03-31'
    END,
    CASE 
        WHEN term = 1 THEN DATE '2024-09-15'
        WHEN term = 2 AND random() > 0.2 THEN DATE '2024-12-20'
        ELSE NULL
    END,
    CASE 
        WHEN term = 1 THEN 'Scolarité Trimestre 1 (2024-2025)'
        WHEN term = 2 THEN 'Scolarité Trimestre 2 (2024-2025)'
        ELSE 'Scolarité Trimestre 3 (2024-2025)'
    END,
    '20000000-0000-0000-0000-000000000001'
FROM 
    students s
JOIN classes c ON s.class_id = c.id
CROSS JOIN generate_series(1, 3) AS term;

-- ========================================================================
-- 11. STUDENT DOCUMENTS
-- ========================================================================

-- Generate required documents for each student
INSERT INTO student_documents (id, student_id, type, status, file_name, uploaded_by)
SELECT 
    gen_random_uuid(),
    s.id,
    doc_type,
    CASE 
        WHEN random() > 0.1 THEN 'validated'
        WHEN random() > 0.5 THEN 'pending'
        ELSE 'missing'
    END,
    'doc_' || s.student_code || '_' || doc_type || '.pdf',
    s.parent_id
FROM 
    students s
CROSS JOIN (
    VALUES 
        ('birth_certificate'),
        ('health_record'),
        ('vaccination_record')
) AS docs(doc_type);

-- ========================================================================
-- SUMMARY STATISTICS
-- ========================================================================

-- Display summary
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
    RAISE NOTICE 'KDS SCHOOL DATABASE SEEDED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Users: %', total_users;
    RAISE NOTICE 'Total Students: %', total_students;
    RAISE NOTICE 'Total Teachers: %', total_teachers;
    RAISE NOTICE 'Total Classes: %', total_classes;
    RAISE NOTICE 'Total Grades: %', total_grades;
    RAISE NOTICE 'Total Attendance Records: %', total_attendance;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Academic Year: 2024-2025';
    RAISE NOTICE 'Maternelle Classes: 3';
    RAISE NOTICE 'Primaire Classes: 7';
    RAISE NOTICE '========================================';
END $$;
