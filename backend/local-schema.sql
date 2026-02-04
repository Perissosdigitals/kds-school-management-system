-- Basic Schema for local D1 testing
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    specialization TEXT,
    hire_date TEXT,
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT,
    level TEXT,
    academic_year TEXT,
    main_teacher_id TEXT,
    room_number TEXT,
    capacity INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    student_code TEXT UNIQUE,
    birth_date TEXT,
    gender TEXT,
    nationality TEXT,
    birth_place TEXT,
    address TEXT,
    enrollment_date TEXT,
    class_id TEXT,
    academic_level TEXT,
    emergency_contact TEXT,
    medical_info TEXT,
    status TEXT DEFAULT 'active',
    photo_url TEXT,
    documents TEXT DEFAULT '[]', -- JSON string
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    document_type TEXT,
    file_name TEXT,
    file_url TEXT,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by TEXT,
    uploaded_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'Validé'
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    type TEXT,
    amount_paid REAL,
    amount_total REAL,
    status TEXT,
    date TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT,
    code TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    class_id TEXT,
    date TEXT,
    status TEXT,
    period TEXT,
    is_justified INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    subject_id TEXT,
    teacher_id TEXT,
    evaluation_type TEXT,
    value REAL,
    max_value REAL,
    coefficient REAL,
    trimester TEXT,
    academic_year TEXT,
    evaluation_date TEXT
);
