-- Utilisateurs essentiels (admin + fondatrice)
INSERT INTO users (id, is_active, email, password_hash, role, first_name, last_name, phone, address, created_at, updated_at, last_login) 
VALUES 
('a7d11e6e-80e9-4872-9d94-20a24a6a6eb7', 1, 'admin@kds-school.com', '$2b$10$mBxvNwZv/TUbRClgxSu8TOpKi4QNAb9/RKIfve52zTZRWV.F.wlzS', 'admin', 'Admin', 'KDS', NULL, NULL, '2025-11-19 02:25:40.444505', '2025-11-19 12:42:27.055757', NULL),
('18a09cde-ea72-4a0f-956c-949ca4ac4dc0', 1, 'fondatrice@kds-school.com', '$2b$10$mBxvNwZv/TUbRClgxSu8TOpKi4QNAb9/RKIfve52zTZRWV.F.wlzS', 'fondatrice', 'Madame', 'Fondatrice', NULL, NULL, '2025-11-19 02:25:40.430449', '2025-11-20 16:18:01.861878', '2025-11-20 16:18:01.853'),
('a0f334f8-c21d-4353-8189-730fceb61145', 1, 'directrice@kds-school.com', '$2b$10$mBxvNwZv/TUbRClgxSu8TOpKi4QNAb9/RKIfve52zTZRWV.F.wlzS', 'directrice', 'Mme', 'Directrice', NULL, NULL, '2025-11-19 02:25:40.44863', '2025-11-19 02:27:20.149541', NULL);

-- Classes
INSERT INTO classes (id, name, level, academic_year, main_teacher_id, room, max_students, is_active, created_at, updated_at)
VALUES
('e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', 'CP-A', 'CP', '2024-2025', NULL, NULL, 25, 1, '2025-11-19 02:25:40.49773', '2025-11-19 02:25:40.49773'),
('1ac019cd-724e-48b8-9669-c7a5ce581132', 'CE1-A', 'CE1', '2024-2025', NULL, NULL, 28, 1, '2025-11-19 02:25:40.501988', '2025-11-19 02:25:40.501988'),
('6ad74053-8da7-4522-876a-a0af6df79450', 'CE2-A', 'CE2', '2024-2025', NULL, NULL, 30, 1, '2025-11-19 02:25:40.505361', '2025-11-19 02:25:40.505361'),
('9b24bde3-d785-4a1a-b464-b1e808b09725', 'CM1-A', 'CM1', '2024-2025', NULL, NULL, 30, 1, '2025-11-19 02:25:40.508948', '2025-11-19 02:25:40.508948'),
('12a28935-c2d3-4bef-b35b-67dbd40de74d', 'CM2-A', 'CM2', '2024-2025', NULL, NULL, 32, 1, '2025-11-19 02:25:40.512401', '2025-11-19 02:25:40.512401'),
('93a77ec7-4ce5-4a2a-b8b2-b85f18398a96', '6ème-A', '6ème', '2024-2025', NULL, NULL, 30, 1, '2025-11-19 02:25:40.516066', '2025-11-19 02:25:40.516066');

-- Enseignants
INSERT INTO teachers (id, last_name, first_name, subject, phone, email, status, user_id, created_at, updated_at)
VALUES
('743cf567-5eec-468f-858a-6ca1ff53b2e2', 'Cohen', 'Sarah', 'Mathématiques', '0612345678', 'sarah.cohen@kds.com', 'Actif', '18a09cde-ea72-4a0f-956c-949ca4ac4dc0', '2025-11-19 02:25:40.464678', '2025-11-19 02:25:40.464678'),
('c5809d31-2e41-4150-b158-a2e9dc9f72ba', 'Levy', 'David', 'Français', '0612345679', 'david.levy@kds.com', 'Actif', '18a09cde-ea72-4a0f-956c-949ca4ac4dc0', '2025-11-19 02:25:40.470582', '2025-11-19 02:25:40.470582'),
('dcd5da0e-50e4-44a4-a44f-819e6594d617', 'Abitbol', 'Rachel', 'Sciences', '0612345680', 'rachel.abitbol@kds.com', 'Actif', '18a09cde-ea72-4a0f-956c-949ca4ac4dc0', '2025-11-19 02:25:40.474471', '2025-11-19 02:25:40.474471');
