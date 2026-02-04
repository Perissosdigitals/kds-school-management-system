-- Migration 0010: Enhanced Metrics Schema
-- Rebuilds dashboard_metrics with a flat, historical structure for performance and tracking

-- 1. Drop old table if exists (since we are changing from KV to flat schema)
DROP TABLE IF EXISTS dashboard_metrics;

-- 2. Create the enhanced table
CREATE TABLE dashboard_metrics (
  metric_date DATE PRIMARY KEY,
  total_students INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  male_students INTEGER DEFAULT 0,
  female_students INTEGER DEFAULT 0,
  total_documents INTEGER DEFAULT 0,
  pending_documents INTEGER DEFAULT 0,
  validated_documents INTEGER DEFAULT 0,
  total_classes INTEGER DEFAULT 0,
  average_class_occupancy REAL DEFAULT 0,
  total_teachers INTEGER DEFAULT 0,
  documents_per_student REAL DEFAULT 0,
  validation_rate REAL DEFAULT 0,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  extra_data TEXT -- JSON string for SQLite/D1 compatibility
);

BEGIN TRANSACTION;

-- 3. Calculate and insert initial dashboard metrics
INSERT INTO dashboard_metrics (
  metric_date,
  total_students,
  active_students,
  male_students,
  female_students,
  total_documents,
  pending_documents,
  validated_documents,
  total_classes,
  average_class_occupancy,
  total_teachers,
  documents_per_student,
  validation_rate,
  calculated_at
)
SELECT 
  DATE('now') as metric_date,
  
  -- Student metrics
  (SELECT COUNT(*) FROM students) as total_students,
  (SELECT COUNT(*) FROM students WHERE LOWER(status) IN ('active', 'actif')) as active_students,
  (SELECT COUNT(*) FROM students WHERE LOWER(gender) IN ('male', 'masculin', 'm')) as male_students,
  (SELECT COUNT(*) FROM students WHERE LOWER(gender) IN ('female', 'féminin', 'f')) as female_students,
  
  -- Document metrics
  (SELECT COUNT(*) FROM documents) as total_documents,
  (SELECT COUNT(*) FROM documents WHERE validation_state = 'pending') as pending_documents,
  (SELECT COUNT(*) FROM documents WHERE validation_state = 'valid') as validated_documents,
  
  -- Class metrics
  (SELECT COUNT(*) FROM classes) as total_classes,
  (
    SELECT AVG(occupancy_rate) 
    FROM (
      SELECT c.id, 
             COUNT(s.id) * 100.0 / COALESCE(NULLIF(c.capacity, 0), 1) as occupancy_rate
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id AND LOWER(s.status) IN ('active', 'actif')
      GROUP BY c.id
    )
  ) as average_class_occupancy,
  
  -- Teacher metrics
  (SELECT COUNT(*) FROM teachers WHERE LOWER(status) IN ('active', 'actif')) as total_teachers,
  
  -- Performance indicators
  CASE 
    WHEN (SELECT COUNT(*) FROM students WHERE LOWER(status) IN ('active', 'actif')) > 0 
    THEN (SELECT COUNT(*) FROM documents) * 1.0 / (SELECT COUNT(*) FROM students WHERE LOWER(status) IN ('active', 'actif'))
    ELSE 0 
  END as documents_per_student,
  
  CASE 
    WHEN (SELECT COUNT(*) FROM documents) > 0 
    THEN (SELECT COUNT(*) FROM documents WHERE validation_state = 'valid') * 100.0 / (SELECT COUNT(*) FROM documents)
    ELSE 0 
  END as validation_rate,
  
  CURRENT_TIMESTAMP as calculated_at;

-- 4. Add missing columns to students if needed (TypeORM will handle sync but D1 needs them)
-- Note: D1 migrations usually shouldn't use IF NOT EXISTS for columns in some versions, but standard is:
-- ALTER TABLE students ADD COLUMN document_count INTEGER DEFAULT 0;
-- ALTER TABLE students ADD COLUMN pending_docs INTEGER DEFAULT 0;
-- ALTER TABLE students ADD COLUMN last_synced_at DATETIME;

-- 5. Update all student document counts
UPDATE students 
SET document_count = (
  SELECT COUNT(*) 
  FROM documents d 
  WHERE d.student_id = students.id
),
pending_docs = (
  SELECT COUNT(*) 
  FROM documents d 
  WHERE d.student_id = students.id AND d.validation_state = 'pending'
),
sync_status = 'synced',
last_synced_at = CURRENT_TIMESTAMP;

-- 6. Update all document sync status
UPDATE documents 
SET sync_status = 'synced',
    last_synced_at = CURRENT_TIMESTAMP
WHERE sync_status IS NULL OR sync_status = 'pending';

COMMIT;
