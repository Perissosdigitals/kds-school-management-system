#!/bin/bash
# fix-null-period-records.sh
# Migrates NULL period records to 'morning' by default

echo "🔧 MIGRATING NULL PERIOD RECORDS"
echo "================================="
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
echo "⚠️  WARNING: About to migrate NULL period records to 'morning'"
echo "This will update all NULL period records to have period='morning'"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Migration cancelled"
    exit 1
fi

echo ""
echo "🔄 Step 2: Updating NULL period records to 'morning'"
echo "-----------------------------------------------------"
docker exec kds-postgres psql -U kds_admin -d kds_school_db -c "
UPDATE attendance 
SET period = 'morning',
    updated_at = NOW()
WHERE period IS NULL OR period = '';
"

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
echo "✅ Migration complete! NULL period records have been set to 'morning'"
echo ""
echo "💡 Next steps:"
echo "  1. Reload the attendance page in the browser"
echo "  2. The diagnostic panel should now show records for CE1 morning session"
echo "  3. Verify that existing data displays correctly"
