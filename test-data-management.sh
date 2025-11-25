#!/bin/bash
# Test Data Management Endpoints
# Backend doit tourner sur http://localhost:3000

BASE_URL="http://localhost:3001/api/v1"
echo "🧪 Test des endpoints Data Management"
echo "======================================"
echo ""

# Test 1: Health check
echo "1️⃣ Health check backend..."
HEALTH=$(curl -s "$BASE_URL/health" 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "✅ Backend accessible"
else
  echo "❌ Backend non accessible"
  exit 1
fi
echo ""

# Test 2: Export Grades CSV
echo "2️⃣ Test Export Grades (CSV)..."
curl -s "$BASE_URL/data/export/grades?academicYear=2024-2025&format=csv" \
  -H "Accept: text/csv" \
  -o /tmp/kds-grades-export.csv 2>/dev/null

if [ -f /tmp/kds-grades-export.csv ]; then
  LINES=$(wc -l < /tmp/kds-grades-export.csv)
  echo "✅ Export CSV créé: $LINES lignes"
  echo "Aperçu:"
  head -3 /tmp/kds-grades-export.csv
else
  echo "❌ Export CSV échoué"
fi
echo ""

# Test 3: Export Grades Excel
echo "3️⃣ Test Export Grades (Excel)..."
curl -s "$BASE_URL/data/export/grades?academicYear=2024-2025&format=excel" \
  -H "Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  -o /tmp/kds-grades-export.xlsx 2>/dev/null

if [ -f /tmp/kds-grades-export.xlsx ]; then
  SIZE=$(wc -c < /tmp/kds-grades-export.xlsx)
  echo "✅ Export Excel créé: $SIZE bytes"
  file /tmp/kds-grades-export.xlsx
else
  echo "❌ Export Excel échoué"
fi
echo ""

# Test 4: Export Students
echo "4️⃣ Test Export Students (Excel)..."
curl -s "$BASE_URL/data/export/students?academicYear=2024-2025" \
  -H "Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  -o /tmp/kds-students-export.xlsx 2>/dev/null

if [ -f /tmp/kds-students-export.xlsx ]; then
  SIZE=$(wc -c < /tmp/kds-students-export.xlsx)
  echo "✅ Export Students créé: $SIZE bytes"
else
  echo "❌ Export Students échoué"
fi
echo ""

# Test 5: Export Attendance
echo "5️⃣ Test Export Attendance (Excel)..."
curl -s "$BASE_URL/data/export/attendance?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  -o /tmp/kds-attendance-export.xlsx 2>/dev/null

if [ -f /tmp/kds-attendance-export.xlsx ]; then
  SIZE=$(wc -c < /tmp/kds-attendance-export.xlsx)
  echo "✅ Export Attendance créé: $SIZE bytes"
else
  echo "❌ Export Attendance échoué"
fi
echo ""

# Test 6: Export All Data
echo "6️⃣ Test Export All Data..."
curl -s "$BASE_URL/data/export/all?academicYear=2024-2025" \
  -H "Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  -o /tmp/kds-all-export.xlsx 2>/dev/null

if [ -f /tmp/kds-all-export.xlsx ]; then
  SIZE=$(wc -c < /tmp/kds-all-export.xlsx)
  echo "✅ Export All Data créé: $SIZE bytes"
else
  echo "❌ Export All Data échoué"
fi
echo ""

echo "======================================"
echo "✅ Tests terminés"
echo ""
echo "📁 Fichiers exportés dans /tmp:"
ls -lh /tmp/kds-*.{csv,xlsx} 2>/dev/null | awk '{print $9, $5}'
