-- Seed data corrigé pour KDS School Management System
-- Les students/teachers sont liés aux users via user_id

-- Ajouter des users pour les étudiants
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
-- Users pour students
('770e8400-0000-0000-0000-000000000001', 'alice.dubois@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'Alice', 'Dubois', NULL, true),
('770e8400-0000-0000-0000-000000000002', 'bob.lefebvre@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'Bob', 'Lefebvre', NULL, true),
('770e8400-0000-0000-0000-000000000003', 'claire.martin@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'Claire', 'Martin', NULL, true),
('770e8400-0000-0000-0000-000000000004', 'david.bernard@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'David', 'Bernard', NULL, true),
('770e8400-0000-0000-0000-000000000005', 'emma.thomas@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'Emma', 'Thomas', NULL, true),
('770e8400-0000-0000-0000-000000000006', 'francois.robert@student.kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'student', 'François', 'Robert', NULL, true);

-- Insert students (liés aux users ci-dessus)
INSERT INTO students (id, user_id, student_code, birth_date, gender, enrollment_date, class_id, parent_id, status) VALUES
('770e8400-e29b-41d4-a716-446655440000', '770e8400-0000-0000-0000-000000000001', 'KDS2024001', '2010-03-15', 'F', '2024-09-01', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'active'),
('770e8400-e29b-41d4-a716-446655440001', '770e8400-0000-0000-0000-000000000002', 'KDS2024002', '2010-07-22', 'M', '2024-09-01', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'active'),
('770e8400-e29b-41d4-a716-446655440002', '770e8400-0000-0000-0000-000000000003', 'KDS2024003', '2009-11-08', 'F', '2024-09-01', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'active'),
('770e8400-e29b-41d4-a716-446655440003', '770e8400-0000-0000-0000-000000000004', 'KDS2024004', '2009-05-30', 'M', '2024-09-01', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'active'),
('770e8400-e29b-41d4-a716-446655440004', '770e8400-0000-0000-0000-000000000005', 'KDS2024005', '2008-09-12', 'F', '2024-09-01', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'active'),
('770e8400-e29b-41d4-a716-446655440005', '770e8400-0000-0000-0000-000000000006', 'KDS2024006', '2008-12-25', 'M', '2024-09-01', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'active');

-- Insert teachers (liés aux users teacher1 et teacher2)
INSERT INTO teachers (id, user_id, specialization, hire_date, status) VALUES
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', ARRAY['Mathématiques', 'Physique'], '2020-09-01', 'active'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', ARRAY['Français', 'Histoire'], '2021-01-15', 'active');

SELECT 'Seed data corrigé inséré avec succès!' as message;
