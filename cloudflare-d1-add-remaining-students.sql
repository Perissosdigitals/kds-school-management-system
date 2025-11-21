-- Ajouter 30 élèves supplémentaires pour atteindre 60 au total
-- Distribution: CE1-A (10), CE2-A (10), CM1-A (10), CM2-A (10 supplémentaires)
-- Noms bibliques/hébraïques + noms de famille ivoiriens

-- CE1-A: 10 élèves (std-031 à std-040)
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, class_id, parent_id, emergency_contact, enrollment_date, status)
VALUES
('std-031', 'KDS24031', 'Samuel', 'TRAORE', '2016-03-15', 'male', 'class-002', NULL, '+225 07 11 22 33', '2024-09-01', 'active'),
('std-032', 'KDS24032', 'Sarah', 'KONE', '2016-04-20', 'female', 'class-002', NULL, '+225 07 22 33 44', '2024-09-01', 'active'),
('std-033', 'KDS24033', 'Joseph', 'BAMBA', '2016-05-10', 'male', 'class-002', NULL, '+225 07 33 44 55', '2024-09-01', 'active'),
('std-034', 'KDS24034', 'Miriam', 'DIABATE', '2016-06-08', 'female', 'class-002', NULL, '+225 07 44 55 66', '2024-09-01', 'active'),
('std-035', 'KDS24035', 'Daniel', 'TOURE', '2016-07-12', 'male', 'class-002', NULL, '+225 07 55 66 77', '2024-09-01', 'active'),
('std-036', 'KDS24036', 'Esther', 'SANOGO', '2016-08-18', 'female', 'class-002', NULL, '+225 07 66 77 88', '2024-09-01', 'active'),
('std-037', 'KDS24037', 'Aaron', 'COULIBALY', '2016-09-22', 'male', 'class-002', NULL, '+225 07 77 88 99', '2024-09-01', 'active'),
('std-038', 'KDS24038', 'Ruth', 'YAO', '2016-10-05', 'female', 'class-002', NULL, '+225 07 88 99 00', '2024-09-01', 'active'),
('std-039', 'KDS24039', 'Caleb', 'KOUAME', '2016-11-14', 'male', 'class-002', NULL, '+225 07 99 00 11', '2024-09-01', 'active'),
('std-040', 'KDS24040', 'Hannah', 'OUATTARA', '2016-12-20', 'female', 'class-002', NULL, '+225 07 00 11 22', '2024-09-01', 'active');

-- CE2-A: 10 élèves (std-041 à std-050)
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, class_id, parent_id, emergency_contact, enrollment_date, status)
VALUES
('std-041', 'KDS24041', 'Joshua', 'KOFFI', '2015-01-10', 'male', 'class-003', NULL, '+225 07 11 33 55', '2024-09-01', 'active'),
('std-042', 'KDS24042', 'Naomi', 'KONE', '2015-02-15', 'female', 'class-003', NULL, '+225 07 22 44 66', '2024-09-01', 'active'),
('std-043', 'KDS24043', 'Gideon', 'BAMBA', '2015-03-20', 'male', 'class-003', NULL, '+225 07 33 55 77', '2024-09-01', 'active'),
('std-044', 'KDS24044', 'Lydia', 'DIABATE', '2015-04-25', 'female', 'class-003', NULL, '+225 07 44 66 88', '2024-09-01', 'active'),
('std-045', 'KDS24045', 'Ezekiel', 'TRAORE', '2015-05-30', 'male', 'class-003', NULL, '+225 07 55 77 99', '2024-09-01', 'active'),
('std-046', 'KDS24046', 'Priscilla', 'SANOGO', '2015-06-12', 'female', 'class-003', NULL, '+225 07 66 88 00', '2024-09-01', 'active'),
('std-047', 'KDS24047', 'Josiah', 'COULIBALY', '2015-07-18', 'male', 'class-003', NULL, '+225 07 77 99 11', '2024-09-01', 'active'),
('std-048', 'KDS24048', 'Tabitha', 'YAO', '2015-08-22', 'female', 'class-003', NULL, '+225 07 88 00 22', '2024-09-01', 'active'),
('std-049', 'KDS24049', 'Micah', 'KOUAME', '2015-09-28', 'male', 'class-003', NULL, '+225 07 99 11 33', '2024-09-01', 'active'),
('std-050', 'KDS24050', 'Dinah', 'OUATTARA', '2015-10-15', 'female', 'class-003', NULL, '+225 07 00 22 44', '2024-09-01', 'active');

-- CM1-A: 10 élèves (std-051 à std-060)
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, class_id, parent_id, emergency_contact, enrollment_date, status)
VALUES
('std-051', 'KDS24051', 'Solomon', 'KOFFI', '2014-01-08', 'male', 'class-004', NULL, '+225 07 11 44 77', '2024-09-01', 'active'),
('std-052', 'KDS24052', 'Martha', 'KONE', '2014-02-12', 'female', 'class-004', NULL, '+225 07 22 55 88', '2024-09-01', 'active'),
('std-053', 'KDS24053', 'Jeremiah', 'BAMBA', '2014-03-18', 'male', 'class-004', NULL, '+225 07 33 66 99', '2024-09-01', 'active'),
('std-054', 'KDS24054', 'Salome', 'DIABATE', '2014-04-22', 'female', 'class-004', NULL, '+225 07 44 77 00', '2024-09-01', 'active'),
('std-055', 'KDS24055', 'Isaiah', 'TRAORE', '2014-05-28', 'male', 'class-004', NULL, '+225 07 55 88 11', '2024-09-01', 'active'),
('std-056', 'KDS24056', 'Phoebe', 'SANOGO', '2014-06-15', 'female', 'class-004', NULL, '+225 07 66 99 22', '2024-09-01', 'active'),
('std-057', 'KDS24057', 'Jonah', 'COULIBALY', '2014-07-20', 'male', 'class-004', NULL, '+225 07 77 00 33', '2024-09-01', 'active'),
('std-058', 'KDS24058', 'Dorcas', 'YAO', '2014-08-25', 'female', 'class-004', NULL, '+225 07 88 11 44', '2024-09-01', 'active'),
('std-059', 'KDS24059', 'Amos', 'KOUAME', '2014-09-30', 'male', 'class-004', NULL, '+225 07 99 22 55', '2024-09-01', 'active'),
('std-060', 'KDS24060', 'Zipporah', 'OUATTARA', '2014-10-10', 'female', 'class-004', NULL, '+225 07 00 33 66', '2024-09-01', 'active');

-- CM2-A: 10 élèves supplémentaires (std-061 à std-070) pour compléter la classe
INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, class_id, parent_id, emergency_contact, enrollment_date, status)
VALUES
('std-061', 'KDS24061', 'Moses', 'KOFFI', '2013-01-05', 'male', 'class-005', NULL, '+225 07 11 55 88', '2024-09-01', 'active'),
('std-062', 'KDS24062', 'Elizabeth', 'KONE', '2013-02-10', 'female', 'class-005', NULL, '+225 07 22 66 99', '2024-09-01', 'active'),
('std-063', 'KDS24063', 'Nehemiah', 'BAMBA', '2013-03-15', 'male', 'class-005', NULL, '+225 07 33 77 00', '2024-09-01', 'active'),
('std-064', 'KDS24064', 'Mary', 'DIABATE', '2013-04-20', 'female', 'class-005', NULL, '+225 07 44 88 11', '2024-09-01', 'active'),
('std-065', 'KDS24065', 'Ezra', 'TRAORE', '2013-05-25', 'male', 'class-005', NULL, '+225 07 55 99 22', '2024-09-01', 'active'),
('std-066', 'KDS24066', 'Anna', 'SANOGO', '2013-06-30', 'female', 'class-005', NULL, '+225 07 66 00 33', '2024-09-01', 'active'),
('std-067', 'KDS24067', 'Simeon', 'COULIBALY', '2013-07-12', 'male', 'class-005', NULL, '+225 07 77 11 44', '2024-09-01', 'active'),
('std-068', 'KDS24068', 'Joanna', 'YAO', '2013-08-18', 'female', 'class-005', NULL, '+225 07 88 22 55', '2024-09-01', 'active'),
('std-069', 'KDS24069', 'Zacharias', 'KOUAME', '2013-09-22', 'male', 'class-005', NULL, '+225 07 99 33 66', '2024-09-01', 'active'),
('std-070', 'KDS24070', 'Susanna', 'OUATTARA', '2013-10-28', 'female', 'class-005', NULL, '+225 07 00 44 77', '2024-09-01', 'active');

-- Vérification du nombre total d'élèves après insertion
SELECT 'Total élèves dans la base:' as info, COUNT(*) as total FROM students;
SELECT 'Répartition par classe:' as info;
SELECT c.name, c.level, COUNT(s.id) as nb_eleves 
FROM classes c 
LEFT JOIN students s ON c.id = s.class_id 
GROUP BY c.id, c.name, c.level 
ORDER BY c.level, c.name;
