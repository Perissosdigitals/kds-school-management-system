-- PostgreSQL Initialization Script for Dashboard Metrics
BEGIN;

-- 1. Calculate and insert initial dashboard metrics
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
  calculated_at,
  extra_data
)
SELECT 
  CURRENT_DATE as metric_date,
  
  -- Student metrics
  (SELECT COUNT(*) FROM students) as total_students,
  (SELECT COUNT(*) FROM students WHERE LOWER(status::text) IN ('active', 'actif')) as active_students,
  (SELECT COUNT(*) FROM students WHERE LOWER(gender::text) IN ('male', 'masculin', 'm')) as male_students,
  (SELECT COUNT(*) FROM students WHERE LOWER(gender::text) IN ('female', 'féminin', 'f')) as female_students,
  
  -- Document metrics
  (SELECT COUNT(*) FROM documents) as total_documents,
  (SELECT COUNT(*) FROM documents WHERE validation_state = 'pending') as pending_documents,
  (SELECT COUNT(*) FROM documents WHERE validation_state = 'valid') as validated_documents,
  
  -- Class metrics
  (SELECT COUNT(*) FROM classes) as total_classes,
  (
    SELECT COALESCE(AVG(occupancy_rate), 0)
    FROM (
      SELECT c.id, 
             COUNT(s.id) * 100.0 / NULLIF(c.capacity, 0) as occupancy_rate
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id AND LOWER(s.status::text) IN ('active', 'actif')
      GROUP BY c.id, c.capacity
    ) as sub
  ) as average_class_occupancy,
  
  -- Teacher metrics
  (SELECT COUNT(*) FROM teachers WHERE LOWER(status::text) IN ('active', 'actif')) as total_teachers,
  
  -- Performance indicators
  CASE 
    WHEN (SELECT COUNT(*) FROM students WHERE LOWER(status::text) IN ('active', 'actif')) > 0 
    THEN (SELECT COUNT(*) FROM documents) * 1.0 / (SELECT COUNT(*) FROM students WHERE LOWER(status::text) IN ('active', 'actif'))
    ELSE 0 
  END as documents_per_student,
  
  CASE 
    WHEN (SELECT COUNT(*) FROM documents) > 0 
    THEN (SELECT COUNT(*) FROM documents WHERE validation_state = 'valid') * 100.0 / (SELECT COUNT(*) FROM documents)
    ELSE 0 
  END as validation_rate,
  
  CURRENT_TIMESTAMP as calculated_at,
  '{}'::jsonb as extra_data
ON CONFLICT (metric_date) DO UPDATE SET
  total_students = EXCLUDED.total_students,
  active_students = EXCLUDED.active_students,
  male_students = EXCLUDED.male_students,
  female_students = EXCLUDED.female_students,
  total_documents = EXCLUDED.total_documents,
  pending_documents = EXCLUDED.pending_documents,
  validated_documents = EXCLUDED.validated_documents,
  total_classes = EXCLUDED.total_classes,
  average_class_occupancy = EXCLUDED.average_class_occupancy,
  total_teachers = EXCLUDED.total_teachers,
  documents_per_student = EXCLUDED.documents_per_student,
  validation_rate = EXCLUDED.validation_rate,
  calculated_at = EXCLUDED.calculated_at;

-- 2. Update all student document counts
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

-- 3. Update all document sync status
UPDATE documents 
SET sync_status = 'synced',
    last_synced_at = CURRENT_TIMESTAMP
WHERE sync_status IS NULL OR sync_status = 'pending' OR sync_status = 'synced';

COMMIT;
