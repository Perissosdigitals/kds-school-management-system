-- ============================================
-- KDS School Management System
-- Export PostgreSQL Local → Cloudflare D1
-- Date: 2025-11-19T23:56:24.327Z
-- ============================================

-- Nettoyer les données existantes (ordre important pour les FK)
DELETE FROM transactions;
DELETE FROM documents;
DELETE FROM students;
DELETE FROM teachers;
DELETE FROM classes;
DELETE FROM users;

-- ============================================
-- UTILISATEURS
-- ============================================
INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_active, created_at, updated_at) 
VALUES ('eae6ef16-295f-4cd6-8019-fc5ad4c53624', 'agent@kds-school.com', '', '', 'agent', 'CHANGE_ME', 0, '2025-11-19T23:56:24.329Z', '2025-11-19T23:56:24.329Z');
INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_active, created_at, updated_at) 
VALUES ('4949589a-7c76-4f7d-967a-5625b222eb5a', 'enseignant@kds-school.com', '', '', 'enseignant', 'CHANGE_ME', 0, '2025-11-19T23:56:24.329Z', '2025-11-19T23:56:24.329Z');
INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_active, created_at, updated_at) 
VALUES ('4f928830-bd40-4baf-ad4c-9c48e3f7ea7f', 'comptable@kds-school.com', '', '', 'comptable', 'CHANGE_ME', 0, '2025-11-19T23:56:24.329Z', '2025-11-19T23:56:24.329Z');
INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_active, created_at, updated_at) 
VALUES ('a0f334f8-c21d-4353-8189-730fceb61145', 'directrice@kds-school.com', '', '', 'directrice', 'CHANGE_ME', 0, '2025-11-19T23:56:24.329Z', '2025-11-19T23:56:24.329Z');
INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_active, created_at, updated_at) 
VALUES ('a7d11e6e-80e9-4872-9d94-20a24a6a6eb7', 'admin@kds-school.com', '', '', 'admin', 'CHANGE_ME', 0, '2025-11-19T23:56:24.329Z', '2025-11-19T23:56:24.329Z');
INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_active, created_at, updated_at) 
VALUES ('18a09cde-ea72-4a0f-956c-949ca4ac4dc0', 'fondatrice@kds-school.com', '', '', 'fondatrice', 'CHANGE_ME', 0, '2025-11-19T23:56:24.329Z', '2025-11-19T23:56:24.329Z');

-- ============================================
-- ENSEIGNANTS
-- ============================================
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES ('dcd5da0e-50e4-44a4-a44f-819e6594d617', 'Rachel', 'Abitbol', 'rachel.abitbol@kds.com', '0612345680', 'Sciences', '2025-11-19', 'active', datetime('now'));
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES ('e84628c2-184a-4f18-8ab9-39759e56bb2b', 'Yossef', 'Attias', 'yossef.attias@kds.com', '0612345683', 'Hébreu', '2025-11-19', 'active', datetime('now'));
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES ('96e31a0a-ea8b-4a5d-83b9-469883a6a69d', 'Esther', 'Azoulay', 'esther.azoulay@kds.com', '0612345682', 'Anglais', '2025-11-19', 'active', datetime('now'));
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES ('899e01d3-4b10-4974-9847-fa64ca196ee5', 'Michael', 'Benayoun', 'michael.benayoun@kds.com', '0612345681', 'Histoire', '2025-11-19', 'active', datetime('now'));
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES ('743cf567-5eec-468f-858a-6ca1ff53b2e2', 'Sarah', 'Cohen', 'sarah.cohen@kds.com', '0612345678', 'Mathématiques', '2025-11-19', 'active', datetime('now'));
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES ('8818acf2-bc34-4c8c-aa55-686a4c58bca9', 'Benjamin', 'Elfassi', 'benjamin.elfassi@kds.com', '0612345685', 'Sport', '2025-11-19', 'active', datetime('now'));
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES ('c5809d31-2e41-4150-b158-a2e9dc9f72ba', 'David', 'Levy', 'david.levy@kds.com', '0612345679', 'Français', '2025-11-19', 'active', datetime('now'));
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES ('82676aa3-52fb-4f66-a67f-7f98dec191db', 'Miriam', 'Toledano', 'miriam.toledano@kds.com', '0612345684', 'Torah', '2025-11-19', 'active', datetime('now'));

-- ============================================
-- CLASSES
-- ============================================

-- ============================================
-- ÉLÈVES
-- ============================================
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('ae9deffb-3090-4e47-a21e-96cfd88e34d7', 'KDS25001', 'TestCRUD', 'Frontend', '2012-01-15', 'male', 'CM1', NULL, '', '', 'Test Address', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('fc362559-c40d-4354-bf28-ee937daa015a', 'KDS2025CM2022', 'Jean Blaise yako', 'KOUASSI', '2010-05-15', 'female', 'CM2', '0b6cf1c7-1cd7-4d98-ab28-5b168f32b21b', '', '', 'Plateau, Abidjan', 'inactive', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('ed05401f-cf63-49b1-966b-090099013d7e', 'KDS2025CM2023', 'Fatou', 'DIALLO DIABI', '2011-03-20', 'female', 'CM2', '0b6cf1c7-1cd7-4d98-ab28-5b168f32b21b', '', '', 'Cocody, Abidjan', 'inactive', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('77fcc233-857b-4075-9717-f98c3e6ac1a0', 'KDS25002', 'Sanogo', 'Adamo', '2019-02-19', 'male', '6ème', NULL, '', '', 'Cocody attoban,Eglise St Bernard, Cite Attoban, villa G45', 'pending', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('445d4181-bea6-4109-b895-b3ab853d39b5', 'REG2024007', 'Shlomo', 'Kalfon', '2018-02-07', 'male', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '27 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('2e5ad8e5-f1bd-4d27-9777-c6fa96fb6736', 'REG2024008', 'Yitzhak', 'Abitbol', '2016-09-26', 'female', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '110 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('acfdfcc8-a816-4cbc-a585-c326e9f4a214', 'REG2024009', 'Shlomo', 'Benayoun', '2012-11-06', 'female', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '59 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('0dbdf2ad-c235-4442-bbe9-f85cf6eb1191', 'REG2024010', 'Rachel', 'Levy', '2011-02-13', 'female', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '59 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('3aeb6061-75be-4582-8e42-2b55562e0a11', 'REG2024011', 'Sarah', 'Cohen', '2018-04-25', 'female', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '163 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('064c069e-d50b-4d80-bd7d-d4fb2e87f440', 'REG2024012', 'Yitzhak', 'Attias', '2018-02-24', 'male', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '197 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('69a92fbe-072b-4675-ad6f-0cea4791ba43', 'REG2024013', 'Rivka', 'Benayoun', '2013-07-20', 'male', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '12 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('14bc9b67-da95-4a0f-9b72-3aef31933dbb', 'REG2024014', 'Daniel', 'Toledano', '2018-03-15', 'female', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '20 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('02368e62-387c-4d55-b86d-38ec90b8e1f9', 'REG2024015', 'Shlomo', 'Benayoun', '2014-01-14', 'male', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '43 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('a6cab94f-e919-4d13-ab3e-58bf2bf15782', 'REG2024016', 'Shlomo', 'Attias', '2019-11-12', 'male', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '97 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('900ae7bc-ffab-4072-8e3d-0682cc5ea363', 'REG2024018', 'Yitzhak', 'Kalfon', '2017-07-25', 'male', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '164 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('7d64c737-8a12-4d4c-a2ec-2c8e4f367670', 'REG2024020', 'Samuel', 'Kalfon', '2015-04-12', 'female', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '109 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('9eb32051-fd9e-4ca8-a560-87866744ce49', 'REG2024021', 'Daniel', 'Cohen', '2016-10-04', 'male', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '21 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('0340ce06-9e6c-46ad-9862-48775f8cce00', 'REG2024022', 'Sarah', 'Azoulay', '2013-04-09', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '47 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('106655c7-b0a5-4aa9-8ed1-30b49bab7e38', 'REG2024023', 'Yitzhak', 'Toledano', '2015-12-01', 'female', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '110 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('97f141c4-81b1-4e8d-b586-77a991bd59b5', 'REG2024024', 'Elie', 'Sibony', '2012-01-27', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '33 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('4b51790c-26fe-46e9-97fc-d4d921205c04', 'REG2024025', 'Shlomo', 'Azoulay', '2012-05-22', 'female', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '71 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('4e496c8d-57c4-40c1-a5b6-2c51ff192e6f', 'REG2024026', 'Chana', 'Toledano', '2010-09-24', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '141 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('78e3b3ae-bd4f-41f7-988d-3ed5fb8ea2f0', 'REG2024027', 'Yaakov', 'Toledano', '2014-08-10', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '186 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('51ff2260-3060-4da2-bd8a-dc321ca3e840', 'REG2024028', 'Samuel', 'Benayoun', '2017-08-14', 'female', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '96 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('b0864371-6376-46e6-a084-1ecc5d6763d3', 'REG2024029', 'Lea', 'Abitbol', '2018-02-24', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '3 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('1c27b568-2e50-48f3-b396-6930e1dad79b', 'REG2024032', 'Rachel', 'Sibony', '2013-09-24', 'female', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '9 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('42283ffd-2748-4af1-9e30-e4f2bea35765', 'REG2024034', 'Samuel', 'Levy', '2014-05-20', 'female', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '142 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('b352ff58-5223-4f8f-8182-251204a56f46', 'REG2024035', 'Yitzhak', 'Azoulay', '2018-11-06', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '105 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('3a447a56-7d60-48e7-9384-6750c68ffd70', 'REG2024036', 'Moche', 'Benayoun', '2012-09-13', 'female', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '175 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('455b1b24-7ff9-420f-bcfe-b9719714cc0b', 'REG2024037', 'Rachel', 'Abitbol', '2019-05-02', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '181 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('55b2a32b-ad1e-46e0-b533-35ba9446cb7e', 'REG2024040', 'Avraham', 'Attias', '2013-03-10', 'female', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '116 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('10a86ed8-21f2-4974-b3f4-505929956347', 'REG2024041', 'Lea', 'Abitbol', '2013-05-06', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '163 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('71a2b30e-061b-4c19-8f01-89b5f2209ffc', 'REG2024042', 'Elie', 'Abitbol', '2012-11-09', 'female', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '67 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('4db015b7-827c-40fc-81e2-08d06ff760e4', 'REG2024044', 'Shlomo', 'Attias', '2012-02-13', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '178 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('38498c4a-87eb-4989-85fd-4773a73bd50d', 'REG2024045', 'Rachel', 'Levy', '2013-01-05', 'male', 'CE1', '1ac019cd-724e-48b8-9669-c7a5ce581132', '', '', '110 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('06631ec1-d129-4883-aa1e-67283ff6853c', 'REG2024049', 'Yaakov', 'Azoulay', '2017-11-07', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '90 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('4971f3e9-bad0-473a-8350-fcbc7e4d394e', 'REG2024051', 'Rachel', 'Attias', '2011-12-24', 'female', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '102 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('1ee72bd0-2a61-4666-8e59-3f1c51700b67', 'REG2024052', 'Noam', 'Abitbol', '2013-04-17', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '3 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('93450dd5-372b-46d6-a3a6-aa2c4c2b02f0', 'REG2024053', 'Moche', 'Attias', '2015-05-27', 'female', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '158 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('64448dd9-7306-43e8-adc6-0848de9f33d9', 'REG2024054', 'Yitzhak', 'Kalfon', '2015-12-06', 'female', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '38 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('7ed4899d-6dd3-4c39-b946-4b1a600caba9', 'REG2024055', 'Avraham', 'Sibony', '2014-03-07', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '22 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('87fab955-ab79-47bd-a874-8e96fe032e34', 'REG2024056', 'Lea', 'Levy', '2011-08-08', 'female', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '199 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('405bbdaa-77fa-492c-b7cd-ae476c70cec2', 'REG2024057', 'Samuel', 'Sibony', '2019-05-18', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '97 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('1ff3ed84-9189-4023-a065-48a36d335fba', 'REG2024058', 'Elie', 'Cohen', '2018-05-01', 'female', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '18 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('a90ad817-cb7a-4fe6-9226-74bf549f45ef', 'REG2024059', 'Elie', 'Cohen', '2018-09-19', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '105 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('0e366314-b948-4b2a-a030-57a86d36e0e3', 'REG2024060', 'Nathan', 'Abitbol', '2018-10-22', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '119 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('af1141b8-0b38-4033-a6b0-dc036f0a4991', 'REG2024061', 'Nathan', 'Sibony', '2019-09-21', 'female', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '26 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('0592a82b-2b31-44b0-b10c-eb743d033a35', 'REG2024062', 'Avraham', 'Benayoun', '2012-01-04', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '183 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('a1dac60c-2896-47bf-b1db-51131464accc', 'REG2024063', 'Moche', 'Attias', '2018-07-04', 'female', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '159 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('1cf203be-4c26-451c-91eb-86ea27fce912', 'REG2024066', 'Lea', 'Kalfon', '2015-03-20', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '53 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('029a6593-a7b5-44ba-a606-bd0617fece27', 'REG2024068', 'Lea', 'Toledano', '2018-04-28', 'female', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '29 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('9d146310-8b82-455b-97c7-98476ea5c29b', 'REG2024069', 'Sarah', 'Elfassi', '2018-06-27', 'female', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '124 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('194f3b7e-9766-4b7e-8e9d-3843bfdb054a', 'REG2024070', 'Noam', 'Benayoun', '2019-01-16', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '93 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('a05c99f2-857b-404e-a6fd-6b324abb4022', 'REG2024072', 'Rivka', 'Azoulay', '2011-02-09', 'male', 'CE2', '6ad74053-8da7-4522-876a-a0af6df79450', '', '', '85 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('33867911-539e-4265-ada5-9c9510eb57d9', 'REG2024073', 'Noam', 'Toledano', '2014-10-01', 'male', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '197 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('683fdf67-7b76-462a-a4ed-caec1e18a285', 'REG2024076', 'Nathan', 'Elfassi', '2014-12-27', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '183 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('6206967f-a076-4ed1-a040-55773e8e7528', 'REG2024077', 'Rachel', 'Cohen', '2018-05-25', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '104 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('483347f8-a822-4547-aa88-fba6c5e85c28', 'REG2024079', 'Lea', 'Attias', '2017-10-21', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '20 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('91f72c77-2a15-4b0a-a6bc-837b7601a408', 'REG2024080', 'Daniel', 'Attias', '2016-03-19', 'male', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '92 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('95526e72-6909-4776-ba78-7af3e0534998', 'REG2024083', 'Lea', 'Kalfon', '2013-01-25', 'male', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '32 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('0b966549-3308-4413-9298-fb95286e0603', 'REG2024084', 'Samuel', 'Cohen', '2019-07-14', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '80 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('3ba8eeaa-9132-4d1c-8248-7d5100544f02', 'REG2024085', 'Daniel', 'Azoulay', '2016-04-28', 'male', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '145 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('97a703df-8dc5-4144-a659-3a9bab8b37a3', 'REG2024086', 'Samuel', 'Toledano', '2016-08-02', 'male', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '172 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('6d98b5fa-438d-4488-bbb6-dbffff902391', 'REG2024087', 'Nathan', 'Kalfon', '2018-04-28', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '70 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('262718f2-3825-407a-b179-5e49d0634186', 'REG2024090', 'Samuel', 'Kalfon', '2013-01-01', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '101 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('51d08817-ea47-49ef-855d-7bf44634a96b', 'REG2024091', 'Lea', 'Azoulay', '2013-08-03', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '95 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('17915089-c2f8-41bc-9473-b41f915ee438', 'REG2024092', 'Daniel', 'Benayoun', '2017-02-04', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '164 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('2a0e6982-4b74-455d-994c-d8dca94c06f4', 'REG2024093', 'Shlomo', 'Levy', '2016-03-21', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '44 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('3d5f3721-03d7-486b-afee-36794f64455f', 'REG2024094', 'Daniel', 'Azoulay', '2011-09-07', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '82 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('9a565082-58e4-4161-9c62-03e6581ef42b', 'REG2024096', 'Yitzhak', 'Abitbol', '2016-02-06', 'female', 'CM1', '9b24bde3-d785-4a1a-b464-b1e808b09725', '', '', '184 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('2b58051a-4af4-4fe9-8e84-008b451f7f38', 'REG2024098', 'Moche', 'Levy', '2013-07-10', 'male', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '138 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('0a371959-370e-4b28-8af8-2900700f2319', 'REG2024100', 'Daniel', 'Azoulay', '2015-05-05', 'female', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '24 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('892990f0-08f0-4cd0-aa1f-39509ae6e251', 'REG2024101', 'Sarah', 'Sibony', '2018-08-25', 'female', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '43 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('7862bfa7-b174-4b17-a2c4-1382996a23b1', 'REG2024102', 'Nathan', 'Levy', '2010-12-20', 'female', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '41 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('6bc0d9a1-d392-409f-8090-0199cfa53c5d', 'REG2024104', 'Lea', 'Kalfon', '2013-09-17', 'female', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '56 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('99245563-0359-4a54-be9d-b5ecac6a7d59', 'REG2024105', 'Daniel', 'Abitbol', '2011-07-01', 'male', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '63 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('28bbf571-2b27-444d-92c6-f10b9a695c8f', 'REG2024107', 'Rachel', 'Toledano', '2018-11-20', 'female', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '8 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('6e400df5-c2d6-41bf-b263-89533b6e58a8', 'REG2024109', 'Noam', 'Elfassi', '2017-03-19', 'male', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '58 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('45ee02b9-a880-48ef-93df-5822a1a8fdc7', 'REG2024110', 'Lea', 'Sibony', '2019-12-12', 'female', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '53 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('863aae77-596c-4197-b968-74d243010c79', 'REG2024111', 'Daniel', 'Elfassi', '2015-09-09', 'female', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '110 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('adf84c56-663c-4ec2-9cf0-eef20f6c5051', 'REG2024112', 'Noam', 'Kalfon', '2010-11-24', 'male', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '49 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('338f6d86-9902-4fa6-97f8-1625c7b7f9f7', 'REG2024113', 'Chana', 'Abitbol', '2012-08-26', 'male', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '129 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('57992188-f66a-4adb-96ac-4f225e62c7ab', 'REG2024115', 'Rachel', 'Levy', '2015-10-20', 'male', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '47 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('8a7da972-36d4-4fb2-9fe9-317575ebe6d2', 'REG2024117', 'Shlomo', 'Azoulay', '2019-04-09', 'male', 'CM2', '60847cc8-814b-4d7c-8f2e-cf5ee3516854', '', '', '198 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('855418ee-30fa-4f67-a1ff-e89aa6c44555', 'REG2024118', 'Samuel', 'Kalfon', '2013-06-13', 'male', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '127 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('729d4689-b409-41c5-9558-6b920f211a07', 'REG2024119', 'Shlomo', 'Elfassi', '2015-03-17', 'female', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '189 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('04f1b00a-4dc2-4c24-9863-eda0f59ddca7', 'REG2024120', 'Noam', 'Sibony', '2010-12-26', 'male', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '61 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('9d92bd81-eb6d-4269-b15d-810636572279', 'REG2024001', 'Rachel', 'Attias', '2016-07-09', 'female', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '86 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('5ef4867d-4640-4c69-a699-d43c4a0d0a98', 'REG2024122', 'Moche', 'Kalfon', '2015-11-14', 'male', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '12 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('3e02e9b1-dac2-4911-b67d-35cc6ae21d4b', 'REG2024123', 'Moche', 'Cohen', '2010-12-02', 'female', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '197 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('8947fe7f-db9e-4a5a-953e-70b3e1fa5d87', 'REG2024126', 'Sarah', 'Levy', '2013-01-01', 'female', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '94 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('a1e6c97c-152f-4363-a02d-bd50684ac79a', 'REG2024132', 'Moche', 'Kalfon', '2014-08-06', 'male', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '188 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('2ed2be6e-35d9-4fb7-a619-ffa43fd6d537', 'REG2024135', 'Lea', 'Sibony', '2015-06-02', 'female', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '50 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('3b5c96fd-69b7-4f3a-8cde-84abaad8bb6e', 'REG2024137', 'Yaakov', 'Benayoun', '2011-04-03', 'male', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '7 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('4290128d-f661-4d59-93c4-69c15ec55f5c', 'REG2024138', 'Nathan', 'Abitbol', '2017-01-11', 'female', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '7 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('9613c5d3-9372-4720-a4ab-fc8f4766cbd8', 'REG2024139', 'Shlomo', 'Sibony', '2016-08-20', 'female', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '5 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('864b63cb-e9e7-417f-9b49-5fde1f5baa7f', 'REG2024121', 'Chana', 'Toledano', '2011-06-15', 'female', '6ème', '826b91cb-f168-4e71-a539-e4fd6dfb6520', '', '', '190 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('7b6a8cf0-0070-42ed-bb67-4b57ffff8bc0', 'REG2024002', 'Shlomo', 'Cohen', '2019-03-13', 'female', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '88 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('2463c04d-1f73-4611-b984-554719176500', 'REG2024003', 'Nathan', 'Cohen', '2015-06-03', 'male', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '184 Rue de Paris, 75001 Paris', 'active', datetime('now'));
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('9dde0d81-0ec5-4eac-904a-4ea0e7536dbd', 'REG2024005', 'Lea', 'Levy', '2019-02-05', 'female', 'CP', 'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1', '', '', '36 Rue de Paris, 75001 Paris', 'active', datetime('now'));

-- ============================================
-- TRANSACTIONS FINANCIÈRES
-- ============================================

-- ============================================
-- STATISTIQUES
-- ============================================
-- Total élèves:      100
-- Total enseignants: 8
-- Total classes:     0
-- Total users:       6
-- Total transactions: 0
-- ============================================
