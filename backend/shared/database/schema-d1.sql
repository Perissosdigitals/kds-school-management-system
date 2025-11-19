-- ========================================================================
-- KDS SCHOOL MANAGEMENT SYSTEM - DATABASE SCHEMA FOR CLOUDFLARE D1
-- SQLite 3 Compatible
-- ========================================================================

-- ========================================================================
-- CORE ENTITIES
-- ========================================================================

-- Users and Authentication
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL CHECK (role IN ('founder', 'director', 'teacher', 'student', 'parent', 'admin', 'accountant', 'manager', 'agent')),
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

-- Students
CREATE TABLE students (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    student_code TEXT UNIQUE NOT NULL,
    birth_date TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')),
    nationality TEXT,
    birth_place TEXT,
    address TEXT,
    enrollment_date TEXT NOT NULL,
    class_id TEXT,
    parent_id TEXT REFERENCES users(id),
    academic_level TEXT,
    previous_school TEXT,
    emergency_contact TEXT, -- JSON string
    medical_info TEXT, -- JSON string
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'graduated', 'transferred')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_parent ON students(parent_id);

-- Teachers
CREATE TABLE teachers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT, -- JSON array as string
    hire_date TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_teachers_status ON teachers(status);

-- Classes
CREATE TABLE classes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    main_teacher_id TEXT REFERENCES teachers(id),
    room_number TEXT,
    capacity INTEGER DEFAULT 30,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_classes_level ON classes(level);
CREATE INDEX idx_classes_teacher ON classes(main_teacher_id);
CREATE INDEX idx_classes_active ON classes(is_active);

-- ========================================================================
-- ACADEMIC MODULES
-- ========================================================================

-- Subjects
CREATE TABLE subjects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_active ON subjects(is_active);

-- Grade Categories
CREATE TABLE grade_categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    weight REAL NOT NULL CHECK (weight BETWEEN 0 AND 1),
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_grade_categories_subject ON grade_categories(subject_id);
CREATE INDEX idx_grade_categories_class ON grade_categories(class_id);

-- Grades and Evaluations
CREATE TABLE grades (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES grade_categories(id) ON DELETE SET NULL,
    grade REAL NOT NULL CHECK (grade >= 0),
    max_grade REAL DEFAULT 20,
    evaluation_date TEXT NOT NULL,
    comment TEXT,
    recorded_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject_id);
CREATE INDEX idx_grades_date ON grades(evaluation_date);
CREATE INDEX idx_grades_category ON grades(category_id);

-- ========================================================================
-- PLANNING MODULES
-- ========================================================================

-- Timetable Slots
CREATE TABLE timetable_slots (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
    room TEXT,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    recurrence_pattern TEXT DEFAULT 'weekly',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_timetable_class ON timetable_slots(class_id);
CREATE INDEX idx_timetable_teacher ON timetable_slots(teacher_id);
CREATE INDEX idx_timetable_day ON timetable_slots(day_of_week);

-- Attendance
CREATE TABLE attendance (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    period TEXT CHECK (period IN ('morning', 'afternoon', 'full_day')),
    reason TEXT,
    recorded_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, date, period)
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- ========================================================================
-- DOCUMENT MANAGEMENT
-- ========================================================================

-- Student Documents with History
CREATE TABLE student_documents (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'birth_certificate', 
        'id_card', 
        'health_record',
        'academic_transcript',
        'parental_authorization',
        'vaccination_record',
        'other'
    )),
    status TEXT NOT NULL CHECK (status IN ('pending', 'validated', 'rejected', 'missing')) DEFAULT 'pending',
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    uploaded_by TEXT REFERENCES users(id),
    validated_by TEXT REFERENCES users(id),
    uploaded_at TEXT DEFAULT (datetime('now')),
    validated_at TEXT,
    rejection_reason TEXT,
    change_history TEXT DEFAULT '[]', -- JSON string
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_documents_student ON student_documents(student_id);
CREATE INDEX idx_documents_type ON student_documents(type);
CREATE INDEX idx_documents_status ON student_documents(status);

-- ========================================================================
-- IMPORT/EXPORT SYSTEM
-- ========================================================================

-- Import Batches
CREATE TABLE import_batches (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    type TEXT NOT NULL CHECK (type IN ('students', 'teachers', 'grades', 'attendance', 'subjects', 'classes')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'completed', 'failed')) DEFAULT 'pending',
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    
    -- Metadata
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    error_rows INTEGER DEFAULT 0,
    
    -- Configuration (JSON strings)
    column_mapping TEXT,
    validation_rules TEXT,
    
    -- Relations
    created_by TEXT REFERENCES users(id) NOT NULL,
    approved_by TEXT REFERENCES users(id),
    reviewed_by TEXT REFERENCES users(id),
    
    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    approved_at TEXT,
    started_at TEXT,
    completed_at TEXT,
    
    -- Results
    error_log TEXT,
    summary TEXT -- JSON string
);

CREATE INDEX idx_import_type ON import_batches(type);
CREATE INDEX idx_import_status ON import_batches(status);
CREATE INDEX idx_import_created ON import_batches(created_at);
CREATE INDEX idx_import_created_by ON import_batches(created_by);

-- ========================================================================
-- FINANCIAL MODULES
-- ========================================================================

-- Financial Transactions
CREATE TABLE financial_transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('tuition', 'meal', 'transport', 'activity', 'other')),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
    due_date TEXT,
    paid_date TEXT,
    description TEXT,
    reference TEXT,
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_transactions_student ON financial_transactions(student_id);
CREATE INDEX idx_transactions_type ON financial_transactions(type);
CREATE INDEX idx_transactions_status ON financial_transactions(status);
CREATE INDEX idx_transactions_due ON financial_transactions(due_date);

-- ========================================================================
-- AUDIT & LOGS
-- ========================================================================

-- Audit Logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    old_values TEXT, -- JSON string
    new_values TEXT, -- JSON string
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ========================================================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================================================

CREATE TRIGGER update_users_updated_at 
AFTER UPDATE ON users FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_students_updated_at 
AFTER UPDATE ON students FOR EACH ROW
BEGIN
    UPDATE students SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_teachers_updated_at 
AFTER UPDATE ON teachers FOR EACH ROW
BEGIN
    UPDATE teachers SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_classes_updated_at 
AFTER UPDATE ON classes FOR EACH ROW
BEGIN
    UPDATE classes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_grades_updated_at 
AFTER UPDATE ON grades FOR EACH ROW
BEGIN
    UPDATE grades SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_timetable_updated_at 
AFTER UPDATE ON timetable_slots FOR EACH ROW
BEGIN
    UPDATE timetable_slots SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_documents_updated_at 
AFTER UPDATE ON student_documents FOR EACH ROW
BEGIN
    UPDATE student_documents SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_transactions_updated_at 
AFTER UPDATE ON financial_transactions FOR EACH ROW
BEGIN
    UPDATE financial_transactions SET updated_at = datetime('now') WHERE id = NEW.id;
END;
