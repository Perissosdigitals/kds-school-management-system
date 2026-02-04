#!/bin/bash

# Configuration
API_URL="http://localhost:3002/api/v1"
ADMIN_EMAIL="admin@ksp-school.ci"
ADMIN_PASSWORD="admin123"

echo "🧪 TEST SCENARIO 3: GRADE ENTRY & CALCULATION"
echo "=============================================="

# 1. Login
echo ""
echo "🔐 1. Authentication..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RES | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    exit 1
fi
echo "✅ Login successful"

# 2. Get Student, Subject, and Teacher
echo ""
echo "📚 2. Fetching Student, Subject, and Teacher..."

STUDENTS_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/students?limit=1")
STUDENT_ID=$(echo $STUDENTS_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

SUBJECTS_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/subjects")
SUBJECT_ID=$(echo $SUBJECTS_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

TEACHERS_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/teachers")
TEACHER_ID=$(echo $TEACHERS_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$STUDENT_ID" ] || [ -z "$SUBJECT_ID" ] || [ -z "$TEACHER_ID" ]; then
    echo "❌ Missing required entities"
    exit 1
fi

echo "✅ Student: $STUDENT_ID, Subject: $SUBJECT_ID, Teacher: $TEACHER_ID"

# 3. Create Grade
echo ""
echo "📝 3. Creating Grade (15/20)..."

GRADE_DATA="{\"studentId\":\"$STUDENT_ID\",\"subjectId\":\"$SUBJECT_ID\",\"teacherId\":\"$TEACHER_ID\",\"evaluationType\":\"Devoir\",\"value\":15,\"maxValue\":20,\"evaluationDate\":\"2026-02-02\",\"comments\":\"Bon travail\",\"trimester\":\"Premier trimestre\",\"academicYear\":\"2025-2026\",\"visibleToParents\":true}"

CREATE_GRADE_RES=$(curl -s -X POST "$API_URL/grades" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$GRADE_DATA")

GRADE_ID=$(echo $CREATE_GRADE_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$GRADE_ID" ] || [ "$GRADE_ID" == "null" ]; then
    echo "⚠️  Grade creation response: $CREATE_GRADE_RES"
    exit 1
fi

echo "✅ Grade created: $GRADE_ID (15/20)"

# 4. Verify Grade Retrieval
echo ""
echo "🔍 4. Verifying Grade Persistence..."

GET_GRADE_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/grades?studentId=$STUDENT_ID")
CHECK_VALUE=$(echo $GET_GRADE_RES | grep -o '"value":15')

if [ -z "$CHECK_VALUE" ]; then
    echo "❌ Grade not found or value incorrect"
    exit 1
fi

echo "✅ Grade verified (value: 15)"

echo ""
echo "🎉 SCENARIO 3 COMPLETE: SUCCESS"
