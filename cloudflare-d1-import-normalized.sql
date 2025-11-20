-- ============================================
-- KDS School Management System - D1 Import Data (Normalized)
-- Generated: 2025-11-20T00:16:55.812Z
-- ============================================

-- ============================================
-- USERS
-- ============================================
-- Admin user already created by schema


INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-teacher-dcd5da0e-50e4-44a4-a44f-819e6594d617',
  'rachel.abitbol@kds.com',
  '$2a$10$dummy.hash.for.dcd5da0e-50e4-44a4-a44f-819e6594d617',
  'teacher',
  'Rachel',
  'Abitbol',
  '0612345680',
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-teacher-e84628c2-184a-4f18-8ab9-39759e56bb2b',
  'yossef.attias@kds.com',
  '$2a$10$dummy.hash.for.e84628c2-184a-4f18-8ab9-39759e56bb2b',
  'teacher',
  'Yossef',
  'Attias',
  '0612345683',
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-teacher-96e31a0a-ea8b-4a5d-83b9-469883a6a69d',
  'esther.azoulay@kds.com',
  '$2a$10$dummy.hash.for.96e31a0a-ea8b-4a5d-83b9-469883a6a69d',
  'teacher',
  'Esther',
  'Azoulay',
  '0612345682',
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-teacher-899e01d3-4b10-4974-9847-fa64ca196ee5',
  'michael.benayoun@kds.com',
  '$2a$10$dummy.hash.for.899e01d3-4b10-4974-9847-fa64ca196ee5',
  'teacher',
  'Michael',
  'Benayoun',
  '0612345681',
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-teacher-743cf567-5eec-468f-858a-6ca1ff53b2e2',
  'sarah.cohen@kds.com',
  '$2a$10$dummy.hash.for.743cf567-5eec-468f-858a-6ca1ff53b2e2',
  'teacher',
  'Sarah',
  'Cohen',
  '0612345678',
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-teacher-8818acf2-bc34-4c8c-aa55-686a4c58bca9',
  'benjamin.elfassi@kds.com',
  '$2a$10$dummy.hash.for.8818acf2-bc34-4c8c-aa55-686a4c58bca9',
  'teacher',
  'Benjamin',
  'Elfassi',
  '0612345685',
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-teacher-c5809d31-2e41-4150-b158-a2e9dc9f72ba',
  'david.levy@kds.com',
  '$2a$10$dummy.hash.for.c5809d31-2e41-4150-b158-a2e9dc9f72ba',
  'teacher',
  'David',
  'Levy',
  '0612345679',
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-teacher-82676aa3-52fb-4f66-a67f-7f98dec191db',
  'miriam.toledano@kds.com',
  '$2a$10$dummy.hash.for.82676aa3-52fb-4f66-a67f-7f98dec191db',
  'teacher',
  'Miriam',
  'Toledano',
  '0612345684',
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-ae9deffb-3090-4e47-a21e-96cfd88e34d7',
  'KDS25001@kds-student.com',
  '$2a$10$dummy.hash.for.ae9deffb-3090-4e47-a21e-96cfd88e34d7',
  'student',
  'TestCRUD',
  'Frontend',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-fc362559-c40d-4354-bf28-ee937daa015a',
  'KDS2025CM2022@kds-student.com',
  '$2a$10$dummy.hash.for.fc362559-c40d-4354-bf28-ee937daa015a',
  'student',
  'Jean Blaise yako',
  'KOUASSI',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-ed05401f-cf63-49b1-966b-090099013d7e',
  'KDS2025CM2023@kds-student.com',
  '$2a$10$dummy.hash.for.ed05401f-cf63-49b1-966b-090099013d7e',
  'student',
  'Fatou',
  'DIALLO DIABI',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-77fcc233-857b-4075-9717-f98c3e6ac1a0',
  'KDS25002@kds-student.com',
  '$2a$10$dummy.hash.for.77fcc233-857b-4075-9717-f98c3e6ac1a0',
  'student',
  'Sanogo',
  'Adamo',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-445d4181-bea6-4109-b895-b3ab853d39b5',
  'REG2024007@kds-student.com',
  '$2a$10$dummy.hash.for.445d4181-bea6-4109-b895-b3ab853d39b5',
  'student',
  'Shlomo',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-2e5ad8e5-f1bd-4d27-9777-c6fa96fb6736',
  'REG2024008@kds-student.com',
  '$2a$10$dummy.hash.for.2e5ad8e5-f1bd-4d27-9777-c6fa96fb6736',
  'student',
  'Yitzhak',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-acfdfcc8-a816-4cbc-a585-c326e9f4a214',
  'REG2024009@kds-student.com',
  '$2a$10$dummy.hash.for.acfdfcc8-a816-4cbc-a585-c326e9f4a214',
  'student',
  'Shlomo',
  'Benayoun',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-0dbdf2ad-c235-4442-bbe9-f85cf6eb1191',
  'REG2024010@kds-student.com',
  '$2a$10$dummy.hash.for.0dbdf2ad-c235-4442-bbe9-f85cf6eb1191',
  'student',
  'Rachel',
  'Levy',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-3aeb6061-75be-4582-8e42-2b55562e0a11',
  'REG2024011@kds-student.com',
  '$2a$10$dummy.hash.for.3aeb6061-75be-4582-8e42-2b55562e0a11',
  'student',
  'Sarah',
  'Cohen',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-064c069e-d50b-4d80-bd7d-d4fb2e87f440',
  'REG2024012@kds-student.com',
  '$2a$10$dummy.hash.for.064c069e-d50b-4d80-bd7d-d4fb2e87f440',
  'student',
  'Yitzhak',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-69a92fbe-072b-4675-ad6f-0cea4791ba43',
  'REG2024013@kds-student.com',
  '$2a$10$dummy.hash.for.69a92fbe-072b-4675-ad6f-0cea4791ba43',
  'student',
  'Rivka',
  'Benayoun',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-14bc9b67-da95-4a0f-9b72-3aef31933dbb',
  'REG2024014@kds-student.com',
  '$2a$10$dummy.hash.for.14bc9b67-da95-4a0f-9b72-3aef31933dbb',
  'student',
  'Daniel',
  'Toledano',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-02368e62-387c-4d55-b86d-38ec90b8e1f9',
  'REG2024015@kds-student.com',
  '$2a$10$dummy.hash.for.02368e62-387c-4d55-b86d-38ec90b8e1f9',
  'student',
  'Shlomo',
  'Benayoun',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-a6cab94f-e919-4d13-ab3e-58bf2bf15782',
  'REG2024016@kds-student.com',
  '$2a$10$dummy.hash.for.a6cab94f-e919-4d13-ab3e-58bf2bf15782',
  'student',
  'Shlomo',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-900ae7bc-ffab-4072-8e3d-0682cc5ea363',
  'REG2024018@kds-student.com',
  '$2a$10$dummy.hash.for.900ae7bc-ffab-4072-8e3d-0682cc5ea363',
  'student',
  'Yitzhak',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-7d64c737-8a12-4d4c-a2ec-2c8e4f367670',
  'REG2024020@kds-student.com',
  '$2a$10$dummy.hash.for.7d64c737-8a12-4d4c-a2ec-2c8e4f367670',
  'student',
  'Samuel',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-9eb32051-fd9e-4ca8-a560-87866744ce49',
  'REG2024021@kds-student.com',
  '$2a$10$dummy.hash.for.9eb32051-fd9e-4ca8-a560-87866744ce49',
  'student',
  'Daniel',
  'Cohen',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-0340ce06-9e6c-46ad-9862-48775f8cce00',
  'REG2024022@kds-student.com',
  '$2a$10$dummy.hash.for.0340ce06-9e6c-46ad-9862-48775f8cce00',
  'student',
  'Sarah',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-106655c7-b0a5-4aa9-8ed1-30b49bab7e38',
  'REG2024023@kds-student.com',
  '$2a$10$dummy.hash.for.106655c7-b0a5-4aa9-8ed1-30b49bab7e38',
  'student',
  'Yitzhak',
  'Toledano',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-97f141c4-81b1-4e8d-b586-77a991bd59b5',
  'REG2024024@kds-student.com',
  '$2a$10$dummy.hash.for.97f141c4-81b1-4e8d-b586-77a991bd59b5',
  'student',
  'Elie',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-4b51790c-26fe-46e9-97fc-d4d921205c04',
  'REG2024025@kds-student.com',
  '$2a$10$dummy.hash.for.4b51790c-26fe-46e9-97fc-d4d921205c04',
  'student',
  'Shlomo',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-4e496c8d-57c4-40c1-a5b6-2c51ff192e6f',
  'REG2024026@kds-student.com',
  '$2a$10$dummy.hash.for.4e496c8d-57c4-40c1-a5b6-2c51ff192e6f',
  'student',
  'Chana',
  'Toledano',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-78e3b3ae-bd4f-41f7-988d-3ed5fb8ea2f0',
  'REG2024027@kds-student.com',
  '$2a$10$dummy.hash.for.78e3b3ae-bd4f-41f7-988d-3ed5fb8ea2f0',
  'student',
  'Yaakov',
  'Toledano',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-51ff2260-3060-4da2-bd8a-dc321ca3e840',
  'REG2024028@kds-student.com',
  '$2a$10$dummy.hash.for.51ff2260-3060-4da2-bd8a-dc321ca3e840',
  'student',
  'Samuel',
  'Benayoun',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-b0864371-6376-46e6-a084-1ecc5d6763d3',
  'REG2024029@kds-student.com',
  '$2a$10$dummy.hash.for.b0864371-6376-46e6-a084-1ecc5d6763d3',
  'student',
  'Lea',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-1c27b568-2e50-48f3-b396-6930e1dad79b',
  'REG2024032@kds-student.com',
  '$2a$10$dummy.hash.for.1c27b568-2e50-48f3-b396-6930e1dad79b',
  'student',
  'Rachel',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-42283ffd-2748-4af1-9e30-e4f2bea35765',
  'REG2024034@kds-student.com',
  '$2a$10$dummy.hash.for.42283ffd-2748-4af1-9e30-e4f2bea35765',
  'student',
  'Samuel',
  'Levy',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-b352ff58-5223-4f8f-8182-251204a56f46',
  'REG2024035@kds-student.com',
  '$2a$10$dummy.hash.for.b352ff58-5223-4f8f-8182-251204a56f46',
  'student',
  'Yitzhak',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-3a447a56-7d60-48e7-9384-6750c68ffd70',
  'REG2024036@kds-student.com',
  '$2a$10$dummy.hash.for.3a447a56-7d60-48e7-9384-6750c68ffd70',
  'student',
  'Moche',
  'Benayoun',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-455b1b24-7ff9-420f-bcfe-b9719714cc0b',
  'REG2024037@kds-student.com',
  '$2a$10$dummy.hash.for.455b1b24-7ff9-420f-bcfe-b9719714cc0b',
  'student',
  'Rachel',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-55b2a32b-ad1e-46e0-b533-35ba9446cb7e',
  'REG2024040@kds-student.com',
  '$2a$10$dummy.hash.for.55b2a32b-ad1e-46e0-b533-35ba9446cb7e',
  'student',
  'Avraham',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-10a86ed8-21f2-4974-b3f4-505929956347',
  'REG2024041@kds-student.com',
  '$2a$10$dummy.hash.for.10a86ed8-21f2-4974-b3f4-505929956347',
  'student',
  'Lea',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-71a2b30e-061b-4c19-8f01-89b5f2209ffc',
  'REG2024042@kds-student.com',
  '$2a$10$dummy.hash.for.71a2b30e-061b-4c19-8f01-89b5f2209ffc',
  'student',
  'Elie',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-4db015b7-827c-40fc-81e2-08d06ff760e4',
  'REG2024044@kds-student.com',
  '$2a$10$dummy.hash.for.4db015b7-827c-40fc-81e2-08d06ff760e4',
  'student',
  'Shlomo',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-38498c4a-87eb-4989-85fd-4773a73bd50d',
  'REG2024045@kds-student.com',
  '$2a$10$dummy.hash.for.38498c4a-87eb-4989-85fd-4773a73bd50d',
  'student',
  'Rachel',
  'Levy',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-06631ec1-d129-4883-aa1e-67283ff6853c',
  'REG2024049@kds-student.com',
  '$2a$10$dummy.hash.for.06631ec1-d129-4883-aa1e-67283ff6853c',
  'student',
  'Yaakov',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-4971f3e9-bad0-473a-8350-fcbc7e4d394e',
  'REG2024051@kds-student.com',
  '$2a$10$dummy.hash.for.4971f3e9-bad0-473a-8350-fcbc7e4d394e',
  'student',
  'Rachel',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-1ee72bd0-2a61-4666-8e59-3f1c51700b67',
  'REG2024052@kds-student.com',
  '$2a$10$dummy.hash.for.1ee72bd0-2a61-4666-8e59-3f1c51700b67',
  'student',
  'Noam',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-93450dd5-372b-46d6-a3a6-aa2c4c2b02f0',
  'REG2024053@kds-student.com',
  '$2a$10$dummy.hash.for.93450dd5-372b-46d6-a3a6-aa2c4c2b02f0',
  'student',
  'Moche',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-64448dd9-7306-43e8-adc6-0848de9f33d9',
  'REG2024054@kds-student.com',
  '$2a$10$dummy.hash.for.64448dd9-7306-43e8-adc6-0848de9f33d9',
  'student',
  'Yitzhak',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-7ed4899d-6dd3-4c39-b946-4b1a600caba9',
  'REG2024055@kds-student.com',
  '$2a$10$dummy.hash.for.7ed4899d-6dd3-4c39-b946-4b1a600caba9',
  'student',
  'Avraham',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-87fab955-ab79-47bd-a874-8e96fe032e34',
  'REG2024056@kds-student.com',
  '$2a$10$dummy.hash.for.87fab955-ab79-47bd-a874-8e96fe032e34',
  'student',
  'Lea',
  'Levy',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-405bbdaa-77fa-492c-b7cd-ae476c70cec2',
  'REG2024057@kds-student.com',
  '$2a$10$dummy.hash.for.405bbdaa-77fa-492c-b7cd-ae476c70cec2',
  'student',
  'Samuel',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-1ff3ed84-9189-4023-a065-48a36d335fba',
  'REG2024058@kds-student.com',
  '$2a$10$dummy.hash.for.1ff3ed84-9189-4023-a065-48a36d335fba',
  'student',
  'Elie',
  'Cohen',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-a90ad817-cb7a-4fe6-9226-74bf549f45ef',
  'REG2024059@kds-student.com',
  '$2a$10$dummy.hash.for.a90ad817-cb7a-4fe6-9226-74bf549f45ef',
  'student',
  'Elie',
  'Cohen',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-0e366314-b948-4b2a-a030-57a86d36e0e3',
  'REG2024060@kds-student.com',
  '$2a$10$dummy.hash.for.0e366314-b948-4b2a-a030-57a86d36e0e3',
  'student',
  'Nathan',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-af1141b8-0b38-4033-a6b0-dc036f0a4991',
  'REG2024061@kds-student.com',
  '$2a$10$dummy.hash.for.af1141b8-0b38-4033-a6b0-dc036f0a4991',
  'student',
  'Nathan',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-0592a82b-2b31-44b0-b10c-eb743d033a35',
  'REG2024062@kds-student.com',
  '$2a$10$dummy.hash.for.0592a82b-2b31-44b0-b10c-eb743d033a35',
  'student',
  'Avraham',
  'Benayoun',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-a1dac60c-2896-47bf-b1db-51131464accc',
  'REG2024063@kds-student.com',
  '$2a$10$dummy.hash.for.a1dac60c-2896-47bf-b1db-51131464accc',
  'student',
  'Moche',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-1cf203be-4c26-451c-91eb-86ea27fce912',
  'REG2024066@kds-student.com',
  '$2a$10$dummy.hash.for.1cf203be-4c26-451c-91eb-86ea27fce912',
  'student',
  'Lea',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-029a6593-a7b5-44ba-a606-bd0617fece27',
  'REG2024068@kds-student.com',
  '$2a$10$dummy.hash.for.029a6593-a7b5-44ba-a606-bd0617fece27',
  'student',
  'Lea',
  'Toledano',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-9d146310-8b82-455b-97c7-98476ea5c29b',
  'REG2024069@kds-student.com',
  '$2a$10$dummy.hash.for.9d146310-8b82-455b-97c7-98476ea5c29b',
  'student',
  'Sarah',
  'Elfassi',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-194f3b7e-9766-4b7e-8e9d-3843bfdb054a',
  'REG2024070@kds-student.com',
  '$2a$10$dummy.hash.for.194f3b7e-9766-4b7e-8e9d-3843bfdb054a',
  'student',
  'Noam',
  'Benayoun',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-a05c99f2-857b-404e-a6fd-6b324abb4022',
  'REG2024072@kds-student.com',
  '$2a$10$dummy.hash.for.a05c99f2-857b-404e-a6fd-6b324abb4022',
  'student',
  'Rivka',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-33867911-539e-4265-ada5-9c9510eb57d9',
  'REG2024073@kds-student.com',
  '$2a$10$dummy.hash.for.33867911-539e-4265-ada5-9c9510eb57d9',
  'student',
  'Noam',
  'Toledano',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-683fdf67-7b76-462a-a4ed-caec1e18a285',
  'REG2024076@kds-student.com',
  '$2a$10$dummy.hash.for.683fdf67-7b76-462a-a4ed-caec1e18a285',
  'student',
  'Nathan',
  'Elfassi',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-6206967f-a076-4ed1-a040-55773e8e7528',
  'REG2024077@kds-student.com',
  '$2a$10$dummy.hash.for.6206967f-a076-4ed1-a040-55773e8e7528',
  'student',
  'Rachel',
  'Cohen',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-483347f8-a822-4547-aa88-fba6c5e85c28',
  'REG2024079@kds-student.com',
  '$2a$10$dummy.hash.for.483347f8-a822-4547-aa88-fba6c5e85c28',
  'student',
  'Lea',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-91f72c77-2a15-4b0a-a6bc-837b7601a408',
  'REG2024080@kds-student.com',
  '$2a$10$dummy.hash.for.91f72c77-2a15-4b0a-a6bc-837b7601a408',
  'student',
  'Daniel',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-95526e72-6909-4776-ba78-7af3e0534998',
  'REG2024083@kds-student.com',
  '$2a$10$dummy.hash.for.95526e72-6909-4776-ba78-7af3e0534998',
  'student',
  'Lea',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-0b966549-3308-4413-9298-fb95286e0603',
  'REG2024084@kds-student.com',
  '$2a$10$dummy.hash.for.0b966549-3308-4413-9298-fb95286e0603',
  'student',
  'Samuel',
  'Cohen',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-3ba8eeaa-9132-4d1c-8248-7d5100544f02',
  'REG2024085@kds-student.com',
  '$2a$10$dummy.hash.for.3ba8eeaa-9132-4d1c-8248-7d5100544f02',
  'student',
  'Daniel',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-97a703df-8dc5-4144-a659-3a9bab8b37a3',
  'REG2024086@kds-student.com',
  '$2a$10$dummy.hash.for.97a703df-8dc5-4144-a659-3a9bab8b37a3',
  'student',
  'Samuel',
  'Toledano',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-6d98b5fa-438d-4488-bbb6-dbffff902391',
  'REG2024087@kds-student.com',
  '$2a$10$dummy.hash.for.6d98b5fa-438d-4488-bbb6-dbffff902391',
  'student',
  'Nathan',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-262718f2-3825-407a-b179-5e49d0634186',
  'REG2024090@kds-student.com',
  '$2a$10$dummy.hash.for.262718f2-3825-407a-b179-5e49d0634186',
  'student',
  'Samuel',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-51d08817-ea47-49ef-855d-7bf44634a96b',
  'REG2024091@kds-student.com',
  '$2a$10$dummy.hash.for.51d08817-ea47-49ef-855d-7bf44634a96b',
  'student',
  'Lea',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-17915089-c2f8-41bc-9473-b41f915ee438',
  'REG2024092@kds-student.com',
  '$2a$10$dummy.hash.for.17915089-c2f8-41bc-9473-b41f915ee438',
  'student',
  'Daniel',
  'Benayoun',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-2a0e6982-4b74-455d-994c-d8dca94c06f4',
  'REG2024093@kds-student.com',
  '$2a$10$dummy.hash.for.2a0e6982-4b74-455d-994c-d8dca94c06f4',
  'student',
  'Shlomo',
  'Levy',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-3d5f3721-03d7-486b-afee-36794f64455f',
  'REG2024094@kds-student.com',
  '$2a$10$dummy.hash.for.3d5f3721-03d7-486b-afee-36794f64455f',
  'student',
  'Daniel',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-9a565082-58e4-4161-9c62-03e6581ef42b',
  'REG2024096@kds-student.com',
  '$2a$10$dummy.hash.for.9a565082-58e4-4161-9c62-03e6581ef42b',
  'student',
  'Yitzhak',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-2b58051a-4af4-4fe9-8e84-008b451f7f38',
  'REG2024098@kds-student.com',
  '$2a$10$dummy.hash.for.2b58051a-4af4-4fe9-8e84-008b451f7f38',
  'student',
  'Moche',
  'Levy',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-0a371959-370e-4b28-8af8-2900700f2319',
  'REG2024100@kds-student.com',
  '$2a$10$dummy.hash.for.0a371959-370e-4b28-8af8-2900700f2319',
  'student',
  'Daniel',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-892990f0-08f0-4cd0-aa1f-39509ae6e251',
  'REG2024101@kds-student.com',
  '$2a$10$dummy.hash.for.892990f0-08f0-4cd0-aa1f-39509ae6e251',
  'student',
  'Sarah',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-7862bfa7-b174-4b17-a2c4-1382996a23b1',
  'REG2024102@kds-student.com',
  '$2a$10$dummy.hash.for.7862bfa7-b174-4b17-a2c4-1382996a23b1',
  'student',
  'Nathan',
  'Levy',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-6bc0d9a1-d392-409f-8090-0199cfa53c5d',
  'REG2024104@kds-student.com',
  '$2a$10$dummy.hash.for.6bc0d9a1-d392-409f-8090-0199cfa53c5d',
  'student',
  'Lea',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-99245563-0359-4a54-be9d-b5ecac6a7d59',
  'REG2024105@kds-student.com',
  '$2a$10$dummy.hash.for.99245563-0359-4a54-be9d-b5ecac6a7d59',
  'student',
  'Daniel',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-28bbf571-2b27-444d-92c6-f10b9a695c8f',
  'REG2024107@kds-student.com',
  '$2a$10$dummy.hash.for.28bbf571-2b27-444d-92c6-f10b9a695c8f',
  'student',
  'Rachel',
  'Toledano',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-6e400df5-c2d6-41bf-b263-89533b6e58a8',
  'REG2024109@kds-student.com',
  '$2a$10$dummy.hash.for.6e400df5-c2d6-41bf-b263-89533b6e58a8',
  'student',
  'Noam',
  'Elfassi',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-45ee02b9-a880-48ef-93df-5822a1a8fdc7',
  'REG2024110@kds-student.com',
  '$2a$10$dummy.hash.for.45ee02b9-a880-48ef-93df-5822a1a8fdc7',
  'student',
  'Lea',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-863aae77-596c-4197-b968-74d243010c79',
  'REG2024111@kds-student.com',
  '$2a$10$dummy.hash.for.863aae77-596c-4197-b968-74d243010c79',
  'student',
  'Daniel',
  'Elfassi',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-adf84c56-663c-4ec2-9cf0-eef20f6c5051',
  'REG2024112@kds-student.com',
  '$2a$10$dummy.hash.for.adf84c56-663c-4ec2-9cf0-eef20f6c5051',
  'student',
  'Noam',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-338f6d86-9902-4fa6-97f8-1625c7b7f9f7',
  'REG2024113@kds-student.com',
  '$2a$10$dummy.hash.for.338f6d86-9902-4fa6-97f8-1625c7b7f9f7',
  'student',
  'Chana',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-57992188-f66a-4adb-96ac-4f225e62c7ab',
  'REG2024115@kds-student.com',
  '$2a$10$dummy.hash.for.57992188-f66a-4adb-96ac-4f225e62c7ab',
  'student',
  'Rachel',
  'Levy',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-8a7da972-36d4-4fb2-9fe9-317575ebe6d2',
  'REG2024117@kds-student.com',
  '$2a$10$dummy.hash.for.8a7da972-36d4-4fb2-9fe9-317575ebe6d2',
  'student',
  'Shlomo',
  'Azoulay',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-855418ee-30fa-4f67-a1ff-e89aa6c44555',
  'REG2024118@kds-student.com',
  '$2a$10$dummy.hash.for.855418ee-30fa-4f67-a1ff-e89aa6c44555',
  'student',
  'Samuel',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-729d4689-b409-41c5-9558-6b920f211a07',
  'REG2024119@kds-student.com',
  '$2a$10$dummy.hash.for.729d4689-b409-41c5-9558-6b920f211a07',
  'student',
  'Shlomo',
  'Elfassi',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-04f1b00a-4dc2-4c24-9863-eda0f59ddca7',
  'REG2024120@kds-student.com',
  '$2a$10$dummy.hash.for.04f1b00a-4dc2-4c24-9863-eda0f59ddca7',
  'student',
  'Noam',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-9d92bd81-eb6d-4269-b15d-810636572279',
  'REG2024001@kds-student.com',
  '$2a$10$dummy.hash.for.9d92bd81-eb6d-4269-b15d-810636572279',
  'student',
  'Rachel',
  'Attias',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-5ef4867d-4640-4c69-a699-d43c4a0d0a98',
  'REG2024122@kds-student.com',
  '$2a$10$dummy.hash.for.5ef4867d-4640-4c69-a699-d43c4a0d0a98',
  'student',
  'Moche',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-3e02e9b1-dac2-4911-b67d-35cc6ae21d4b',
  'REG2024123@kds-student.com',
  '$2a$10$dummy.hash.for.3e02e9b1-dac2-4911-b67d-35cc6ae21d4b',
  'student',
  'Moche',
  'Cohen',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-8947fe7f-db9e-4a5a-953e-70b3e1fa5d87',
  'REG2024126@kds-student.com',
  '$2a$10$dummy.hash.for.8947fe7f-db9e-4a5a-953e-70b3e1fa5d87',
  'student',
  'Sarah',
  'Levy',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-a1e6c97c-152f-4363-a02d-bd50684ac79a',
  'REG2024132@kds-student.com',
  '$2a$10$dummy.hash.for.a1e6c97c-152f-4363-a02d-bd50684ac79a',
  'student',
  'Moche',
  'Kalfon',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-2ed2be6e-35d9-4fb7-a619-ffa43fd6d537',
  'REG2024135@kds-student.com',
  '$2a$10$dummy.hash.for.2ed2be6e-35d9-4fb7-a619-ffa43fd6d537',
  'student',
  'Lea',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-3b5c96fd-69b7-4f3a-8cde-84abaad8bb6e',
  'REG2024137@kds-student.com',
  '$2a$10$dummy.hash.for.3b5c96fd-69b7-4f3a-8cde-84abaad8bb6e',
  'student',
  'Yaakov',
  'Benayoun',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-4290128d-f661-4d59-93c4-69c15ec55f5c',
  'REG2024138@kds-student.com',
  '$2a$10$dummy.hash.for.4290128d-f661-4d59-93c4-69c15ec55f5c',
  'student',
  'Nathan',
  'Abitbol',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-9613c5d3-9372-4720-a4ab-fc8f4766cbd8',
  'REG2024139@kds-student.com',
  '$2a$10$dummy.hash.for.9613c5d3-9372-4720-a4ab-fc8f4766cbd8',
  'student',
  'Shlomo',
  'Sibony',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-864b63cb-e9e7-417f-9b49-5fde1f5baa7f',
  'REG2024121@kds-student.com',
  '$2a$10$dummy.hash.for.864b63cb-e9e7-417f-9b49-5fde1f5baa7f',
  'student',
  'Chana',
  'Toledano',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-7b6a8cf0-0070-42ed-bb67-4b57ffff8bc0',
  'REG2024002@kds-student.com',
  '$2a$10$dummy.hash.for.7b6a8cf0-0070-42ed-bb67-4b57ffff8bc0',
  'student',
  'Shlomo',
  'Cohen',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-2463c04d-1f73-4611-b984-554719176500',
  'REG2024003@kds-student.com',
  '$2a$10$dummy.hash.for.2463c04d-1f73-4611-b984-554719176500',
  'student',
  'Nathan',
  'Cohen',
  NULL,
  0
);

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  'user-student-9dde0d81-0ec5-4eac-904a-4ea0e7536dbd',
  'REG2024005@kds-student.com',
  '$2a$10$dummy.hash.for.9dde0d81-0ec5-4eac-904a-4ea0e7536dbd',
  'student',
  'Lea',
  'Levy',
  NULL,
  0
);

-- ============================================
-- TEACHERS
-- ============================================

INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  'teacher-dcd5da0e-50e4-44a4-a44f-819e6594d617',
  'user-teacher-dcd5da0e-50e4-44a4-a44f-819e6594d617',
  'Sciences',
  '2025-11-20',
  'Actif'
);

INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  'teacher-e84628c2-184a-4f18-8ab9-39759e56bb2b',
  'user-teacher-e84628c2-184a-4f18-8ab9-39759e56bb2b',
  'Hébreu',
  '2025-11-20',
  'Actif'
);

INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  'teacher-96e31a0a-ea8b-4a5d-83b9-469883a6a69d',
  'user-teacher-96e31a0a-ea8b-4a5d-83b9-469883a6a69d',
  'Anglais',
  '2025-11-20',
  'Actif'
);

INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  'teacher-899e01d3-4b10-4974-9847-fa64ca196ee5',
  'user-teacher-899e01d3-4b10-4974-9847-fa64ca196ee5',
  'Histoire',
  '2025-11-20',
  'Actif'
);

INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  'teacher-743cf567-5eec-468f-858a-6ca1ff53b2e2',
  'user-teacher-743cf567-5eec-468f-858a-6ca1ff53b2e2',
  'Mathématiques',
  '2025-11-20',
  'Actif'
);

INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  'teacher-8818acf2-bc34-4c8c-aa55-686a4c58bca9',
  'user-teacher-8818acf2-bc34-4c8c-aa55-686a4c58bca9',
  'Sport',
  '2025-11-20',
  'Actif'
);

INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  'teacher-c5809d31-2e41-4150-b158-a2e9dc9f72ba',
  'user-teacher-c5809d31-2e41-4150-b158-a2e9dc9f72ba',
  'Français',
  '2025-11-20',
  'Actif'
);

INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  'teacher-82676aa3-52fb-4f66-a67f-7f98dec191db',
  'user-teacher-82676aa3-52fb-4f66-a67f-7f98dec191db',
  'Torah',
  '2025-11-20',
  'Actif'
);

-- ============================================
-- STUDENTS
-- ============================================

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-ae9deffb-3090-4e47-a21e-96cfd88e34d7',
  'user-student-ae9deffb-3090-4e47-a21e-96cfd88e34d7',
  'KDS25001',
  NULL,
  'Masculin',
  'Ivoirienne',
  'Abidjan',
  'Test Address',
  '2025-11-20',
  NULL,
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-fc362559-c40d-4354-bf28-ee937daa015a',
  'user-student-fc362559-c40d-4354-bf28-ee937daa015a',
  'KDS2025CM2022',
  NULL,
  'Féminin',
  'Ivoirienne',
  'Abidjan',
  'Plateau, Abidjan',
  '2025-11-20',
  '0b6cf1c7-1cd7-4d98-ab28-5b168f32b21b',
  'CM2',
  NULL,
  'Aucune allergie connue',
  'Inactif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-ed05401f-cf63-49b1-966b-090099013d7e',
  'user-student-ed05401f-cf63-49b1-966b-090099013d7e',
  'KDS2025CM2023',
  NULL,
  'Féminin',
  'Ivoirienne',
  'Yamoussoukro',
  'Cocody, Abidjan',
  '2025-11-20',
  '0b6cf1c7-1cd7-4d98-ab28-5b168f32b21b',
  'CM2',
  NULL,
  NULL,
  'Inactif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-77fcc233-857b-4075-9717-f98c3e6ac1a0',
  'user-student-77fcc233-857b-4075-9717-f98c3e6ac1a0',
  'KDS25002',
  NULL,
  'Masculin',
  'Burkinabé',
  'Bobo Dioulasso',
  'Cocody attoban,Eglise St Bernard, Cite Attoban, villa G45',
  '2025-11-20',
  NULL,
  '6ème',
  NULL,
  NULL,
  'En attente'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-445d4181-bea6-4109-b895-b3ab853d39b5',
  'user-student-445d4181-bea6-4109-b895-b3ab853d39b5',
  'REG2024007',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '27 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-2e5ad8e5-f1bd-4d27-9777-c6fa96fb6736',
  'user-student-2e5ad8e5-f1bd-4d27-9777-c6fa96fb6736',
  'REG2024008',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '110 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-acfdfcc8-a816-4cbc-a585-c326e9f4a214',
  'user-student-acfdfcc8-a816-4cbc-a585-c326e9f4a214',
  'REG2024009',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '59 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-0dbdf2ad-c235-4442-bbe9-f85cf6eb1191',
  'user-student-0dbdf2ad-c235-4442-bbe9-f85cf6eb1191',
  'REG2024010',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '59 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-3aeb6061-75be-4582-8e42-2b55562e0a11',
  'user-student-3aeb6061-75be-4582-8e42-2b55562e0a11',
  'REG2024011',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '163 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-064c069e-d50b-4d80-bd7d-d4fb2e87f440',
  'user-student-064c069e-d50b-4d80-bd7d-d4fb2e87f440',
  'REG2024012',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '197 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-69a92fbe-072b-4675-ad6f-0cea4791ba43',
  'user-student-69a92fbe-072b-4675-ad6f-0cea4791ba43',
  'REG2024013',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '12 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-14bc9b67-da95-4a0f-9b72-3aef31933dbb',
  'user-student-14bc9b67-da95-4a0f-9b72-3aef31933dbb',
  'REG2024014',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '20 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-02368e62-387c-4d55-b86d-38ec90b8e1f9',
  'user-student-02368e62-387c-4d55-b86d-38ec90b8e1f9',
  'REG2024015',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '43 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-a6cab94f-e919-4d13-ab3e-58bf2bf15782',
  'user-student-a6cab94f-e919-4d13-ab3e-58bf2bf15782',
  'REG2024016',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '97 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-900ae7bc-ffab-4072-8e3d-0682cc5ea363',
  'user-student-900ae7bc-ffab-4072-8e3d-0682cc5ea363',
  'REG2024018',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '164 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-7d64c737-8a12-4d4c-a2ec-2c8e4f367670',
  'user-student-7d64c737-8a12-4d4c-a2ec-2c8e4f367670',
  'REG2024020',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '109 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-9eb32051-fd9e-4ca8-a560-87866744ce49',
  'user-student-9eb32051-fd9e-4ca8-a560-87866744ce49',
  'REG2024021',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '21 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-0340ce06-9e6c-46ad-9862-48775f8cce00',
  'user-student-0340ce06-9e6c-46ad-9862-48775f8cce00',
  'REG2024022',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '47 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-106655c7-b0a5-4aa9-8ed1-30b49bab7e38',
  'user-student-106655c7-b0a5-4aa9-8ed1-30b49bab7e38',
  'REG2024023',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '110 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-97f141c4-81b1-4e8d-b586-77a991bd59b5',
  'user-student-97f141c4-81b1-4e8d-b586-77a991bd59b5',
  'REG2024024',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '33 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-4b51790c-26fe-46e9-97fc-d4d921205c04',
  'user-student-4b51790c-26fe-46e9-97fc-d4d921205c04',
  'REG2024025',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '71 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-4e496c8d-57c4-40c1-a5b6-2c51ff192e6f',
  'user-student-4e496c8d-57c4-40c1-a5b6-2c51ff192e6f',
  'REG2024026',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '141 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-78e3b3ae-bd4f-41f7-988d-3ed5fb8ea2f0',
  'user-student-78e3b3ae-bd4f-41f7-988d-3ed5fb8ea2f0',
  'REG2024027',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '186 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-51ff2260-3060-4da2-bd8a-dc321ca3e840',
  'user-student-51ff2260-3060-4da2-bd8a-dc321ca3e840',
  'REG2024028',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '96 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-b0864371-6376-46e6-a084-1ecc5d6763d3',
  'user-student-b0864371-6376-46e6-a084-1ecc5d6763d3',
  'REG2024029',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '3 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-1c27b568-2e50-48f3-b396-6930e1dad79b',
  'user-student-1c27b568-2e50-48f3-b396-6930e1dad79b',
  'REG2024032',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '9 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-42283ffd-2748-4af1-9e30-e4f2bea35765',
  'user-student-42283ffd-2748-4af1-9e30-e4f2bea35765',
  'REG2024034',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '142 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-b352ff58-5223-4f8f-8182-251204a56f46',
  'user-student-b352ff58-5223-4f8f-8182-251204a56f46',
  'REG2024035',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '105 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-3a447a56-7d60-48e7-9384-6750c68ffd70',
  'user-student-3a447a56-7d60-48e7-9384-6750c68ffd70',
  'REG2024036',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '175 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-455b1b24-7ff9-420f-bcfe-b9719714cc0b',
  'user-student-455b1b24-7ff9-420f-bcfe-b9719714cc0b',
  'REG2024037',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '181 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-55b2a32b-ad1e-46e0-b533-35ba9446cb7e',
  'user-student-55b2a32b-ad1e-46e0-b533-35ba9446cb7e',
  'REG2024040',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '116 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-10a86ed8-21f2-4974-b3f4-505929956347',
  'user-student-10a86ed8-21f2-4974-b3f4-505929956347',
  'REG2024041',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '163 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-71a2b30e-061b-4c19-8f01-89b5f2209ffc',
  'user-student-71a2b30e-061b-4c19-8f01-89b5f2209ffc',
  'REG2024042',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '67 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-4db015b7-827c-40fc-81e2-08d06ff760e4',
  'user-student-4db015b7-827c-40fc-81e2-08d06ff760e4',
  'REG2024044',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '178 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-38498c4a-87eb-4989-85fd-4773a73bd50d',
  'user-student-38498c4a-87eb-4989-85fd-4773a73bd50d',
  'REG2024045',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '110 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '1ac019cd-724e-48b8-9669-c7a5ce581132',
  'CE1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-06631ec1-d129-4883-aa1e-67283ff6853c',
  'user-student-06631ec1-d129-4883-aa1e-67283ff6853c',
  'REG2024049',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '90 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-4971f3e9-bad0-473a-8350-fcbc7e4d394e',
  'user-student-4971f3e9-bad0-473a-8350-fcbc7e4d394e',
  'REG2024051',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '102 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-1ee72bd0-2a61-4666-8e59-3f1c51700b67',
  'user-student-1ee72bd0-2a61-4666-8e59-3f1c51700b67',
  'REG2024052',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '3 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-93450dd5-372b-46d6-a3a6-aa2c4c2b02f0',
  'user-student-93450dd5-372b-46d6-a3a6-aa2c4c2b02f0',
  'REG2024053',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '158 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-64448dd9-7306-43e8-adc6-0848de9f33d9',
  'user-student-64448dd9-7306-43e8-adc6-0848de9f33d9',
  'REG2024054',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '38 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-7ed4899d-6dd3-4c39-b946-4b1a600caba9',
  'user-student-7ed4899d-6dd3-4c39-b946-4b1a600caba9',
  'REG2024055',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '22 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-87fab955-ab79-47bd-a874-8e96fe032e34',
  'user-student-87fab955-ab79-47bd-a874-8e96fe032e34',
  'REG2024056',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '199 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-405bbdaa-77fa-492c-b7cd-ae476c70cec2',
  'user-student-405bbdaa-77fa-492c-b7cd-ae476c70cec2',
  'REG2024057',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '97 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-1ff3ed84-9189-4023-a065-48a36d335fba',
  'user-student-1ff3ed84-9189-4023-a065-48a36d335fba',
  'REG2024058',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '18 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-a90ad817-cb7a-4fe6-9226-74bf549f45ef',
  'user-student-a90ad817-cb7a-4fe6-9226-74bf549f45ef',
  'REG2024059',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '105 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-0e366314-b948-4b2a-a030-57a86d36e0e3',
  'user-student-0e366314-b948-4b2a-a030-57a86d36e0e3',
  'REG2024060',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '119 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-af1141b8-0b38-4033-a6b0-dc036f0a4991',
  'user-student-af1141b8-0b38-4033-a6b0-dc036f0a4991',
  'REG2024061',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '26 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-0592a82b-2b31-44b0-b10c-eb743d033a35',
  'user-student-0592a82b-2b31-44b0-b10c-eb743d033a35',
  'REG2024062',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '183 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-a1dac60c-2896-47bf-b1db-51131464accc',
  'user-student-a1dac60c-2896-47bf-b1db-51131464accc',
  'REG2024063',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '159 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-1cf203be-4c26-451c-91eb-86ea27fce912',
  'user-student-1cf203be-4c26-451c-91eb-86ea27fce912',
  'REG2024066',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '53 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-029a6593-a7b5-44ba-a606-bd0617fece27',
  'user-student-029a6593-a7b5-44ba-a606-bd0617fece27',
  'REG2024068',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '29 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-9d146310-8b82-455b-97c7-98476ea5c29b',
  'user-student-9d146310-8b82-455b-97c7-98476ea5c29b',
  'REG2024069',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '124 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-194f3b7e-9766-4b7e-8e9d-3843bfdb054a',
  'user-student-194f3b7e-9766-4b7e-8e9d-3843bfdb054a',
  'REG2024070',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '93 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-a05c99f2-857b-404e-a6fd-6b324abb4022',
  'user-student-a05c99f2-857b-404e-a6fd-6b324abb4022',
  'REG2024072',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '85 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '6ad74053-8da7-4522-876a-a0af6df79450',
  'CE2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-33867911-539e-4265-ada5-9c9510eb57d9',
  'user-student-33867911-539e-4265-ada5-9c9510eb57d9',
  'REG2024073',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '197 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-683fdf67-7b76-462a-a4ed-caec1e18a285',
  'user-student-683fdf67-7b76-462a-a4ed-caec1e18a285',
  'REG2024076',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '183 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-6206967f-a076-4ed1-a040-55773e8e7528',
  'user-student-6206967f-a076-4ed1-a040-55773e8e7528',
  'REG2024077',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '104 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-483347f8-a822-4547-aa88-fba6c5e85c28',
  'user-student-483347f8-a822-4547-aa88-fba6c5e85c28',
  'REG2024079',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '20 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-91f72c77-2a15-4b0a-a6bc-837b7601a408',
  'user-student-91f72c77-2a15-4b0a-a6bc-837b7601a408',
  'REG2024080',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '92 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-95526e72-6909-4776-ba78-7af3e0534998',
  'user-student-95526e72-6909-4776-ba78-7af3e0534998',
  'REG2024083',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '32 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-0b966549-3308-4413-9298-fb95286e0603',
  'user-student-0b966549-3308-4413-9298-fb95286e0603',
  'REG2024084',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '80 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-3ba8eeaa-9132-4d1c-8248-7d5100544f02',
  'user-student-3ba8eeaa-9132-4d1c-8248-7d5100544f02',
  'REG2024085',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '145 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-97a703df-8dc5-4144-a659-3a9bab8b37a3',
  'user-student-97a703df-8dc5-4144-a659-3a9bab8b37a3',
  'REG2024086',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '172 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-6d98b5fa-438d-4488-bbb6-dbffff902391',
  'user-student-6d98b5fa-438d-4488-bbb6-dbffff902391',
  'REG2024087',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '70 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-262718f2-3825-407a-b179-5e49d0634186',
  'user-student-262718f2-3825-407a-b179-5e49d0634186',
  'REG2024090',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '101 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-51d08817-ea47-49ef-855d-7bf44634a96b',
  'user-student-51d08817-ea47-49ef-855d-7bf44634a96b',
  'REG2024091',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '95 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-17915089-c2f8-41bc-9473-b41f915ee438',
  'user-student-17915089-c2f8-41bc-9473-b41f915ee438',
  'REG2024092',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '164 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-2a0e6982-4b74-455d-994c-d8dca94c06f4',
  'user-student-2a0e6982-4b74-455d-994c-d8dca94c06f4',
  'REG2024093',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '44 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-3d5f3721-03d7-486b-afee-36794f64455f',
  'user-student-3d5f3721-03d7-486b-afee-36794f64455f',
  'REG2024094',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '82 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-9a565082-58e4-4161-9c62-03e6581ef42b',
  'user-student-9a565082-58e4-4161-9c62-03e6581ef42b',
  'REG2024096',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '184 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '9b24bde3-d785-4a1a-b464-b1e808b09725',
  'CM1',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-2b58051a-4af4-4fe9-8e84-008b451f7f38',
  'user-student-2b58051a-4af4-4fe9-8e84-008b451f7f38',
  'REG2024098',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '138 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-0a371959-370e-4b28-8af8-2900700f2319',
  'user-student-0a371959-370e-4b28-8af8-2900700f2319',
  'REG2024100',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '24 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-892990f0-08f0-4cd0-aa1f-39509ae6e251',
  'user-student-892990f0-08f0-4cd0-aa1f-39509ae6e251',
  'REG2024101',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '43 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-7862bfa7-b174-4b17-a2c4-1382996a23b1',
  'user-student-7862bfa7-b174-4b17-a2c4-1382996a23b1',
  'REG2024102',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '41 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-6bc0d9a1-d392-409f-8090-0199cfa53c5d',
  'user-student-6bc0d9a1-d392-409f-8090-0199cfa53c5d',
  'REG2024104',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '56 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-99245563-0359-4a54-be9d-b5ecac6a7d59',
  'user-student-99245563-0359-4a54-be9d-b5ecac6a7d59',
  'REG2024105',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '63 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-28bbf571-2b27-444d-92c6-f10b9a695c8f',
  'user-student-28bbf571-2b27-444d-92c6-f10b9a695c8f',
  'REG2024107',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '8 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-6e400df5-c2d6-41bf-b263-89533b6e58a8',
  'user-student-6e400df5-c2d6-41bf-b263-89533b6e58a8',
  'REG2024109',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '58 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-45ee02b9-a880-48ef-93df-5822a1a8fdc7',
  'user-student-45ee02b9-a880-48ef-93df-5822a1a8fdc7',
  'REG2024110',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '53 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-863aae77-596c-4197-b968-74d243010c79',
  'user-student-863aae77-596c-4197-b968-74d243010c79',
  'REG2024111',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '110 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-adf84c56-663c-4ec2-9cf0-eef20f6c5051',
  'user-student-adf84c56-663c-4ec2-9cf0-eef20f6c5051',
  'REG2024112',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '49 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-338f6d86-9902-4fa6-97f8-1625c7b7f9f7',
  'user-student-338f6d86-9902-4fa6-97f8-1625c7b7f9f7',
  'REG2024113',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '129 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-57992188-f66a-4adb-96ac-4f225e62c7ab',
  'user-student-57992188-f66a-4adb-96ac-4f225e62c7ab',
  'REG2024115',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '47 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-8a7da972-36d4-4fb2-9fe9-317575ebe6d2',
  'user-student-8a7da972-36d4-4fb2-9fe9-317575ebe6d2',
  'REG2024117',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '198 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '60847cc8-814b-4d7c-8f2e-cf5ee3516854',
  'CM2',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-855418ee-30fa-4f67-a1ff-e89aa6c44555',
  'user-student-855418ee-30fa-4f67-a1ff-e89aa6c44555',
  'REG2024118',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '127 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-729d4689-b409-41c5-9558-6b920f211a07',
  'user-student-729d4689-b409-41c5-9558-6b920f211a07',
  'REG2024119',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '189 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-04f1b00a-4dc2-4c24-9863-eda0f59ddca7',
  'user-student-04f1b00a-4dc2-4c24-9863-eda0f59ddca7',
  'REG2024120',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '61 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-9d92bd81-eb6d-4269-b15d-810636572279',
  'user-student-9d92bd81-eb6d-4269-b15d-810636572279',
  'REG2024001',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '86 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-5ef4867d-4640-4c69-a699-d43c4a0d0a98',
  'user-student-5ef4867d-4640-4c69-a699-d43c4a0d0a98',
  'REG2024122',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '12 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-3e02e9b1-dac2-4911-b67d-35cc6ae21d4b',
  'user-student-3e02e9b1-dac2-4911-b67d-35cc6ae21d4b',
  'REG2024123',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '197 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-8947fe7f-db9e-4a5a-953e-70b3e1fa5d87',
  'user-student-8947fe7f-db9e-4a5a-953e-70b3e1fa5d87',
  'REG2024126',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '94 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-a1e6c97c-152f-4363-a02d-bd50684ac79a',
  'user-student-a1e6c97c-152f-4363-a02d-bd50684ac79a',
  'REG2024132',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '188 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-2ed2be6e-35d9-4fb7-a619-ffa43fd6d537',
  'user-student-2ed2be6e-35d9-4fb7-a619-ffa43fd6d537',
  'REG2024135',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '50 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-3b5c96fd-69b7-4f3a-8cde-84abaad8bb6e',
  'user-student-3b5c96fd-69b7-4f3a-8cde-84abaad8bb6e',
  'REG2024137',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '7 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-4290128d-f661-4d59-93c4-69c15ec55f5c',
  'user-student-4290128d-f661-4d59-93c4-69c15ec55f5c',
  'REG2024138',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '7 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-9613c5d3-9372-4720-a4ab-fc8f4766cbd8',
  'user-student-9613c5d3-9372-4720-a4ab-fc8f4766cbd8',
  'REG2024139',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '5 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  'Allergie aux arachides',
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-864b63cb-e9e7-417f-9b49-5fde1f5baa7f',
  'user-student-864b63cb-e9e7-417f-9b49-5fde1f5baa7f',
  'REG2024121',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '190 Rue de Paris, 75001 Paris',
  '2025-11-20',
  '826b91cb-f168-4e71-a539-e4fd6dfb6520',
  '6ème',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-7b6a8cf0-0070-42ed-bb67-4b57ffff8bc0',
  'user-student-7b6a8cf0-0070-42ed-bb67-4b57ffff8bc0',
  'REG2024002',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '88 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-2463c04d-1f73-4611-b984-554719176500',
  'user-student-2463c04d-1f73-4611-b984-554719176500',
  'REG2024003',
  NULL,
  'Masculin',
  'Française',
  'Paris, France',
  '184 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);

INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  'student-9dde0d81-0ec5-4eac-904a-4ea0e7536dbd',
  'user-student-9dde0d81-0ec5-4eac-904a-4ea0e7536dbd',
  'REG2024005',
  NULL,
  'Féminin',
  'Française',
  'Paris, France',
  '36 Rue de Paris, 75001 Paris',
  '2025-11-20',
  'e13a06c1-c9c1-4c48-9d5c-ea0b81bd3db1',
  'CP',
  NULL,
  NULL,
  'Actif'
);
