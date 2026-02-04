#!/bin/bash
# debug-attendance-class-mismatch.sh
# Identifies which class actually contains the attendance records

echo "🔍 ATTENDANCE CLASS ID INVESTIGATION"
echo "======================================"
echo ""

echo "📊 Step 1: All classes in the system"
echo "-------------------------------------"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT id, name, level 
FROM classes 
ORDER BY name;
"

echo ""
echo "📊 Step 2: Attendance record count by class for 2026-01-22"
echo "-----------------------------------------------------------"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    c.name AS class_name,
    c.level AS class_level,
    a.class_id,
    a.period,
    COUNT(*) as record_count
FROM attendance a
LEFT JOIN classes c ON a.class_id = c.id
WHERE a.date = '2026-01-22'
GROUP BY c.name, c.level, a.class_id, a.period
ORDER BY record_count DESC;
"

echo ""
echo "📊 Step 3: The 25 morning records - which class do they belong to?"
echo "-------------------------------------------------------------------"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    c.id AS class_id,
    c.name AS class_name,
    c.level AS class_level,
    COUNT(a.id) as attendance_count
FROM attendance a
JOIN classes c ON a.class_id = c.id
WHERE a.date = '2026-01-22' 
  AND a.period = 'morning'
GROUP BY c.id, c.name, c.level;
"

echo ""
echo "📊 Step 4: Sample records from the 25-record batch"
echo "----------------------------------------------------"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    a.id,
    c.name AS class_name,
    s.last_name AS student,
    a.date,
    a.period,
    a.status
FROM attendance a
JOIN classes c ON a.class_id = c.id
JOIN students s ON a.student_id = s.id
WHERE a.date = '2026-01-22' 
  AND a.period = 'morning'
LIMIT 5;
"

echo ""
echo "📊 Step 5: Check for NULL period records (potential issue)"
echo "------------------------------------------------------------"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    c.name AS class_name,
    COUNT(*) as null_period_count
FROM attendance a
LEFT JOIN classes c ON a.class_id = c.id
WHERE a.period IS NULL OR a.period = ''
GROUP BY c.name;
"

echo ""
echo "✅ Investigation complete!"
echo ""
echo "💡 Next steps:"
echo "  1. Compare the class_id from Step 3 with the classId shown in the browser's diagnostic panel"
echo "  2. If they don't match, the frontend is querying the wrong class"
echo "  3. Check the browser DevTools Network tab for the actual GET request parameters"
