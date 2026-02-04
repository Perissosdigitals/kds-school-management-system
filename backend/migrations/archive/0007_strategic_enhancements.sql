-- Migration 0007: Strategic Enhancements for Document Tracking
-- Documentation: Adds document status constraints and student counters.

-- 1. Ensure students table has counters
ALTER TABLE students ADD COLUMN document_count INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN pending_docs INTEGER DEFAULT 0;

-- 2. Drop and Recreate documents table with better constraints and r2_key
-- Note: We drop because SQLite/D1 has limited support for complex ALTER TABLE (like adding CHECK constraints)
DROP TABLE IF EXISTS documents;

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  doc_type TEXT,
  status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'missing')) DEFAULT 'pending',
  r2_key TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  validated_at TIMESTAMP,
  validated_by TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 3. Initial count sync (optional but good for consistency)
UPDATE students 
SET document_count = (SELECT COUNT(*) FROM documents WHERE documents.student_id = students.id),
    pending_docs = (SELECT COUNT(*) FROM documents WHERE documents.student_id = students.id AND status = 'pending');
