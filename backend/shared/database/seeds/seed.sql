-- Seed data for KDS School Management System

-- Insert admin user (password: Admin123!)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'admin', 'Administrateur', 'Principal', '+242 06 123 4567', true),
('550e8400-e29b-41d4-a716-446655440001', 'teacher1@kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'teacher', 'Jean', 'Dupont', '+242 06 234 5678', true),
('550e8400-e29b-41d4-a716-446655440002', 'teacher2@kds.edu', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'teacher', 'Marie', 'Martin', '+242 06 345 6789', true),
('550e8400-e29b-41d4-a716-446655440003', 'parent1@email.com', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'parent', 'Pierre', 'Dubois', '+242 06 456 7890', true),
('550e8400-e29b-41d4-a716-446655440004', 'parent2@email.com', '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2', 'parent', 'Sophie', 'Lefebvre', '+242 06 567 8901', true);

-- Insert classes
INSERT INTO classes (id, name, level, academic_year, room_number, capacity, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440000', '6ème A', '6ème', '2024-2025', 'A101', 30, true),
('660e8400-e29b-41d4-a716-446655440001', '5ème B', '5ème', '2024-2025', 'B102', 28, true),
('660e8400-e29b-41d4-a716-446655440002', '4ème C', '4ème', '2024-2025', 'C103', 25, true);

-- Insert students
INSERT INTO students (id, student_code, first_name, last_name, date_of_birth, gender, class_id, parent_id, status) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'KDS2024001', 'Alice', 'Dubois', '2010-03-15', 'F', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'active'),
('770e8400-e29b-41d4-a716-446655440001', 'KDS2024002', 'Bob', 'Lefebvre', '2010-07-22', 'M', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'active'),
('770e8400-e29b-41d4-a716-446655440002', 'KDS2024003', 'Claire', 'Martin', '2009-11-08', 'F', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'active'),
('770e8400-e29b-41d4-a716-446655440003', 'KDS2024004', 'David', 'Bernard', '2009-05-30', 'M', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'active'),
('770e8400-e29b-41d4-a716-446655440004', 'KDS2024005', 'Emma', 'Thomas', '2008-09-12', 'F', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'active'),
('770e8400-e29b-41d4-a716-446655440005', 'KDS2024006', 'François', 'Robert', '2008-12-25', 'M', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'active');

-- Insert teachers
INSERT INTO teachers (id, first_name, last_name, email, phone, hire_date, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440000', 'Jean', 'Dupont', 'teacher1@kds.edu', '+242 06 234 5678', '2020-09-01', true),
('880e8400-e29b-41d4-a716-446655440001', 'Marie', 'Martin', 'teacher2@kds.edu', '+242 06 345 6789', '2021-01-15', true);

SELECT 'Seed data inserted successfully!' as message;
