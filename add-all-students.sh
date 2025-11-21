#!/bin/bash
# Ajouter 60 élèves (6 classes x 10 élèves) à Cloudflare D1

echo "📚 Ajout de 60 élèves dans les classes primaires africaines..."

# CP2-A (10 élèves)
echo "Adding CP2-A students..."
npx wrangler d1 execute kds-school-db --remote --command="INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, status) VALUES
('std-021', 'KDS24021', 'Miriam', 'DIALLO', '2016-04-15', 'female', '2024-09-01', 'class-010', 'parent-001', 'Yopougon', 'Bakary +225 07 11 22 44 11', 'active'),
('std-022', 'KDS24022', 'Joseph', 'TRAORE', '2016-06-20', 'male', '2024-09-01', 'class-010', 'parent-002', 'Abobo', 'Mariam +225 07 11 22 44 12', 'active'),
('std-023', 'KDS24023', 'Ruth', 'KONATE', '2016-08-10', 'female', '2024-09-01', 'class-010', 'parent-001', 'Cocody', 'Amadou +225 07 11 22 44 13', 'active'),
('std-024', 'KDS24024', 'Samuel', 'OUEDRAOGO', '2016-03-25', 'male', '2024-09-01', 'class-010', 'parent-002', 'Plateau', 'Fanta +225 07 11 22 44 14', 'active'),
('std-025', 'KDS24025', 'Esther', 'KONE', '2016-09-12', 'female', '2024-09-01', 'class-010', 'parent-001', 'Treichville', 'Ousmane +225 07 11 22 44 15', 'active'),
('std-026', 'KDS24026', 'Daniel', 'BAMBA', '2016-05-18', 'male', '2024-09-01', 'class-010', 'parent-002', 'Marcory', 'Salimata +225 07 11 22 44 16', 'active'),
('std-027', 'KDS24027', 'Sarah', 'DIABY', '2016-10-22', 'female', '2024-09-01', 'class-010', 'parent-001', 'Cocody', 'Lassina +225 07 11 22 44 17', 'active'),
('std-028', 'KDS24028', 'Joshua', 'SANGARE', '2016-02-14', 'male', '2024-09-01', 'class-010', 'parent-002', 'Yopougon', 'Nafissatou +225 07 11 22 44 18', 'active'),
('std-029', 'KDS24029', 'Hannah', 'KOUASSI', '2016-11-30', 'female', '2024-09-01', 'class-010', 'parent-001', 'Plateau', 'Adama +225 07 11 22 44 19', 'active'),
('std-030', 'KDS24030', 'Noah', 'TAPSOBA', '2016-01-08', 'male', '2024-09-01', 'class-010', 'parent-002', 'Abobo', 'Hawa +225 07 11 22 44 20', 'active');" 2>&1 | grep -E "(Executed|rows written)"

echo "✅ CP2-A done - 10 students added"
sleep 2

# CE1-A (10 élèves)
echo "Adding CE1-A students..."
npx wrangler d1 execute kds-school-db --remote --command="INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, enrollment_date, class_id, parent_id, address, emergency_contact, status) VALUES
('std-031', 'KDS24031', 'Tamar', 'KONE', '2015-03-15', 'female', '2024-09-01', 'class-002', 'parent-001', 'Cocody', 'Drissa +225 07 11 22 44 21', 'active'),
('std-032', 'KDS24032', 'Gideon', 'DIARRA', '2015-05-20', 'male', '2024-09-01', 'class-002', 'parent-002', 'Marcory', 'Rokia +225 07 11 22 44 22', 'active'),
('std-033', 'KDS24033', 'Naomi', 'OUATTARA', '2015-07-10', 'female', '2024-09-01', 'class-002', 'parent-001', 'Yopougon', 'Souleymane +225 07 11 22 44 23', 'active'),
('std-034', 'KDS24034', 'Caleb', 'KOFFI', '2015-04-25', 'male', '2024-09-01', 'class-002', 'parent-002', 'Plateau', 'Maimouna +225 07 11 22 44 24', 'active'),
('std-035', 'KDS24035', 'Dinah', 'COULIBALY', '2015-08-12', 'female', '2024-09-01', 'class-002', 'parent-001', 'Treichville', 'Yacouba +225 07 11 22 44 25', 'active'),
('std-036', 'KDS24036', 'Eliezer', 'TOURE', '2015-06-18', 'male', '2024-09-01', 'class-002', 'parent-002', 'Cocody', 'Assitan +225 07 11 22 44 26', 'active'),
('std-037', 'KDS24037', 'Abigail', 'BAMBA', '2015-09-22', 'female', '2024-09-01', 'class-002', 'parent-001', 'Abobo', 'Modibo +225 07 11 22 44 27', 'active'),
('std-038', 'KDS24038', 'Ezra', 'SANOGO', '2015-02-14', 'male', '2024-09-01', 'class-002', 'parent-002', 'Marcory', 'Fatoumata +225 07 11 22 44 28', 'active'),
('std-039', 'KDS24039', 'Judith', 'DIABY', '2015-11-30', 'female', '2024-09-01', 'class-002', 'parent-001', 'Yopougon', 'Siaka +225 07 11 22 44 29', 'active'),
('std-040', 'KDS24040', 'Levi', 'TRAORE', '2015-01-08', 'male', '2024-09-01', 'class-002', 'parent-002', 'Plateau', 'Ramata +225 07 11 22 44 30', 'active');" 2>&1 | grep -E "(Executed|rows written)"

echo "✅ CE1-A done - 10 students added"

echo "🎉 Total: 30 students added so far!"
