-- Truncate tables to start fresh
TRUNCATE TABLE users, classes, students, teachers, grades, attendance, timetable_slots, subjects CASCADE;

-- Insert admin user (password: Admin123!)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'admin', 'Administrateur', 'Principal', '+242 06 123 4567', true),
('550e8400-e29b-41d4-a716-446655440001', 'teacher1@kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'teacher', 'Jean', 'Dupont', '+242 06 234 5678', true),
('550e8400-e29b-41d4-a716-446655440002', 'teacher2@kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'teacher', 'Marie', 'Martin', '+242 06 345 6789', true),
('550e8400-e29b-41d4-a716-446655440003', 'parent1@email.com', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'parent', 'Pierre', 'Dubois', '+242 06 456 7890', true),
('550e8400-e29b-41d4-a716-446655440004', 'parent2@email.com', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'parent', 'Sophie', 'Lefebvre', '+242 06 567 8901', true);

-- Insert teachers
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, status, user_id) VALUES
('880e8400-e29b-41d4-a716-446655440000', 'Jean', 'Dupont', 'teacher1@kds.edu', '+242 06 234 5678', 'Mathématiques', 'Actif', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440001', 'Marie', 'Martin', 'teacher2@kds.edu', '+242 06 345 6789', 'Français', 'Actif', '550e8400-e29b-41d4-a716-446655440002');

-- Insert classes
INSERT INTO classes (id, name, level, academic_year, room_number, capacity, is_active, main_teacher_id) VALUES
('660e8400-e29b-41d4-a716-446655440000', '6ème A', '6ème', '2024-2025', 'A101', 30, true, '880e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440001', '5ème B', '5ème', '2024-2025', 'B102', 28, true, '880e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440002', '4ème C', '4ème', '2024-2025', 'C103', 25, true, NULL);

-- Insert students
INSERT INTO students (id, registration_number, first_name, last_name, dob, gender, class_id, status, nationality, address, registration_date, phone, grade_level, emergency_contact_name, emergency_contact_phone, birth_place) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'KDS2024001', 'Alice', 'Dubois', '2010-03-15', 'Féminin', '660e8400-e29b-41d4-a716-446655440000', 'Actif', 'Congolaise', '123 Rue de la Paix', '2024-09-01', '+242 06 000 0001', '6ème', 'Pierre Dubois', '+242 06 456 7890', 'Brazzaville'),
('770e8400-e29b-41d4-a716-446655440001', 'KDS2024002', 'Bob', 'Lefebvre', '2010-07-22', 'Masculin', '660e8400-e29b-41d4-a716-446655440000', 'Actif', 'Congolaise', '456 Avenue de la Liberté', '2024-09-01', '+242 06 000 0002', '6ème', 'Sophie Lefebvre', '+242 06 567 8901', 'Pointe-Noire'),
('770e8400-e29b-41d4-a716-446655440002', 'KDS2024003', 'Claire', 'Martin', '2009-11-08', 'Féminin', '660e8400-e29b-41d4-a716-446655440001', 'Actif', 'Congolaise', '789 Boulevard de la République', '2024-09-01', '+242 06 000 0003', '5ème', 'Pierre Dubois', '+242 06 456 7890', 'Brazzaville'),
('770e8400-e29b-41d4-a716-446655440003', 'KDS2024004', 'David', 'Bernard', '2009-05-30', 'Masculin', '660e8400-e29b-41d4-a716-446655440001', 'Actif', 'Congolaise', '101 Rue des Fleurs', '2024-09-01', '+242 06 000 0004', '5ème', 'Sophie Lefebvre', '+242 06 567 8901', 'Pointe-Noire'),
('770e8400-e29b-41d4-a716-446655440004', 'KDS2024005', 'Emma', 'Thomas', '2008-09-12', 'Féminin', '660e8400-e29b-41d4-a716-446655440002', 'Actif', 'Congolaise', '202 Avenue des Palmiers', '2024-09-01', '+242 06 000 0005', '4ème', 'Pierre Dubois', '+242 06 456 7890', 'Brazzaville'),
('770e8400-e29b-41d4-a716-446655440005', 'KDS2024006', 'François', 'Robert', '2008-12-25', 'Masculin', '660e8400-e29b-41d4-a716-446655440002', 'Actif', 'Congolaise', '303 Rue des Acacias', '2024-09-01', '+242 06 000 0006', '4ème', 'Sophie Lefebvre', '+242 06 567 8901', 'Pointe-Noire');

SELECT 'Seed data inserted successfully!' as message;
