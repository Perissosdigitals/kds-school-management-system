-- Seed KDS - Cloudflare D1 - 20 novembre 2025
-- Compatible avec structure D1 reelle

-- 1. Users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, created_at, updated_at) VALUES
('admin-001', 'admin@kds-school.ci', '$2a$10$Hash', 'admin', 'David', 'COHEN', '+225 07 07 07 07 07', 1, datetime('now'), datetime('now')),
('teacher-001', 'mkone@kds-school.ci', '$2a$10$Hash', 'teacher', 'Mohamed', 'KONE', '+225 07 08 09 10 11', 1, datetime('now'), datetime('now')),
('teacher-002', 'acoulibaly@kds-school.ci', '$2a$10$Hash', 'teacher', 'Aminata', 'COULIBALY', '+225 07 08 09 10 12', 1, datetime('now'), datetime('now')),
('teacher-003', 'jtraore@kds-school.ci', '$2a$10$Hash', 'teacher', 'Jean', 'TRAORE', '+225 07 08 09 10 13', 1, datetime('now'), datetime('now')),
('teacher-004', 'syao@kds-school.ci', '$2a$10$Hash', 'teacher', 'Sarah', 'YAO', '+225 07 08 09 10 14', 1, datetime('now'), datetime('now')),
('teacher-005', 'rbamba@kds-school.ci', '$2a$10$Hash', 'teacher', 'Rachel', 'BAMBA', '+225 07 08 09 10 15', 1, datetime('now'), datetime('now')),
('parent-001', 'parent1@example.ci', '$2a$10$Hash', 'parent', 'Ibrahim', 'DIALLO', '+225 07 11 22 33 44', 1, datetime('now'), datetime('now')),
('parent-002', 'parent2@example.ci', '$2a$10$Hash', 'parent', 'Fatou', 'KONATE', '+225 07 11 22 33 45', 1, datetime('now'), datetime('now'));

-- 2. Teachers (id, user_id, specialization, hire_date, status)
INSERT INTO teachers (id, user_id, specialization, hire_date, status, created_at, updated_at) VALUES
('tchr-001', 'teacher-001', 'Mathematiques', '2020-09-01', 'active', datetime('now'), datetime('now')),
('tchr-002', 'teacher-002', 'Francais', '2021-09-01', 'active', datetime('now'), datetime('now')),
('tchr-003', 'teacher-003', 'Sciences', '2019-09-01', 'active', datetime('now'), datetime('now')),
('tchr-004', 'teacher-004', 'Anglais', '2022-09-01', 'active', datetime('now'), datetime('now')),
('tchr-005', 'teacher-005', 'Torah et Hebreu', '2020-09-01', 'active', datetime('now'), datetime('now'));

-- 3. Subjects (id, name, code, color, description, is_active)
INSERT INTO subjects (id, name, code, color, description, is_active, created_at) VALUES
('subj-001', 'Mathematiques', 'MATH', '#3B82F6', 'Mathematiques Primaire et College', 1, datetime('now')),
('subj-002', 'Francais', 'FR', '#10B981', 'Langue Francaise', 1, datetime('now')),
('subj-003', 'Sciences', 'SCI', '#8B5CF6', 'Sciences Naturelles', 1, datetime('now')),
('subj-004', 'Histoire-Geo', 'HG', '#F59E0B', 'Histoire et Geographie', 1, datetime('now')),
('subj-005', 'Anglais', 'ANG', '#EF4444', 'Langue Anglaise', 1, datetime('now')),
('subj-006', 'Torah', 'TOR', '#6366F1', 'Etudes de la Torah', 1, datetime('now')),
('subj-007', 'Hebreu', 'HEB', '#14B8A6', 'Langue Hebraique', 1, datetime('now')),
('subj-008', 'EPS', 'EPS', '#F97316', 'Education Physique', 1, datetime('now')),
('subj-009', 'Arts', 'ART', '#EC4899', 'Arts Plastiques', 1, datetime('now')),
('subj-010', 'Informatique', 'INFO', '#06B6D4', 'Informatique', 1, datetime('now'));

-- 4. Classes
INSERT INTO classes (id, name, level, academic_year, main_teacher_id, room_number, capacity, is_active, created_at, updated_at) VALUES
('class-001', 'CP-A', 'CP', '2024-2025', 'tchr-001', 'A-101', 25, 1, datetime('now'), datetime('now')),
('class-002', 'CE1-A', 'CE1', '2024-2025', 'tchr-002', 'A-102', 25, 1, datetime('now'), datetime('now')),
('class-003', 'CE2-A', 'CE2', '2024-2025', 'tchr-003', 'A-103', 25, 1, datetime('now'), datetime('now')),
('class-004', 'CM1-A', 'CM1', '2024-2025', 'tchr-004', 'A-104', 25, 1, datetime('now'), datetime('now')),
('class-005', 'CM2-A', 'CM2', '2024-2025', 'tchr-005', 'A-105', 25, 1, datetime('now'), datetime('now')),
('class-006', '6eme-A', '6eme', '2024-2025', 'tchr-001', 'B-201', 30, 1, datetime('now'), datetime('now')),
('class-007', '5eme-A', '5eme', '2024-2025', 'tchr-002', 'B-202', 30, 1, datetime('now'), datetime('now')),
('class-008', '4eme-A', '4eme', '2024-2025', 'tchr-003', 'B-203', 30, 1, datetime('now'), datetime('now')),
('class-009', '3eme-A', '3eme', '2024-2025', 'tchr-004', 'B-204', 30, 1, datetime('now'), datetime('now'));

-- 5. Students
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, medical_info, status, created_at, updated_at) VALUES
('std-001', 'KDS24001', 'Yacine', 'DIALLO', '2014-05-15', 'male', '2024-09-01', 'class-005', 'parent-001', 'Cocody', 'Fatima +225 07 11 22 33 46', NULL, 'active', datetime('now'), datetime('now')),
('std-002', 'KDS24002', 'Sarah', 'KONATE', '2014-08-22', 'female', '2024-09-01', 'class-005', 'parent-002', 'Plateau', 'Moussa +225 07 11 22 33 47', 'Asthme', 'active', datetime('now'), datetime('now')),
('std-003', 'KDS24003', 'David', 'COHEN', '2014-03-10', 'male', '2024-09-01', 'class-005', 'parent-001', 'Cocody', 'Rachel +225 07 11 22 33 48', NULL, 'active', datetime('now'), datetime('now')),
('std-004', 'KDS24004', 'Lea', 'BAMBA', '2014-11-30', 'female', '2024-09-01', 'class-005', 'parent-002', 'Yopougon', 'Sekou +225 07 11 22 33 49', NULL, 'active', datetime('now'), datetime('now')),
('std-005', 'KDS24005', 'Moshe', 'TOURE', '2014-07-18', 'male', '2024-09-01', 'class-005', 'parent-001', 'Marcory', 'Aminata +225 07 11 22 33 50', NULL, 'active', datetime('now'), datetime('now')),
('std-006', 'KDS24006', 'Esther', 'SANOGO', '2016-04-12', 'female', '2024-09-01', 'class-001', 'parent-002', 'Cocody', 'Bakary +225 07 11 22 33 51', NULL, 'active', datetime('now'), datetime('now')),
('std-007', 'KDS24007', 'Aaron', 'COULIBALY', '2016-09-25', 'male', '2024-09-01', 'class-001', 'parent-001', 'Plateau', 'Aicha +225 07 11 22 33 52', NULL, 'active', datetime('now'), datetime('now')),
('std-008', 'KDS24008', 'Miriam', 'TRAORE', '2012-06-08', 'female', '2024-09-01', 'class-006', 'parent-002', 'Yopougon', 'Jean +225 07 11 22 33 53', NULL, 'active', datetime('now'), datetime('now')),
('std-009', 'KDS24009', 'Samuel', 'DIABY', '2012-12-20', 'male', '2024-09-01', 'class-006', 'parent-001', 'Marcory', 'Marie +225 07 11 22 33 54', NULL, 'active', datetime('now'), datetime('now')),
('std-010', 'KDS24010', 'Hannah', 'KONE', '2013-02-14', 'female', '2024-09-01', 'class-006', 'parent-002', 'Cocody', 'Mohamed +225 07 11 22 33 55', 'Allergie arachides', 'active', datetime('now'), datetime('now'));

-- 6. Timetable Slots (day_of_week: 1=Lundi, 5=Vendredi)
INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, day_of_week, start_time, end_time, is_active, created_at, updated_at) VALUES
('slot-001', 'class-005', 'subj-001', 'tchr-001', 'A-105', 1, '08:00', '09:00', 1, datetime('now'), datetime('now')),
('slot-002', 'class-005', 'subj-002', 'tchr-002', 'A-105', 1, '09:00', '10:00', 1, datetime('now'), datetime('now')),
('slot-003', 'class-005', 'subj-006', 'tchr-005', 'A-105', 1, '10:30', '11:30', 1, datetime('now'), datetime('now')),
('slot-004', 'class-005', 'subj-007', 'tchr-005', 'A-105', 1, '11:30', '12:30', 1, datetime('now'), datetime('now')),
('slot-005', 'class-005', 'subj-001', 'tchr-001', 'A-105', 2, '08:00', '09:00', 1, datetime('now'), datetime('now')),
('slot-006', 'class-005', 'subj-003', 'tchr-003', 'Labo', 2, '09:00', '10:00', 1, datetime('now'), datetime('now')),
('slot-007', 'class-005', 'subj-004', 'tchr-003', 'A-105', 2, '10:30', '11:30', 1, datetime('now'), datetime('now')),
('slot-008', 'class-005', 'subj-008', 'tchr-001', 'Gymnase', 2, '11:30', '12:30', 1, datetime('now'), datetime('now')),
('slot-009', 'class-005', 'subj-002', 'tchr-002', 'A-105', 3, '08:00', '09:00', 1, datetime('now'), datetime('now')),
('slot-010', 'class-005', 'subj-005', 'tchr-004', 'A-105', 3, '09:00', '10:00', 1, datetime('now'), datetime('now')),
('slot-011', 'class-005', 'subj-006', 'tchr-005', 'A-105', 4, '08:00', '09:00', 1, datetime('now'), datetime('now')),
('slot-012', 'class-005', 'subj-001', 'tchr-001', 'A-105', 4, '09:00', '10:00', 1, datetime('now'), datetime('now')),
('slot-013', 'class-005', 'subj-010', 'tchr-004', 'Info', 4, '10:30', '11:30', 1, datetime('now'), datetime('now')),
('slot-014', 'class-005', 'subj-009', 'tchr-002', 'Atelier', 5, '08:00', '09:00', 1, datetime('now'), datetime('now')),
('slot-015', 'class-005', 'subj-003', 'tchr-003', 'Labo', 5, '09:00', '10:00', 1, datetime('now'), datetime('now'));

-- 7. Grades (subject TEXT, grade_type, score, max_score, academic_year, term)
INSERT INTO grades (id, student_id, subject, grade_type, score, max_score, teacher_id, academic_year, term, comments, graded_at, created_at) VALUES
('grade-001', 'std-001', 'Mathematiques', 'exam', 15.5, 20, 'tchr-001', '2024-2025', 'Trimestre 1', 'Bon travail', '2024-10-15', datetime('now')),
('grade-002', 'std-001', 'Francais', 'exam', 17.0, 20, 'tchr-002', '2024-2025', 'Trimestre 1', 'Excellent', '2024-10-16', datetime('now')),
('grade-003', 'std-002', 'Mathematiques', 'exam', 14.0, 20, 'tchr-001', '2024-2025', 'Trimestre 1', 'Bien', '2024-10-15', datetime('now')),
('grade-004', 'std-002', 'Francais', 'exam', 16.5, 20, 'tchr-002', '2024-2025', 'Trimestre 1', 'Tres bien', '2024-10-16', datetime('now')),
('grade-005', 'std-003', 'Mathematiques', 'exam', 18.0, 20, 'tchr-001', '2024-2025', 'Trimestre 1', 'Excellent', '2024-10-15', datetime('now'));

-- 8. Attendance (attendance_date, status, notes)
INSERT INTO attendance (id, student_id, class_id, attendance_date, status, notes, recorded_by, created_at) VALUES
('att-001', 'std-001', 'class-005', '2024-11-18', 'present', NULL, 'tchr-001', datetime('now')),
('att-002', 'std-002', 'class-005', '2024-11-18', 'present', NULL, 'tchr-001', datetime('now')),
('att-003', 'std-003', 'class-005', '2024-11-18', 'present', NULL, 'tchr-001', datetime('now')),
('att-004', 'std-004', 'class-005', '2024-11-18', 'absent', 'Malade', 'tchr-001', datetime('now')),
('att-005', 'std-005', 'class-005', '2024-11-18', 'present', NULL, 'tchr-001', datetime('now'));
