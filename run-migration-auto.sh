#!/bin/bash
# run-migration-auto.sh
# Non-interactive version of the migration for automated execution

echo "🔧 MIGRATING NULL PERIOD RECORDS (AUTO MODE)"
echo "============================================="
echo ""

echo "📊 Step 1: Count NULL period records before migration"
echo "-------------------------------------------------------"
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
echo "🔄 Step 2: Updating NULL period records to 'morning'"
echo "-----------------------------------------------------"
RESULT=$(docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
UPDATE attendance 
SET period = 'morning',
    updated_at = NOW()
WHERE period IS NULL OR period = '';
" | grep UPDATE)

echo "$RESULT"

echo ""
echo "✅ Step 3: Verify migration completed"
echo "--------------------------------------"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT 
    c.name AS class_name,
    a.period,
    COUNT(*) as record_count
FROM attendance a
LEFT JOIN classes c ON a.class_id = c.id
WHERE a.date = '2026-01-22'
GROUP BY c.name, a.period
ORDER BY c.name, a.period;
"

echo ""
echo "🔍 Step 4: Verify no NULL period records remain"
echo "------------------------------------------------"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
SELECT COUNT(*) as remaining_null_count
FROM attendance
WHERE period IS NULL OR period = '';
"

echo ""
echo "✅ Migration complete!"
