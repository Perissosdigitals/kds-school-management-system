#!/bin/bash

# ============================================
# Reset D1 Database avec Schéma Normalisé
# ============================================

echo "🔄 Réinitialisation de la base de données D1..."
echo ""

cd "$(dirname "$0")/.." || exit

# ============================================
# 1. Supprimer toutes les tables existantes
# ============================================
echo "📦 Suppression des tables existantes..."

npx wrangler d1 execute kds-school-db --remote --command="
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS timetable;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS school_events;
"

if [ $? -eq 0 ]; then
    echo "✅ Tables supprimées avec succès"
else
    echo "❌ Erreur lors de la suppression des tables"
    exit 1
fi

echo ""
echo "📋 Création des nouvelles tables avec schéma normalisé..."
echo ""

# ============================================
# 2. Créer les tables dans l'ordre des dépendances
# ============================================

# USERS (table centrale)
echo "👥 Création de la table users..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent', 'staff')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
"

# TEACHERS
echo "👨‍🏫 Création de la table teachers..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE teachers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    specialization TEXT,
    hire_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'on_leave')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_teachers_user ON teachers(user_id);
CREATE INDEX idx_teachers_status ON teachers(status);
"

# CLASSES
echo "🏫 Création de la table classes..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE classes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    main_teacher_id TEXT,
    room_number TEXT,
    capacity INTEGER DEFAULT 30,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (main_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);
CREATE INDEX idx_classes_level ON classes(level);
CREATE INDEX idx_classes_teacher ON classes(main_teacher_id);
CREATE INDEX idx_classes_active ON classes(is_active);
"

# STUDENTS
echo "👨‍🎓 Création de la table students..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE students (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    student_code TEXT UNIQUE NOT NULL,
    birth_date TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('male', 'female', 'other')),
    nationality TEXT,
    birth_place TEXT,
    address TEXT,
    enrollment_date TEXT NOT NULL,
    class_id TEXT,
    parent_id TEXT,
    academic_level TEXT,
    previous_school TEXT,
    emergency_contact TEXT,
    medical_info TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'graduated', 'transferred')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(status);
"

# DOCUMENTS
echo "📄 Création de la table documents..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE documents (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by TEXT,
    uploaded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_documents_student ON documents(student_id);
"

# TRANSACTIONS
echo "💰 Création de la table transactions..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('payment', 'refund', 'fee', 'scholarship')),
    amount REAL NOT NULL,
    payment_method TEXT,
    description TEXT,
    reference_number TEXT,
    processed_by TEXT,
    transaction_date TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'cancelled')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_transactions_student ON transactions(student_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
"

# GRADES
echo "📊 Création de la table grades..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE grades (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_type TEXT NOT NULL CHECK(grade_type IN ('homework', 'quiz', 'exam', 'project')),
    score REAL NOT NULL,
    max_score REAL NOT NULL,
    teacher_id TEXT,
    academic_year TEXT NOT NULL,
    term TEXT NOT NULL,
    comments TEXT,
    graded_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject);
"

# ATTENDANCE
echo "📅 Création de la table attendance..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE attendance (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    attendance_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
    notes TEXT,
    recorded_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
"

# TIMETABLE
echo "📋 Création de la table timetable..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE timetable (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    class_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 7),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room_number TEXT,
    academic_year TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);
CREATE INDEX idx_timetable_class ON timetable(class_id);
CREATE INDEX idx_timetable_teacher ON timetable(teacher_id);
"

# INVENTORY
echo "📦 Création de la table inventory..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE inventory (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT,
    location TEXT,
    purchase_date TEXT,
    purchase_price REAL,
    supplier TEXT,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'in_use', 'damaged', 'disposed')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_inventory_category ON inventory(category);
"

# SCHOOL EVENTS
echo "🎉 Création de la table school_events..."
npx wrangler d1 execute kds-school-db --remote --command="
CREATE TABLE school_events (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK(event_type IN ('academic', 'sport', 'cultural', 'meeting', 'holiday')),
    start_date TEXT NOT NULL,
    end_date TEXT,
    location TEXT,
    organizer_id TEXT,
    is_public INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_events_type ON school_events(event_type);
"

echo ""
echo "✅ Toutes les tables ont été créées avec succès!"
echo ""

# ============================================
# 3. Insérer l'utilisateur admin par défaut
# ============================================
echo "👤 Création de l'utilisateur admin..."
npx wrangler d1 execute kds-school-db --remote --command="
INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active)
VALUES ('admin-001', 'admin@kds-school.com', '\$2a\$10\$dummy.hash.for.testing', 'admin', 'Admin', 'KDS', 1);
"

echo ""
echo "✅ Base de données D1 réinitialisée avec succès!"
echo "🎯 Schéma normalisé compatible avec le Worker actuel"
echo ""
echo "📊 Tables créées:"
echo "   ✓ users (table centrale)"
echo "   ✓ teachers (lié à users)"
echo "   ✓ classes"
echo "   ✓ students (lié à users et classes)"
echo "   ✓ documents"
echo "   ✓ transactions"
echo "   ✓ grades"
echo "   ✓ attendance"
echo "   ✓ timetable"
echo "   ✓ inventory"
echo "   ✓ school_events"
echo ""
echo "👤 Utilisateur par défaut:"
echo "   Email: admin@kds-school.com"
echo "   Role: admin"
echo ""
