#!/bin/bash
# Cloudflare Migration Smoke Test
# Verifies production API after migration

API_URL=${1:-"https://kds-backend-api.perissos.workers.dev"}
TOKEN=${2:-""}

echo "🔍 Starting Smoke Test for KSP Production..."
echo "📍 Target URL: $API_URL"

# 1. Health Check
echo -n "1. Health Check: "
HEALTH=$(curl -s "$API_URL/api/v1/health" | jq -r '.status')
if [ "$HEALTH" == "ok" ]; then echo "✅ OK"; else echo "❌ FAILED ($HEALTH)"; fi

# 2. Database Connectivity (Debug Info)
echo -n "2. D1 Connectivity: "
DB_DEBUG=$(curl -s "$API_URL/api/v1/debug/db")
DB_STATUS=$(echo $DB_DEBUG | jq -r '.database')
if [ "$DB_STATUS" == "connected" ]; then echo "✅ Connected"; else echo "❌ FAILED"; fi

# 3. Data Integrity Check (Student Count)
echo -n "3. Student Data (96 expected): "
ST_COUNT=$(curl -s "$API_URL/api/v1/debug/db" | jq -r '.students[0].count // 0')
if [ "$ST_COUNT" -gt 0 ]; then echo "✅ Found $ST_COUNT students"; else echo "❌ NO STUDENTS FOUND"; fi

# 4. Analytics Stability
echo -n "4. Dashboard Stats: "
DASHBOARD=$(curl -s "$API_URL/api/v1/analytics/dashboard")
D_USER=$(echo $DASHBOARD | jq -r '.students.total // 0')
if [ "$D_USER" -gt 0 ]; then echo "✅ OK ($D_USER students)"; else echo "❌ DASHBOARD EMPTY"; fi

# 5. R2 Storage Check
echo -n "5. R2 Storage Access: "
STORAGE=$(curl -s -I "$API_URL/api/v1/storage/test.txt" | grep "HTTP" | awk '{print $2}')
if [ "$STORAGE" == "404" ] || [ "$STORAGE" == "200" ]; then echo "✅ OK (Service responsive)"; else echo "❌ FAILED ($STORAGE)"; fi

echo "🏁 Smoke Test Completed."
