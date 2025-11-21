-- Seed Afrique: 60 élèves répartis dans classes primaires (CP1, CP2, CE1, CE2, CM1, CM2)
-- Système éducatif africain

PRAGMA foreign_keys = OFF;

-- 1. Mettre à jour les classes existantes pour le système africain
UPDATE classes SET name = 'CP1-A', level = 'CP1' WHERE id = 'class-001';
INSERT INTO classes (id, name, level, academic_year, main_teacher_id, room_number, capacity, is_active, created_at, updated_at) VALUES
('class-010', 'CP2-A', 'CP2', '2024-2025', 'tchr-001', 'A-106', 25, 1, datetime('now'), datetime('now'));

-- 2. Ajouter 60 nouveaux élèves (10 par classe primaire)
-- CP1-A (10 élèves)
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, status, created_at, updated_at) VALUES
('std-011', 'KDS24011', 'Abigail', 'KOUAME', '2017-03-15', 'female', '2024-09-01', 'class-001', 'parent-001', 'Cocody', 'Marie +225 07 11 22 44 01', 'active', datetime('now'), datetime('now')),
('std-012', 'KDS24012', 'Benjamin', 'OUATTARA', '2017-05-20', 'male', '2024-09-01', 'class-001', 'parent-002', 'Plateau', 'Jean +225 07 11 22 44 02', 'active', datetime('now'), datetime('now')),
('std-013', 'KDS24013', 'Deborah', 'KOFFI', '2017-07-10', 'female', '2024-09-01', 'class-001', 'parent-001', 'Yopougon', 'Aminata +225 07 11 22 44 03', 'active', datetime('now'), datetime('now')),
('std-014', 'KDS24014', 'Elijah', 'KONE', '2017-04-25', 'male', '2024-09-01', 'class-001', 'parent-002', 'Marcory', 'Fatou +225 07 11 22 44 04', 'active', datetime('now'), datetime('now')),
('std-015', 'KDS24015', 'Rachel', 'BAMBA', '2017-08-12', 'female', '2024-09-01', 'class-001', 'parent-001', 'Cocody', 'Ibrahim +225 07 11 22 44 05', 'active', datetime('now'), datetime('now')),
('std-016', 'KDS24016', 'Isaac', 'DIABATE', '2017-06-18', 'male', '2024-09-01', 'class-001', 'parent-002', 'Abobo', 'Aissata +225 07 11 22 44 06', 'active', datetime('now'), datetime('now')),
('std-017', 'KDS24017', 'Rebecca', 'TOURE', '2017-09-22', 'female', '2024-09-01', 'class-001', 'parent-001', 'Treichville', 'Moussa +225 07 11 22 44 07', 'active', datetime('now'), datetime('now')),
('std-018', 'KDS24018', 'Jacob', 'SANOGO', '2017-02-14', 'male', '2024-09-01', 'class-001', 'parent-002', 'Plateau', 'Kadiatou +225 07 11 22 44 08', 'active', datetime('now'), datetime('now')),
('std-019', 'KDS24019', 'Leah', 'COULIBALY', '2017-11-30', 'female', '2024-09-01', 'class-001', 'parent-001', 'Cocody', 'Sekou +225 07 11 22 44 09', 'active', datetime('now'), datetime('now')),
('std-020', 'KDS24020', 'Nathan', 'YAO', '2017-01-08', 'male', '2024-09-01', 'class-001', 'parent-002', 'Marcory', 'Awa +225 07 11 22 44 10', 'active', datetime('now'), datetime('now'));

-- CP2-A (10 élèves)
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, status, created_at, updated_at) VALUES
('std-021', 'KDS24021', 'Miriam', 'DIALLO', '2016-04-15', 'female', '2024-09-01', 'class-010', 'parent-001', 'Yopougon', 'Bakary +225 07 11 22 44 11', 'active', datetime('now'), datetime('now')),
('std-022', 'KDS24022', 'Joseph', 'TRAORE', '2016-06-20', 'male', '2024-09-01', 'class-010', 'parent-002', 'Abobo', 'Mariam +225 07 11 22 44 12', 'active', datetime('now'), datetime('now')),
('std-023', 'KDS24023', 'Ruth', 'KONATE', '2016-08-10', 'female', '2024-09-01', 'class-010', 'parent-001', 'Cocody', 'Amadou +225 07 11 22 44 13', 'active', datetime('now'), datetime('now')),
('std-024', 'KDS24024', 'Samuel', 'OUEDRAOGO', '2016-03-25', 'male', '2024-09-01', 'class-010', 'parent-002', 'Plateau', 'Fanta +225 07 11 22 44 14', 'active', datetime('now'), datetime('now')),
('std-025', 'KDS24025', 'Esther', 'KONE', '2016-09-12', 'female', '2024-09-01', 'class-010', 'parent-001', 'Treichville', 'Ousmane +225 07 11 22 44 15', 'active', datetime('now'), datetime('now')),
('std-026', 'KDS24026', 'Daniel', 'BAMBA', '2016-05-18', 'male', '2024-09-01', 'class-010', 'parent-002', 'Marcory', 'Salimata +225 07 11 22 44 16', 'active', datetime('now'), datetime('now')),
('std-027', 'KDS24027', 'Sarah', 'DIABY', '2016-10-22', 'female', '2024-09-01', 'class-010', 'parent-001', 'Cocody', 'Lassina +225 07 11 22 44 17', 'active', datetime('now'), datetime('now')),
('std-028', 'KDS24028', 'Joshua', 'SANGARE', '2016-02-14', 'male', '2024-09-01', 'class-010', 'parent-002', 'Yopougon', 'Nafissatou +225 07 11 22 44 18', 'active', datetime('now'), datetime('now')),
('std-029', 'KDS24029', 'Hannah', 'KOUASSI', '2016-11-30', 'female', '2024-09-01', 'class-010', 'parent-001', 'Plateau', 'Adama +225 07 11 22 44 19', 'active', datetime('now'), datetime('now')),
('std-030', 'KDS24030', 'Noah', 'TAPSOBA', '2016-01-08', 'male', '2024-09-01', 'class-010', 'parent-002', 'Abobo', 'Hawa +225 07 11 22 44 20', 'active', datetime('now'), datetime('now'));

-- CE1-A (10 élèves)
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, status, created_at, updated_at) VALUES
('std-031', 'KDS24031', 'Tamar', 'KONE', '2015-03-15', 'female', '2024-09-01', 'class-002', 'parent-001', 'Cocody', 'Drissa +225 07 11 22 44 21', 'active', datetime('now'), datetime('now')),
('std-032', 'KDS24032', 'Gideon', 'DIARRA', '2015-05-20', 'male', '2024-09-01', 'class-002', 'parent-002', 'Marcory', 'Rokia +225 07 11 22 44 22', 'active', datetime('now'), datetime('now')),
('std-033', 'KDS24033', 'Naomi', 'OUATTARA', '2015-07-10', 'female', '2024-09-01', 'class-002', 'parent-001', 'Yopougon', 'Souleymane +225 07 11 22 44 23', 'active', datetime('now'), datetime('now')),
('std-034', 'KDS24034', 'Caleb', 'KOFFI', '2015-04-25', 'male', '2024-09-01', 'class-002', 'parent-002', 'Plateau', 'Maimouna +225 07 11 22 44 24', 'active', datetime('now'), datetime('now')),
('std-035', 'KDS24035', 'Dinah', 'COULIBALY', '2015-08-12', 'female', '2024-09-01', 'class-002', 'parent-001', 'Treichville', 'Yacouba +225 07 11 22 44 25', 'active', datetime('now'), datetime('now')),
('std-036', 'KDS24036', 'Eliezer', 'TOURE', '2015-06-18', 'male', '2024-09-01', 'class-002', 'parent-002', 'Cocody', 'Assitan +225 07 11 22 44 26', 'active', datetime('now'), datetime('now')),
('std-037', 'KDS24037', 'Abigail', 'BAMBA', '2015-09-22', 'female', '2024-09-01', 'class-002', 'parent-001', 'Abobo', 'Modibo +225 07 11 22 44 27', 'active', datetime('now'), datetime('now')),
('std-038', 'KDS24038', 'Ezra', 'SANOGO', '2015-02-14', 'male', '2024-09-01', 'class-002', 'parent-002', 'Marcory', 'Fatoumata +225 07 11 22 44 28', 'active', datetime('now'), datetime('now')),
('std-039', 'KDS24039', 'Judith', 'DIABY', '2015-11-30', 'female', '2024-09-01', 'class-002', 'parent-001', 'Yopougon', 'Siaka +225 07 11 22 44 29', 'active', datetime('now'), datetime('now')),
('std-040', 'KDS24040', 'Levi', 'TRAORE', '2015-01-08', 'male', '2024-09-01', 'class-002', 'parent-002', 'Plateau', 'Ramata +225 07 11 22 44 30', 'active', datetime('now'), datetime('now'));

-- CE2-A (10 élèves)
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, status, created_at, updated_at) VALUES
('std-041', 'KDS24041', 'Michal', 'KONE', '2014-03-15', 'female', '2024-09-01', 'class-003', 'parent-001', 'Cocody', 'Issouf +225 07 11 22 44 31', 'active', datetime('now'), datetime('now')),
('std-042', 'KDS24042', 'Asher', 'OUEDRAOGO', '2014-05-20', 'male', '2024-09-01', 'class-003', 'parent-002', 'Treichville', 'Mariam +225 07 11 22 44 32', 'active', datetime('now'), datetime('now')),
('std-043', 'KDS24043', 'Keturah', 'DIALLO', '2014-07-10', 'female', '2024-09-01', 'class-003', 'parent-001', 'Marcory', 'Lancine +225 07 11 22 44 33', 'active', datetime('now'), datetime('now')),
('std-044', 'KDS24044', 'Amos', 'KOUAME', '2014-04-25', 'male', '2024-09-01', 'class-003', 'parent-002', 'Yopougon', 'Djénéba +225 07 11 22 44 34', 'active', datetime('now'), datetime('now')),
('std-045', 'KDS24045', 'Shifra', 'BAMBA', '2014-08-12', 'female', '2024-09-01', 'class-003', 'parent-001', 'Plateau', 'Moussa +225 07 11 22 44 35', 'active', datetime('now'), datetime('now')),
('std-046', 'KDS24046', 'Reuben', 'SANGARE', '2014-06-18', 'male', '2024-09-01', 'class-003', 'parent-002', 'Cocody', 'Korotoum +225 07 11 22 44 36', 'active', datetime('now'), datetime('now')),
('std-047', 'KDS24047', 'Zipporah', 'TOURE', '2014-09-22', 'female', '2024-09-01', 'class-003', 'parent-001', 'Abobo', 'Sékou +225 07 11 22 44 37', 'active', datetime('now'), datetime('now')),
('std-048', 'KDS24048', 'Simeon', 'DIARRA', '2014-02-14', 'male', '2024-09-01', 'class-003', 'parent-002', 'Treichville', 'Ténin +225 07 11 22 44 38', 'active', datetime('now'), datetime('now')),
('std-049', 'KDS24049', 'Jael', 'KOFFI', '2014-11-30', 'female', '2024-09-01', 'class-003', 'parent-001', 'Marcory', 'Abdoul +225 07 11 22 44 39', 'active', datetime('now'), datetime('now')),
('std-050', 'KDS24050', 'Gad', 'COULIBALY', '2014-01-08', 'male', '2024-09-01', 'class-003', 'parent-002', 'Yopougon', 'Bintou +225 07 11 22 44 40', 'active', datetime('now'), datetime('now'));

-- CM1-A (10 élèves)
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, status, created_at, updated_at) VALUES
('std-051', 'KDS24051', 'Tirzah', 'KONATE', '2013-03-15', 'female', '2024-09-01', 'class-004', 'parent-001', 'Cocody', 'Bassidiki +225 07 11 22 44 41', 'active', datetime('now'), datetime('now')),
('std-052', 'KDS24052', 'Naphtali', 'TRAORE', '2013-05-20', 'male', '2024-09-01', 'class-004', 'parent-002', 'Plateau', 'Safiatou +225 07 11 22 44 42', 'active', datetime('now'), datetime('now')),
('std-053', 'KDS24053', 'Hadassah', 'OUATTARA', '2013-07-10', 'female', '2024-09-01', 'class-004', 'parent-001', 'Abobo', 'Mamadou +225 07 11 22 44 43', 'active', datetime('now'), datetime('now')),
('std-054', 'KDS24054', 'Malachi', 'KONE', '2013-04-25', 'male', '2024-09-01', 'class-004', 'parent-002', 'Marcory', 'Kandia +225 07 11 22 44 44', 'active', datetime('now'), datetime('now')),
('std-055', 'KDS24055', 'Shoshana', 'BAMBA', '2013-08-12', 'female', '2024-09-01', 'class-004', 'parent-001', 'Treichville', 'Daouda +225 07 11 22 44 45', 'active', datetime('now'), datetime('now')),
('std-056', 'KDS24056', 'Jonah', 'DIABY', '2013-06-18', 'male', '2024-09-01', 'class-004', 'parent-002', 'Yopougon', 'Oumou +225 07 11 22 44 46', 'active', datetime('now'), datetime('now')),
('std-057', 'KDS24057', 'Phoebe', 'SANGARE', '2013-09-22', 'female', '2024-09-01', 'class-004', 'parent-001', 'Cocody', 'Lamine +225 07 11 22 44 47', 'active', datetime('now'), datetime('now')),
('std-058', 'KDS24058', 'Hosea', 'DIALLO', '2013-02-14', 'male', '2024-09-01', 'class-004', 'parent-002', 'Plateau', 'Awa +225 07 11 22 44 48', 'active', datetime('now'), datetime('now')),
('std-059', 'KDS24059', 'Priscilla', 'KOUAME', '2013-11-30', 'female', '2024-09-01', 'class-004', 'parent-001', 'Abobo', 'Fousseni +225 07 11 22 44 49', 'active', datetime('now'), datetime('now')),
('std-060', 'KDS24060', 'Zebulun', 'TOURE', '2013-01-08', 'male', '2024-09-01', 'class-004', 'parent-002', 'Marcory', 'Coumba +225 07 11 22 44 50', 'active', datetime('now'), datetime('now'));

-- CM2-A (10 élèves supplémentaires aux 5 déjà existants)
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, status, created_at, updated_at) VALUES
('std-061', 'KDS24061', 'Lydia', 'OUEDRAOGO', '2012-03-15', 'female', '2024-09-01', 'class-005', 'parent-001', 'Cocody', 'Boureima +225 07 11 22 44 51', 'active', datetime('now'), datetime('now')),
('std-062', 'KDS24062', 'Zechariah', 'KOFFI', '2012-05-20', 'male', '2024-09-01', 'class-005', 'parent-002', 'Treichville', 'Assétou +225 07 11 22 44 52', 'active', datetime('now'), datetime('now')),
('std-063', 'KDS24063', 'Dorcas', 'KONE', '2012-07-10', 'female', '2024-09-01', 'class-005', 'parent-001', 'Yopougon', 'Bakari +225 07 11 22 44 53', 'active', datetime('now'), datetime('now')),
('std-064', 'KDS24064', 'Ezekiel', 'COULIBALY', '2012-04-25', 'male', '2024-09-01', 'class-005', 'parent-002', 'Plateau', 'Salimata +225 07 11 22 44 54', 'active', datetime('now'), datetime('now')),
('std-065', 'KDS24065', 'Tabitha', 'BAMBA', '2012-08-12', 'female', '2024-09-01', 'class-005', 'parent-001', 'Marcory', 'Sékou +225 07 11 22 44 55', 'active', datetime('now'), datetime('now')),
('std-066', 'KDS24066', 'Elisha', 'SANOGO', '2012-06-18', 'male', '2024-09-01', 'class-005', 'parent-002', 'Abobo', 'Fatoumata +225 07 11 22 44 56', 'active', datetime('now'), datetime('now')),
('std-067', 'KDS24067', 'Orpah', 'TRAORE', '2012-09-22', 'female', '2024-09-01', 'class-005', 'parent-001', 'Cocody', 'Abdoulaye +225 07 11 22 44 57', 'active', datetime('now'), datetime('now')),
('std-068', 'KDS24068', 'Nehemiah', 'DIARRA', '2012-02-14', 'male', '2024-09-01', 'class-005', 'parent-002', 'Plateau', 'Nana +225 07 11 22 44 58', 'active', datetime('now'), datetime('now')),
('std-069', 'KDS24069', 'Zillah', 'KOUASSI', '2012-11-30', 'female', '2024-09-01', 'class-005', 'parent-001', 'Treichville', 'Mahamadou +225 07 11 22 44 59', 'active', datetime('now'), datetime('now')),
('std-070', 'KDS24070', 'Boaz', 'TAPSOBA', '2012-01-08', 'male', '2024-09-01', 'class-005', 'parent-002', 'Yopougon', 'Assitan +225 07 11 22 44 60', 'active', datetime('now'), datetime('now'));

PRAGMA foreign_keys = ON;
