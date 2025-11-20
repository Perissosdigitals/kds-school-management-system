#!/bin/bash

# Import manuel de quelques données d'exemple pour tester
# Bar

ukh HaShem! 🙏

echo ""
echo "📊 Import Manuel de Données d'Exemple dans D1"
echo "=============================================="
echo ""

cd /Users/apple/Desktop/kds-school-management-system/backend

# 1. Users (admin)
echo "1️⃣  Import ADMIN..."
npx wrangler d1 execute kds-school-db --remote --command="
INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_active, created_at) 
VALUES ('admin-001', 'admin@kds-school.com', 'Admin', 'KDS', 'admin', '\$2b\$10\$test', 1, datetime('now'))
"

# 2. Teachers (3 enseignants)
echo "2️⃣  Import TEACHERS..."
npx wrangler d1 execute kds-school-db --remote --command="
INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES 
('teacher-001', 'Sarah', 'Cohen', 'sarah.cohen@kds.com', '0612345678', 'Mathématiques', '2024-09-01', 'active', datetime('now')),
('teacher-002', 'David', 'Levy', 'david.levy@kds.com', '0612345679', 'Français', '2024-09-01', 'active', datetime('now')),
('teacher-003', 'Rachel', 'Abitbol', 'rachel.abitbol@kds.com', '0612345680', 'Sciences', '2024-09-01', 'active', datetime('now'))
"

# 3. Classes (3 classes)
echo "3️⃣  Import CLASSES..."
npx wrangler d1 execute kds-school-db --remote --command="
INSERT INTO classes (id, name, level, teacher_id, capacity, room, is_active, created_at) 
VALUES 
('class-001', 'CP1 A', 'CP1', 'teacher-001', 30, 'Salle 101', 1, datetime('now')),
('class-002', 'CE1 A', 'CE1', 'teacher-002', 30, 'Salle 201', 1, datetime('now')),
('class-003', 'CM2 A', 'CM2', 'teacher-003', 30, 'Salle 301', 1, datetime('now'))
"

# 4. Students (10 élèves répartis)
echo "4️⃣  Import STUDENTS..."
npx wrangler d1 execute kds-school-db --remote --command="
INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES 
('student-001', 'KDS2025001', 'Sanogo', 'Adamo', '2019-02-19', 'male', 'CP1', 'class-001', 'M. Sanogo', '0601234567', 'Cocody, Abidjan', 'active', datetime('now')),
('student-002', 'KDS2025002', 'Aminata', 'Koné', '2019-05-15', 'female', 'CP1', 'class-001', 'Mme Koné', '0601234568', 'Plateau, Abidjan', 'active', datetime('now')),
('student-003', 'KDS2025003', 'Ibrahim', 'Traoré', '2019-08-20', 'male', 'CP1', 'class-001', 'M. Traoré', '0601234569', 'Yopougon, Abidjan', 'active', datetime('now')),
('student-004', 'KDS2025004', 'Fatou', 'Diallo', '2017-03-10', 'female', 'CE1', 'class-002', 'Mme Diallo', '0601234570', 'Adjamé, Abidjan', 'active', datetime('now')),
('student-005', 'KDS2025005', 'Moussa', 'Camara', '2017-06-25', 'male', 'CE1', 'class-002', 'M. Camara', '0601234571', 'Marcory, Abidjan', 'active', datetime('now')),
('student-006', 'KDS2025006', 'Aïcha', 'Bamba', '2017-11-12', 'female', 'CE1', 'class-002', 'Mme Bamba', '0601234572', 'Treichville, Abidjan', 'active', datetime('now')),
('student-007', 'KDS2025007', 'Jean', 'Kouassi', '2013-04-18', 'male', 'CM2', 'class-003', 'M. Kouassi', '0601234573', 'Cocody, Abidjan', 'active', datetime('now')),
('student-008', 'KDS2025008', 'Marie', 'N''Guessan', '2013-07-22', 'female', 'CM2', 'class-003', 'Mme N''Guessan', '0601234574', 'Plateau, Abidjan', 'active', datetime('now')),
('student-009', 'KDS2025009', 'Kofi', 'Yao', '2013-09-05', 'male', 'CM2', 'class-003', 'M. Yao', '0601234575', 'Adjamé, Abidjan', 'active', datetime('now')),
('student-010', 'KDS2025010', 'Aya', 'Touré', '2013-12-30', 'female', 'CM2', 'class-003', 'Mme Touré', '0601234576', 'Yopougon, Abidjan', 'active', datetime('now'))
"

# 5. Transactions (quelques exemples)
echo "5️⃣  Import TRANSACTIONS..."
npx wrangler d1 execute kds-school-db --remote --command="
INSERT INTO transactions (id, type, category, amount, student_id, description, status, transaction_date, created_at) 
VALUES 
('tx-001', 'income', 'Frais d''inscription', 50000, 'student-001', 'Inscription Sanogo Adamo', 'paid', '2025-09-01', datetime('now')),
('tx-002', 'income', 'Frais de scolarité', 150000, 'student-001', 'Scolarité trimestre 1', 'pending', '2025-09-01', datetime('now')),
('tx-003', 'income', 'Frais d''inscription', 50000, 'student-002', 'Inscription Aminata Koné', 'paid', '2025-09-02', datetime('now')),
('tx-004', 'income', 'Frais de scolarité', 150000, 'student-002', 'Scolarité trimestre 1', 'paid', '2025-09-02', datetime('now')),
('tx-005', 'expense', 'Salaire enseignant', 200000, NULL, 'Salaire Sarah Cohen', 'paid', '2025-10-01', datetime('now'))
"

echo ""
echo "✅ Vérification des données:"
echo ""

echo "📊 Users:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM users"

echo "📊 Teachers:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM teachers"

echo "📊 Classes:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM classes"

echo "📊 Students:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM students"

echo "📊 Transactions:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM transactions"

echo ""
echo "✅ Données d'exemple importées!"
echo ""
echo "🌐 Testez maintenant:"
echo "   curl https://kds-backend-api.perissosdigitals.workers.dev/api/v1/students"
echo "   curl https://kds-backend-api.perissosdigitals.workers.dev/api/v1/teachers"
echo "   curl https://kds-backend-api.perissosdigitals.workers.dev/api/v1/classes"
echo ""
echo "Bérakhot ve-Shalom! 🙏"
echo ""
