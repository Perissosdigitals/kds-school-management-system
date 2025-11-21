-- Seed Final: 60 élèves pour classes primaires africaines
-- CP1, CP2, CE1, CE2, CM1, CM2 (10 élèves par classe)

-- CP1-A: 10 élèves 
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, status) VALUES
('std-011', 'KDS24011', 'Abigail', 'KOUAME', '2017-03-15', 'female', '2024-09-01', 'class-001', 'parent-001', 'Cocody', 'Marie +225 07 11 22 44 01', 'active'),
('std-012', 'KDS24012', 'Benjamin', 'OUATTARA', '2017-05-20', 'male', '2024-09-01', 'class-001', 'parent-002', 'Plateau', 'Jean +225 07 11 22 44 02', 'active'),
('std-013', 'KDS24013', 'Deborah', 'KOFFI', '2017-07-10', 'female', '2024-09-01', 'class-001', 'parent-001', 'Yopougon', 'Aminata +225 07 11 22 44 03', 'active'),
('std-014', 'KDS24014', 'Elijah', 'KONE', '2017-04-25', 'male', '2024-09-01', 'class-001', 'parent-002', 'Marcory', 'Fatou +225 07 11 22 44 04', 'active'),
('std-015', 'KDS24015', 'Rachel', 'BAMBA', '2017-08-12', 'female', '2024-09-01', 'class-001', 'parent-001', 'Cocody', 'Ibrahim +225 07 11 22 44 05', 'active'),
('std-016', 'KDS24016', 'Isaac', 'DIABATE', '2017-06-18', 'male', '2024-09-01', 'class-001', 'parent-002', 'Abobo', 'Aissata +225 07 11 22 44 06', 'active'),
('std-017', 'KDS24017', 'Rebecca', 'TOURE', '2017-09-22', 'female', '2024-09-01', 'class-001', 'parent-001', 'Treichville', 'Moussa +225 07 11 22 44 07', 'active'),
('std-018', 'KDS24018', 'Jacob', 'SANOGO', '2017-02-14', 'male', '2024-09-01', 'class-001', 'parent-002', 'Plateau', 'Kadiatou +225 07 11 22 44 08', 'active'),
('std-019', 'KDS24019', 'Leah', 'COULIBALY', '2017-11-30', 'female', '2024-09-01', 'class-001', 'parent-001', 'Cocody', 'Sekou +225 07 11 22 44 09', 'active'),
('std-020', 'KDS24020', 'Nathan', 'YAO', '2017-01-08', 'male', '2024-09-01', 'class-001', 'parent-002', 'Marcory', 'Awa +225 07 11 22 44 10', 'active');
