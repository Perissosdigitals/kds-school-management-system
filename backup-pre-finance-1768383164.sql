PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE subjects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "subjects" VALUES('subj-001','Mathematiques','MATH','#3B82F6','Mathematiques Primaire et College',1,'2025-11-20 17:05:37');
INSERT INTO "subjects" VALUES('subj-002','Francais','FR','#10B981','Langue Francaise',1,'2025-11-20 17:05:37');
INSERT INTO "subjects" VALUES('subj-003','Sciences','SCI','#8B5CF6','Sciences Naturelles',1,'2025-11-20 17:05:37');
INSERT INTO "subjects" VALUES('subj-004','Histoire-Geo','HG','#F59E0B','Histoire et Geographie',1,'2025-11-20 17:05:37');
INSERT INTO "subjects" VALUES('subj-005','Anglais','ANG','#EF4444','Langue Anglaise',1,'2025-11-20 17:05:37');
INSERT INTO "subjects" VALUES('subj-006','Torah','TOR','#6366F1','Etudes de la Torah',1,'2025-11-20 17:05:37');
INSERT INTO "subjects" VALUES('subj-007','Hebreu','HEB','#14B8A6','Langue Hebraique',1,'2025-11-20 17:05:37');
INSERT INTO "subjects" VALUES('subj-008','EPS','EPS','#F97316','Education Physique',1,'2025-11-20 17:05:37');
INSERT INTO "subjects" VALUES('subj-009','Arts','ART','#EC4899','Arts Plastiques',1,'2025-11-20 17:05:37');
INSERT INTO "subjects" VALUES('subj-010','Informatique','INFO','#06B6D4','Informatique',1,'2025-11-20 17:05:37');
CREATE TABLE grade_categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    weight REAL NOT NULL CHECK (weight BETWEEN 0 AND 1),
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
);
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
INSERT INTO "timetable_slots" VALUES('slot-001','class-005','subj-001','tchr-001','A-105',1,'08:00','09:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-002','class-005','subj-002','tchr-002','A-105',1,'09:00','10:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-003','class-005','subj-006','tchr-005','A-105',1,'10:30','11:30','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-004','class-005','subj-007','tchr-005','A-105',1,'11:30','12:30','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-005','class-005','subj-001','tchr-001','A-105',2,'08:00','09:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-006','class-005','subj-003','tchr-003','Labo',2,'09:00','10:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-007','class-005','subj-004','tchr-003','A-105',2,'10:30','11:30','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-008','class-005','subj-008','tchr-001','Gymnase',2,'11:30','12:30','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-009','class-005','subj-002','tchr-002','A-105',3,'08:00','09:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-010','class-005','subj-005','tchr-004','A-105',3,'09:00','10:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-011','class-005','subj-006','tchr-005','A-105',4,'08:00','09:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-012','class-005','subj-001','tchr-001','A-105',4,'09:00','10:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-013','class-005','subj-010','tchr-004','Info',4,'10:30','11:30','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-014','class-005','subj-009','tchr-002','Atelier',5,'08:00','09:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "timetable_slots" VALUES('slot-015','class-005','subj-003','tchr-003','Labo',5,'09:00','10:00','weekly',1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
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
INSERT INTO "financial_transactions" VALUES('4652940f-e8a2-4374-9d2c-ac849a279bea',NULL,'tuition',500000,'XOF','pending','2025-12-31',NULL,'Frais de scolarité Trimestre 1','TXN1763534172574',NULL,'2025-11-19 06:36:12','2025-11-20 00:00:24');
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
INSERT INTO "users" VALUES('admin-001','admin@ksp-school.ci','$2a$10$Hash','admin','David','COHEN','+225 07 07 07 07 07',NULL,1,NULL,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "users" VALUES('teacher-001','mkone@ksp-school.ci','$2a$10$Hash','teacher','Mohamed','KONE','+225 07 08 09 10 11',NULL,1,NULL,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "users" VALUES('teacher-002','acoulibaly@ksp-school.ci','$2a$10$Hash','teacher','Aminata','COULIBALY','+225 07 08 09 10 12',NULL,1,NULL,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "users" VALUES('teacher-003','jtraore@ksp-school.ci','$2a$10$Hash','teacher','Jean','TRAORE','+225 07 08 09 10 13',NULL,1,NULL,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "users" VALUES('teacher-004','syao@ksp-school.ci','$2a$10$Hash','teacher','Sarah','YAO','+225 07 08 09 10 14',NULL,1,NULL,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "users" VALUES('teacher-005','rbamba@ksp-school.ci','$2a$10$Hash','teacher','Myriam','BAMBA','+225 07 08 09 10 15',NULL,1,NULL,'2025-11-20 17:05:37','2025-11-20 19:14:32');
INSERT INTO "users" VALUES('parent-001','parent1@example.ci','$2a$10$Hash','parent','Ibrahim','DIALLO','+225 07 11 22 33 44',NULL,1,NULL,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "users" VALUES('parent-002','parent2@example.ci','$2a$10$Hash','parent','Fatou','KONATE','+225 07 11 22 33 45',NULL,1,NULL,'2025-11-20 17:05:37','2025-11-20 17:05:37');
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
INSERT INTO "teachers" VALUES('tchr-001','teacher-001','Mathematiques','2020-09-01','active','2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "teachers" VALUES('tchr-002','teacher-002','Francais','2021-09-01','active','2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "teachers" VALUES('tchr-003','teacher-003','Sciences','2019-09-01','active','2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "teachers" VALUES('tchr-004','teacher-004','Anglais','2022-09-01','active','2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "teachers" VALUES('tchr-005','teacher-005','Torah et Hebreu','01/09/2020','active','2025-11-20 17:05:37','2025-11-20 19:14:33');
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
INSERT INTO "classes" VALUES('class-001','CP1-A','CP1','2024-2025','tchr-001','A-101',25,1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "classes" VALUES('class-002','CE1-A','CE1','2024-2025','tchr-002','A-102',25,1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "classes" VALUES('class-003','CE2-A','CE2','2024-2025','tchr-003','A-103',25,1,'2025-11-20 17:05:37','2025-12-04 11:04:23');
INSERT INTO "classes" VALUES('class-004','CM1-A','CM1','2024-2025','tchr-004','A-104',25,1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "classes" VALUES('class-005','CM2-A','CM2','2024-2025','tchr-005','A-105',25,1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "classes" VALUES('class-006','6eme-A','6eme','2024-2025','tchr-001','B-201',30,1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "classes" VALUES('class-007','5eme-A','5eme','2024-2025','tchr-002','B-202',30,1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "classes" VALUES('class-008','4eme-A','4eme','2024-2025','tchr-003','B-203',30,1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "classes" VALUES('class-009','3eme-A','3eme','2024-2025','tchr-004','B-204',30,1,'2025-11-20 17:05:37','2025-11-20 17:05:37');
INSERT INTO "classes" VALUES('class-010','CP2-A','CP2','2024-2025','tchr-002','A-106',25,1,'2025-11-20 17:24:33','2025-11-20 17:24:33');
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
    updated_at TEXT DEFAULT (datetime('now')), first_name TEXT, last_name TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);
INSERT INTO "students" VALUES('std-001',NULL,'KDS24001','2014-05-15','male',NULL,NULL,'Cocody','2024-09-01','class-005','parent-001',NULL,NULL,'Fatima +225 07 11 22 33 46',NULL,'active','2025-11-20 17:05:37','2025-11-20 17:05:37','Yacine','DIALLO');
INSERT INTO "students" VALUES('std-002',NULL,'KDS24002','2014-08-22','female',NULL,NULL,'Plateau','2024-09-01','class-005','parent-002',NULL,NULL,'Moussa +225 07 11 22 33 47','Asthme','active','2025-11-20 17:05:37','2025-11-20 17:05:37','Sarah','KONATE');
INSERT INTO "students" VALUES('std-003',NULL,'KDS24003','2014-03-10','male',NULL,NULL,'Cocody','2024-09-01','class-005','parent-001',NULL,NULL,'Rachel +225 07 11 22 33 48',NULL,'active','2025-11-20 17:05:37','2025-11-20 17:05:37','David','COHEN');
INSERT INTO "students" VALUES('std-004',NULL,'KDS24004','2014-11-30','female',NULL,NULL,'Yopougon','2024-09-01','class-005','parent-002',NULL,NULL,'Sekou +225 07 11 22 33 49',NULL,'active','2025-11-20 17:05:37','2025-11-20 17:05:37','Lea','BAMBA');
INSERT INTO "students" VALUES('std-005',NULL,'KDS24005','2014-07-18','male',NULL,NULL,'Marcory','2024-09-01','class-005','parent-001',NULL,NULL,'Aminata +225 07 11 22 33 50',NULL,'active','2025-11-20 17:05:37','2025-11-20 17:05:37','Moshe','TOURE');
INSERT INTO "students" VALUES('std-006',NULL,'KDS24006','2016-04-12','female',NULL,NULL,'Cocody','2024-09-01','class-001','parent-002',NULL,NULL,'Bakary +225 07 11 22 33 51',NULL,'active','2025-11-20 17:05:37','2025-11-20 17:05:37','Esther','SANOGO');
INSERT INTO "students" VALUES('std-007',NULL,'KDS24007','2016-09-25','male',NULL,NULL,'Plateau','2024-09-01','class-001','parent-001',NULL,NULL,'Aicha +225 07 11 22 33 52',NULL,'active','2025-11-20 17:05:37','2025-11-20 17:05:37','Aaron','COULIBALY');
INSERT INTO "students" VALUES('std-008',NULL,'KDS24008','2012-06-08','female',NULL,NULL,'Yopougon','2024-09-01','class-006','parent-002',NULL,NULL,'Jean +225 07 11 22 33 53',NULL,'active','2025-11-20 17:05:37','2025-11-20 17:05:37','Miriam','TRAORE');
INSERT INTO "students" VALUES('std-009',NULL,'KDS24009','2012-12-20','male',NULL,NULL,'Marcory','2024-09-01','class-006','parent-001',NULL,NULL,'Marie +225 07 11 22 33 54',NULL,'active','2025-11-20 17:05:37','2025-11-20 17:05:37','Samuel','DIABY');
INSERT INTO "students" VALUES('std-010',NULL,'KDS24010','2013-02-14','female',NULL,NULL,'Cocody','2024-09-01','class-006','parent-002',NULL,NULL,'Mohamed +225 07 11 22 33 55','Allergie arachides','active','2025-11-20 17:05:37','2025-11-20 17:05:37','Hannah','KONE');
INSERT INTO "students" VALUES('std-011',NULL,'KDS24011','2017-03-15','female',NULL,NULL,'Cocody','2024-09-01','class-001','parent-001',NULL,NULL,'Marie +225 07 11 22 44 01',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Abigail','KOUAME');
INSERT INTO "students" VALUES('std-012',NULL,'KDS24012','2017-05-20','male',NULL,NULL,'Plateau','2024-09-01','class-001','parent-002',NULL,NULL,'Jean +225 07 11 22 44 02',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Benjamin','OUATTARA');
INSERT INTO "students" VALUES('std-013',NULL,'KDS24013','2017-07-10','female',NULL,NULL,'Yopougon','2024-09-01','class-001','parent-001',NULL,NULL,'Aminata +225 07 11 22 44 03',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Deborah','KOFFI');
INSERT INTO "students" VALUES('std-014',NULL,'KDS24014','2017-04-25','male',NULL,NULL,'Marcory','2024-09-01','class-001','parent-002',NULL,NULL,'Fatou +225 07 11 22 44 04',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Elijah','KONE');
INSERT INTO "students" VALUES('std-015',NULL,'KDS24015','2017-08-12','female',NULL,NULL,'Cocody','2024-09-01','class-001','parent-001',NULL,NULL,'Ibrahim +225 07 11 22 44 05',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Rachel','BAMBA');
INSERT INTO "students" VALUES('std-016',NULL,'KDS24016','2017-06-18','male',NULL,NULL,'Abobo','2024-09-01','class-001','parent-002',NULL,NULL,'Aissata +225 07 11 22 44 06',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Isaac','DIABATE');
INSERT INTO "students" VALUES('std-017',NULL,'KDS24017','2017-09-22','female',NULL,NULL,'Treichville','2024-09-01','class-001','parent-001',NULL,NULL,'Moussa +225 07 11 22 44 07',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Rebecca','TOURE');
INSERT INTO "students" VALUES('std-018',NULL,'KDS24018','2017-02-14','male',NULL,NULL,'Plateau','2024-09-01','class-001','parent-002',NULL,NULL,'Kadiatou +225 07 11 22 44 08',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Jacob','SANOGO');
INSERT INTO "students" VALUES('std-019',NULL,'KDS24019','2017-11-30','female',NULL,NULL,'Cocody','2024-09-01','class-001','parent-001',NULL,NULL,'Sekou +225 07 11 22 44 09',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Leah','COULIBALY');
INSERT INTO "students" VALUES('std-020',NULL,'KDS24020','2017-01-08','male',NULL,NULL,'Marcory','2024-09-01','class-001','parent-002',NULL,NULL,'Awa +225 07 11 22 44 10',NULL,'active','2025-11-20 17:26:41','2025-11-20 17:26:41','Nathan','YAO');
INSERT INTO "students" VALUES('std-021',NULL,'KDS24021','2016-04-15','female',NULL,NULL,'Yopougon','2024-09-01','class-010','parent-001',NULL,NULL,'Bakary +225 07 11 22 44 11',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Miriam','DIALLO');
INSERT INTO "students" VALUES('std-022',NULL,'KDS24022','2016-06-20','male',NULL,NULL,'Abobo','2024-09-01','class-010','parent-002',NULL,NULL,'Mariam +225 07 11 22 44 12',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Joseph','TRAORE');
INSERT INTO "students" VALUES('std-023',NULL,'KDS24023','2016-08-10','female',NULL,NULL,'Cocody','2024-09-01','class-010','parent-001',NULL,NULL,'Amadou +225 07 11 22 44 13',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Ruth','KONATE');
INSERT INTO "students" VALUES('std-024',NULL,'KDS24024','2016-03-25','male',NULL,NULL,'Plateau','2024-09-01','class-010','parent-002',NULL,NULL,'Fanta +225 07 11 22 44 14',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Samuel','OUEDRAOGO');
INSERT INTO "students" VALUES('std-025',NULL,'KDS24025','2016-09-12','female',NULL,NULL,'Treichville','2024-09-01','class-010','parent-001',NULL,NULL,'Ousmane +225 07 11 22 44 15',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Esther','KONE');
INSERT INTO "students" VALUES('std-026',NULL,'KDS24026','2016-05-18','male',NULL,NULL,'Marcory','2024-09-01','class-010','parent-002',NULL,NULL,'Salimata +225 07 11 22 44 16',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Daniel','BAMBA');
INSERT INTO "students" VALUES('std-027',NULL,'KDS24027','2016-10-22','female',NULL,NULL,'Cocody','2024-09-01','class-010','parent-001',NULL,NULL,'Lassina +225 07 11 22 44 17',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Sarah','DIABY');
INSERT INTO "students" VALUES('std-028',NULL,'KDS24028','2016-02-14','male',NULL,NULL,'Yopougon','2024-09-01','class-010','parent-002',NULL,NULL,'Nafissatou +225 07 11 22 44 18',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Joshua','SANGARE');
INSERT INTO "students" VALUES('std-029',NULL,'KDS24029','2016-11-30','female',NULL,NULL,'Plateau','2024-09-01','class-010','parent-001',NULL,NULL,'Adama +225 07 11 22 44 19',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Hannah','KOUASSI');
INSERT INTO "students" VALUES('std-030',NULL,'KDS24030','2016-01-08','male',NULL,NULL,'Abobo','2024-09-01','class-010','parent-002',NULL,NULL,'Hawa +225 07 11 22 44 20',NULL,'active','2025-11-20 17:29:30','2025-11-20 17:29:30','Noah','TAPSOBA');
INSERT INTO "students" VALUES('std-031',NULL,'KDS24031','2016-03-15','male',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 11 22 33',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Samuel','TRAORE');
INSERT INTO "students" VALUES('std-032',NULL,'KDS24032','2016-04-20','female',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 22 33 44',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Sarah','KONE');
INSERT INTO "students" VALUES('std-033',NULL,'KDS24033','2016-05-10','male',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 33 44 55',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Joseph','BAMBA');
INSERT INTO "students" VALUES('std-034',NULL,'KDS24034','2016-06-08','female',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 44 55 66',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Miriam','DIABATE');
INSERT INTO "students" VALUES('std-035',NULL,'KDS24035','2016-07-12','male',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 55 66 77',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Daniel','TOURE');
INSERT INTO "students" VALUES('std-036',NULL,'KDS24036','2016-08-18','female',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 66 77 88',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Esther','SANOGO');
INSERT INTO "students" VALUES('std-037',NULL,'KDS24037','2016-09-22','male',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 77 88 99',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Aaron','COULIBALY');
INSERT INTO "students" VALUES('std-038',NULL,'KDS24038','2016-10-05','female',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 88 99 00',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Ruth','YAO');
INSERT INTO "students" VALUES('std-039',NULL,'KDS24039','2016-11-14','male',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 99 00 11',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Caleb','KOUAME');
INSERT INTO "students" VALUES('std-040',NULL,'KDS24040','2016-12-20','female',NULL,NULL,NULL,'2024-09-01','class-002',NULL,NULL,NULL,'+225 07 00 11 22',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Hannah','OUATTARA');
INSERT INTO "students" VALUES('std-041',NULL,'KDS24041','2015-01-10','male',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 11 33 55',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Joshua','KOFFI');
INSERT INTO "students" VALUES('std-042',NULL,'KDS24042','2015-02-15','female',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 22 44 66',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Naomi','KONE');
INSERT INTO "students" VALUES('std-043',NULL,'KDS24043','2015-03-20','male',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 33 55 77',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Gideon','BAMBA');
INSERT INTO "students" VALUES('std-044',NULL,'KDS24044','2015-04-25','female',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 44 66 88',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Lydia','DIABATE');
INSERT INTO "students" VALUES('std-045',NULL,'KDS24045','2015-05-30','male',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 55 77 99',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Ezekiel','TRAORE');
INSERT INTO "students" VALUES('std-046',NULL,'KDS24046','2015-06-12','female',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 66 88 00',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Priscilla','SANOGO');
INSERT INTO "students" VALUES('std-047',NULL,'KDS24047','2015-07-18','male',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 77 99 11',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Josiah','COULIBALY');
INSERT INTO "students" VALUES('std-048',NULL,'KDS24048','2015-08-22','female',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 88 00 22',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Tabitha','YAO');
INSERT INTO "students" VALUES('std-049',NULL,'KDS24049','2015-09-28','male',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 99 11 33',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Micah','KOUAME');
INSERT INTO "students" VALUES('std-050',NULL,'KDS24050','2015-10-15','female',NULL,NULL,NULL,'2024-09-01','class-003',NULL,NULL,NULL,'+225 07 00 22 44',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Dinah','OUATTARA');
INSERT INTO "students" VALUES('std-051',NULL,'KDS24051','2014-01-08','male',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 11 44 77',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Solomon','KOFFI');
INSERT INTO "students" VALUES('std-052',NULL,'KDS24052','2014-02-12','female',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 22 55 88',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Martha','KONE');
INSERT INTO "students" VALUES('std-053',NULL,'KDS24053','2014-03-18','male',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 33 66 99',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Jeremiah','BAMBA');
INSERT INTO "students" VALUES('std-054',NULL,'KDS24054','2014-04-22','female',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 44 77 00',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Salome','DIABATE');
INSERT INTO "students" VALUES('std-055',NULL,'KDS24055','2014-05-28','male',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 55 88 11',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Isaiah','TRAORE');
INSERT INTO "students" VALUES('std-056',NULL,'KDS24056','2014-06-15','female',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 66 99 22',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Phoebe','SANOGO');
INSERT INTO "students" VALUES('std-057',NULL,'KDS24057','2014-07-20','male',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 77 00 33',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Jonah','COULIBALY');
INSERT INTO "students" VALUES('std-058',NULL,'KDS24058','2014-08-25','female',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 88 11 44',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Dorcas','YAO');
INSERT INTO "students" VALUES('std-059',NULL,'KDS24059','2014-09-30','male',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 99 22 55',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Amos','KOUAME');
INSERT INTO "students" VALUES('std-060',NULL,'KDS24060','2014-10-10','female',NULL,NULL,NULL,'2024-09-01','class-004',NULL,NULL,NULL,'+225 07 00 33 66',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Zipporah','OUATTARA');
INSERT INTO "students" VALUES('std-061',NULL,'KDS24061','2013-01-05','male',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 11 55 88',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Moses','KOFFI');
INSERT INTO "students" VALUES('std-062',NULL,'KDS24062','2013-02-10','female',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 22 66 99',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Elizabeth','KONE');
INSERT INTO "students" VALUES('std-063',NULL,'KDS24063','2013-03-15','male',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 33 77 00',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Nehemiah','BAMBA');
INSERT INTO "students" VALUES('std-064',NULL,'KDS24064','2013-04-20','female',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 44 88 11',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Mary','DIABATE');
INSERT INTO "students" VALUES('std-065',NULL,'KDS24065','2013-05-25','male',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 55 99 22',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Ezra','TRAORE');
INSERT INTO "students" VALUES('std-066',NULL,'KDS24066','2013-06-30','female',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 66 00 33',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Anna','SANOGO');
INSERT INTO "students" VALUES('std-067',NULL,'KDS24067','2013-07-12','male',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 77 11 44',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Simeon','COULIBALY');
INSERT INTO "students" VALUES('std-068',NULL,'KDS24068','2013-08-18','female',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 88 22 55',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Joanna','YAO');
INSERT INTO "students" VALUES('std-069',NULL,'KDS24069','2013-09-22','male',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 99 33 66',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Zacharias','KOUAME');
INSERT INTO "students" VALUES('std-070',NULL,'KDS24070','2013-10-28','female',NULL,NULL,NULL,'2024-09-01','class-005',NULL,NULL,NULL,'+225 07 00 44 77',NULL,'active','2025-11-20 17:53:06','2025-11-20 17:53:06','Susanna','OUATTARA');
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
INSERT INTO "grades" VALUES('grade-001','std-001','Mathematiques','exam',15.5,20,'tchr-001','2024-2025','Trimestre 1','Bon travail','2024-10-15','2025-11-20 17:05:37');
INSERT INTO "grades" VALUES('grade-002','std-001','Francais','exam',17,20,'tchr-002','2024-2025','Trimestre 1','Excellent','2024-10-16','2025-11-20 17:05:37');
INSERT INTO "grades" VALUES('grade-003','std-002','Mathematiques','exam',14,20,'tchr-001','2024-2025','Trimestre 1','Bien','2024-10-15','2025-11-20 17:05:37');
INSERT INTO "grades" VALUES('grade-004','std-002','Francais','exam',16.5,20,'tchr-002','2024-2025','Trimestre 1','Tres bien','2024-10-16','2025-11-20 17:05:37');
INSERT INTO "grades" VALUES('grade-005','std-003','Mathematiques','exam',18,20,'tchr-001','2024-2025','Trimestre 1','Excellent','2024-10-15','2025-11-20 17:05:37');
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
INSERT INTO "attendance" VALUES('att-001','std-001','class-005','2024-11-18','present',NULL,'tchr-001','2025-11-20 17:05:37');
INSERT INTO "attendance" VALUES('att-002','std-002','class-005','2024-11-18','present',NULL,'tchr-001','2025-11-20 17:05:37');
INSERT INTO "attendance" VALUES('att-003','std-003','class-005','2024-11-18','present',NULL,'tchr-001','2025-11-20 17:05:37');
INSERT INTO "attendance" VALUES('att-004','std-004','class-005','2024-11-18','absent','Malade','tchr-001','2025-11-20 17:05:37');
INSERT INTO "attendance" VALUES('att-005','std-005','class-005','2024-11-18','present',NULL,'tchr-001','2025-11-20 17:05:37');
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
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_active ON subjects(is_active);
CREATE INDEX idx_grade_categories_subject ON grade_categories(subject_id);
CREATE INDEX idx_grade_categories_class ON grade_categories(class_id);
CREATE INDEX idx_timetable_class ON timetable_slots(class_id);
CREATE INDEX idx_timetable_teacher ON timetable_slots(teacher_id);
CREATE INDEX idx_timetable_day ON timetable_slots(day_of_week);
CREATE INDEX idx_documents_student ON student_documents(student_id);
CREATE INDEX idx_documents_type ON student_documents(type);
CREATE INDEX idx_documents_status ON student_documents(status);
CREATE INDEX idx_import_type ON import_batches(type);
CREATE INDEX idx_import_status ON import_batches(status);
CREATE INDEX idx_import_created ON import_batches(created_at);
CREATE INDEX idx_import_created_by ON import_batches(created_by);
CREATE INDEX idx_transactions_student ON financial_transactions(student_id);
CREATE INDEX idx_transactions_type ON financial_transactions(type);
CREATE INDEX idx_transactions_status ON financial_transactions(status);
CREATE INDEX idx_transactions_due ON financial_transactions(due_date);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_teachers_user ON teachers(user_id);
CREATE INDEX idx_teachers_status ON teachers(status);
CREATE INDEX idx_classes_level ON classes(level);
CREATE INDEX idx_classes_teacher ON classes(main_teacher_id);
CREATE INDEX idx_classes_active ON classes(is_active);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_events_type ON school_events(event_type);
CREATE INDEX idx_classes_year ON classes(academic_year);
CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_grades_year ON grades(academic_year);
CREATE INDEX idx_attendance_class ON attendance(class_id);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_events_start ON school_events(start_date);
CREATE INDEX idx_events_public ON school_events(is_public);
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
