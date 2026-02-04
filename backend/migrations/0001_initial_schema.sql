-- Migration: Initial Schema (Worker Aligned Bridge - FINAL)
-- Description: Total alignment with Hono worker expectations and PG dump columns.

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    is_active INTEGER DEFAULT 1,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    custom_permissions TEXT DEFAULT '{}'
);

CREATE TABLE teachers (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    hire_date TEXT,
    registration_number TEXT,
    last_name TEXT,
    first_name TEXT,
    specialization TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact TEXT,
    qualifications TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    sync_status TEXT DEFAULT 'synced',
    validation_state TEXT DEFAULT 'valid'
);

CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    level TEXT,
    main_teacher_id TEXT REFERENCES teachers(id),
    capacity INTEGER DEFAULT 35,
    is_active INTEGER DEFAULT 1,
    registration_number TEXT,
    name TEXT NOT NULL,
    academic_year TEXT,
    room_number TEXT,
    room_number_number TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    sync_status TEXT DEFAULT 'synced',
    validation_state TEXT DEFAULT 'valid'
);

CREATE TABLE students (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    nationality TEXT,
    address TEXT,
    class_id TEXT REFERENCES classes(id),
    student_code TEXT UNIQUE,
    enrollment_date TEXT,
    last_name TEXT,
    first_name TEXT,
    birth_date TEXT,
    phone TEXT,
    email TEXT,
    academic_level TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    documents TEXT DEFAULT '[]',
    gender TEXT,
    birth_place TEXT,
    previous_school TEXT,
    medical_info TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    photo_url TEXT,
    sync_status TEXT DEFAULT 'synced',
    validation_state TEXT DEFAULT 'valid',
    document_count INTEGER DEFAULT 0,
    pending_docs INTEGER DEFAULT 0,
    last_synced_at TEXT
);

CREATE TABLE subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    color TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    registration_number TEXT,
    grade_level TEXT,
    weekly_hours INTEGER,
    coefficient REAL,
    updated_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'active'
);

CREATE TABLE timetable_slots (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES classes(id),
    subject_id TEXT REFERENCES subjects(id),
    teacher_id TEXT REFERENCES teachers(id),
    day_of_week TEXT,
    start_time TEXT,
    end_time TEXT,
    room TEXT,
    academic_year TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id),
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    period TEXT,
    reason TEXT,
    recorded_by TEXT REFERENCES users(id),
    class_id TEXT REFERENCES classes(id),
    timetable_slot_id TEXT,
    arrival_time TEXT,
    is_justified INTEGER DEFAULT 0,
    justification_document TEXT,
    comments TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE grades (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id),
    subject_id TEXT REFERENCES subjects(id),
    evaluation_date TEXT,
    teacher_id TEXT REFERENCES teachers(id),
    evaluation_type TEXT,
    value REAL,
    max_value REAL,
    trimester TEXT,
    academic_year TEXT,
    title TEXT,
    coefficient REAL,
    comments TEXT,
    visible_to_parents INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    type TEXT,
    category TEXT,
    amount REAL,
    date TEXT,
    due_date TEXT,
    status TEXT,
    student_id TEXT REFERENCES students(id),
    description TEXT,
    payment_method TEXT,
    reference_number TEXT,
    amount_paid REAL DEFAULT 0,
    amount_remaining REAL DEFAULT 0,
    notes TEXT,
    recorded_by TEXT REFERENCES users(id),
    payment_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    registration_number TEXT,
    title TEXT,
    doc_type TEXT,
    type TEXT,
    "entityType" TEXT,
    "studentId" TEXT,
    "teacherId" TEXT,
    "entityId" TEXT,
    student_id TEXT,
    teacher_id TEXT,
    r2_key TEXT,
    filename TEXT,
    "mimeType" TEXT,
    "fileSize" TEXT,
    "accessLevel" TEXT,
    description TEXT,
    "expiryDate" TEXT,
    "isActive" TEXT,
    "uploadedBy" TEXT,
    "downloadCount" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    status TEXT DEFAULT 'pending',
    uploaded_at TEXT DEFAULT (datetime('now')),
    sync_status TEXT DEFAULT 'synced',
    validation_state TEXT DEFAULT 'valid',
    correlation_id TEXT,
    last_synced_at TEXT
);

CREATE TABLE dashboard_metrics (
    metric_key TEXT PRIMARY KEY,
    metric_value REAL DEFAULT 0,
    last_updated TEXT DEFAULT (datetime('now'))
);

CREATE TABLE parents (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    phone TEXT,
    address TEXT,
    profession TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
