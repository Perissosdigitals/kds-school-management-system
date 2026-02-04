#!/bin/bash
# debug-db.sh

echo "🔍 INSPECTING RAW ATTENDANCE DATA"
echo "================================="

# Get the first class ID (likely CP1 based on screenshots)
CLASS_ID=$(docker exec kds-postgres psql -U kds_admin -d kds_school_db -t -c "SELECT id FROM classes LIMIT 1;" | xargs)

echo "Target Class ID: $CLASS_ID"
echo "Target Date: 2026-01-22"
echo ""

echo "📋 raw rows in 'attendance' table for this class/date:"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    id, 
    student_id, 
    date, 
    period, 
    status, 
    created_at, 
    updated_at 
FROM attendance 
WHERE class_id = '$CLASS_ID' 
AND date = '2026-01-22';
"

echo ""
echo "running period variance check:"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT DISTINCT period FROM attendance;
"
