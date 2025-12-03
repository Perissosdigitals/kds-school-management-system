-- Truncate tables
TRUNCATE TABLE users, classes, students, teachers, grades, attendance, timetable_slots, subjects CASCADE;

-- Insert users with password 'Admin123!'
-- Hash: $2b$10$nk4wl5zkKko/YMRD.N08QOxyLk8G1StUBNL/GOgGuwErk0HGAMGWu
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@ksp-school.ci', '$2b$10$nk4wl5zkKko/YMRD.N08QOxyLk8G1StUBNL/GOgGuwErk0HGAMGWu', 'admin', 'Admin', 'Demo', '+225 01 02 03 04', true),
('550e8400-e29b-41d4-a716-446655440001', 'acoulibaly@ksp-school.ci', '$2b$10$nk4wl5zkKko/YMRD.N08QOxyLk8G1StUBNL/GOgGuwErk0HGAMGWu', 'teacher', 'Awa', 'Coulibaly', '+225 05 06 07 08', true),
('550e8400-e29b-41d4-a716-446655440002', 'mkone@ksp-school.ci', '$2b$10$nk4wl5zkKko/YMRD.N08QOxyLk8G1StUBNL/GOgGuwErk0HGAMGWu', 'teacher', 'Moussa', 'Kone', '+225 09 10 11 12', true),
('550e8400-e29b-41d4-a716-446655440003', 'parent1@example.ci', '$2b$10$nk4wl5zkKko/YMRD.N08QOxyLk8G1StUBNL/GOgGuwErk0HGAMGWu', 'parent', 'Parent', 'Test', '+225 13 14 15 16', true);

-- Insert teachers linked to users
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, status, user_id) VALUES
('880e8400-e29b-41d4-a716-446655440000', 'Awa', 'Coulibaly', 'acoulibaly@ksp-school.ci', '+225 05 06 07 08', 'Mathématiques', 'Actif', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440001', 'Moussa', 'Kone', 'mkone@ksp-school.ci', '+225 09 10 11 12', 'Français', 'Actif', '550e8400-e29b-41d4-a716-446655440002');

-- Insert classes
INSERT INTO classes (id, name, level, academic_year, room_number, capacity, is_active, main_teacher_id) VALUES
('660e8400-e29b-41d4-a716-446655440000', '6ème A', '6ème', '2024-2025', 'A101', 30, true, '880e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440001', '5ème B', '5ème', '2024-2025', 'B102', 28, true, '880e8400-e29b-41d4-a716-446655440001');

-- Insert students
INSERT INTO students (id, registration_number, first_name, last_name, dob, gender, class_id, status, nationality, address, registration_date, phone, grade_level, emergency_contact_name, emergency_contact_phone, birth_place) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'KDS2024001', 'Alice', 'Kouassi', '2010-03-15', 'Féminin', '660e8400-e29b-41d4-a716-446655440000', 'Actif', 'Ivoirienne', 'Abidjan', '2024-09-01', '+225 01 00 00 01', '6ème', 'Parent Test', '+225 13 14 15 16', 'Abidjan');

SELECT 'Portal seed data inserted successfully!' as message;
