-- Seed data for KDS School Management System (D1/SQLite Compatible)

PRAGMA foreign_keys = OFF;

-- Insert admin and test users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
-- Admin user (password: admin123)
('550e8400e29b41d4a716446655440000', 'admin@kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'admin', 'Admin', 'System', '+33123456789', 1),

-- Teachers
('550e8400e29b41d4a716446655440001', 'jean.dupont@teacher.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'teacher', 'Jean', 'Dupont', '+33123456790', 1),
('550e8400e29b41d4a716446655440002', 'marie.durand@teacher.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'teacher', 'Marie', 'Durand', '+33123456791', 1),

-- Parents
('550e8400e29b41d4a716446655440003', 'parent1@example.com', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'parent', 'Pierre', 'Dubois', '+33123456792', 1),
('550e8400e29b41d4a716446655440004', 'parent2@example.com', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'parent', 'Sophie', 'Martin', '+33123456793', 1),

-- Students users
('770e8400000000000000000000000001', 'alice.dubois@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'Alice', 'Dubois', NULL, 1),
('770e8400000000000000000000000002', 'bob.lefebvre@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'Bob', 'Lefebvre', NULL, 1),
('770e8400000000000000000000000003', 'claire.martin@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'Claire', 'Martin', NULL, 1),
('770e8400000000000000000000000004', 'david.bernard@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'David', 'Bernard', NULL, 1),
('770e8400000000000000000000000005', 'emma.thomas@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'Emma', 'Thomas', NULL, 1),
('770e8400000000000000000000000006', 'francois.robert@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'François', 'Robert', NULL, 1);

-- Insert subjects
INSERT INTO subjects (id, name, code, color, is_active) VALUES
('990e8400e29b41d4a716446655440000', 'Mathématiques', 'MATH', '#3B82F6', 1),
('990e8400e29b41d4a716446655440001', 'Français', 'FR', '#EF4444', 1),
('990e8400e29b41d4a716446655440002', 'Histoire-Géographie', 'HIST', '#F59E0B', 1),
('990e8400e29b41d4a716446655440003', 'Sciences', 'SCI', '#10B981', 1),
('990e8400e29b41d4a716446655440004', 'Anglais', 'ENG', '#6366F1', 1);

-- Insert teachers
INSERT INTO teachers (id, user_id, specialization, hire_date, status) VALUES
('880e8400e29b41d4a716446655440000', '550e8400e29b41d4a716446655440001', '["Mathématiques", "Physique"]', '2020-09-01', 'active'),
('880e8400e29b41d4a716446655440001', '550e8400e29b41d4a716446655440002', '["Français", "Histoire"]', '2021-01-15', 'active');

-- Insert classes
INSERT INTO classes (id, name, level, academic_year, main_teacher_id, room_number, capacity, is_active) VALUES
('660e8400e29b41d4a716446655440000', 'CM1-A', 'CM1', '2024-2025', '880e8400e29b41d4a716446655440000', 'A101', 25, 1),
('660e8400e29b41d4a716446655440001', 'CM2-A', 'CM2', '2024-2025', '880e8400e29b41d4a716446655440001', 'A102', 28, 1),
('660e8400e29b41d4a716446655440002', '6ème-A', '6ème', '2024-2025', '880e8400e29b41d4a716446655440000', 'B201', 30, 1);

-- Insert students
INSERT INTO students (id, user_id, student_code, birth_date, gender, enrollment_date, class_id, parent_id, status) VALUES
('770e8400e29b41d4a716446655440000', '770e8400000000000000000000000001', 'KDS2024001', '2010-03-15', 'female', '2024-09-01', '660e8400e29b41d4a716446655440000', '550e8400e29b41d4a716446655440003', 'active'),
('770e8400e29b41d4a716446655440001', '770e8400000000000000000000000002', 'KDS2024002', '2010-07-22', 'male', '2024-09-01', '660e8400e29b41d4a716446655440000', '550e8400e29b41d4a716446655440004', 'active'),
('770e8400e29b41d4a716446655440002', '770e8400000000000000000000000003', 'KDS2024003', '2009-11-08', 'female', '2024-09-01', '660e8400e29b41d4a716446655440001', '550e8400e29b41d4a716446655440003', 'active'),
('770e8400e29b41d4a716446655440003', '770e8400000000000000000000000004', 'KDS2024004', '2009-05-30', 'male', '2024-09-01', '660e8400e29b41d4a716446655440001', '550e8400e29b41d4a716446655440004', 'active'),
('770e8400e29b41d4a716446655440004', '770e8400000000000000000000000005', 'KDS2024005', '2008-09-12', 'female', '2024-09-01', '660e8400e29b41d4a716446655440002', '550e8400e29b41d4a716446655440003', 'active'),
('770e8400e29b41d4a716446655440005', '770e8400000000000000000000000006', 'KDS2024006', '2008-12-25', 'male', '2024-09-01', '660e8400e29b41d4a716446655440002', '550e8400e29b41d4a716446655440004', 'active');

-- Insert sample grades
INSERT INTO grades (student_id, subject_id, grade, max_grade, evaluation_date, recorded_by) VALUES
('770e8400e29b41d4a716446655440000', '990e8400e29b41d4a716446655440000', 15.5, 20, '2024-10-15', '880e8400e29b41d4a716446655440000'),
('770e8400e29b41d4a716446655440000', '990e8400e29b41d4a716446655440001', 17.0, 20, '2024-10-15', '880e8400e29b41d4a716446655440001'),
('770e8400e29b41d4a716446655440001', '990e8400e29b41d4a716446655440000', 13.0, 20, '2024-10-15', '880e8400e29b41d4a716446655440000'),
('770e8400e29b41d4a716446655440001', '990e8400e29b41d4a716446655440001', 14.5, 20, '2024-10-15', '880e8400e29b41d4a716446655440001');

-- Insert sample timetable
INSERT INTO timetable_slots (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room) VALUES
('660e8400e29b41d4a716446655440000', '990e8400e29b41d4a716446655440000', '880e8400e29b41d4a716446655440000', 1, '08:00', '09:00', 'A101'),
('660e8400e29b41d4a716446655440000', '990e8400e29b41d4a716446655440001', '880e8400e29b41d4a716446655440001', 1, '09:00', '10:00', 'A101'),
('660e8400e29b41d4a716446655440000', '990e8400e29b41d4a716446655440003', '880e8400e29b41d4a716446655440000', 2, '08:00', '09:00', 'A101');

-- Insert sample attendance
INSERT INTO attendance (student_id, date, status, period, recorded_by) VALUES
('770e8400e29b41d4a716446655440000', '2024-11-18', 'present', 'full_day', '880e8400e29b41d4a716446655440000'),
('770e8400e29b41d4a716446655440001', '2024-11-18', 'present', 'full_day', '880e8400e29b41d4a716446655440000'),
('770e8400e29b41d4a716446655440002', '2024-11-18', 'absent', 'full_day', '880e8400e29b41d4a716446655440001'),
('770e8400e29b41d4a716446655440003', '2024-11-18', 'present', 'full_day', '880e8400e29b41d4a716446655440001');

PRAGMA foreign_keys = ON;

SELECT 'Seed data inserted successfully!' as message;
