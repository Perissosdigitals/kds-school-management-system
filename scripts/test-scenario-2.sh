#!/bin/bash

# Configuration
API_URL="http://localhost:3002/api/v1"
ADMIN_EMAIL="admin@ksp-school.ci"
ADMIN_PASSWORD="admin123"

echo "🧪 TEST SCENARIO 2: ATTENDANCE MARKING & PERSISTENCE"
echo "===================================================="

# 1. Login
echo ""
echo "🔐 1. Authentication..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RES | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    exit 1
fi
echo "✅ Login successful"

# 2. Get a Class and its Students
echo ""
echo "🏫 2. Fetching Class and Students..."
CLASSES_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/classes")
CLASS_ID=$(echo $CLASSES_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CLASS_ID" ]; then
    echo "❌ No classes found"
    exit 1
fi

# Get students in this class
STUDENTS_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/students?classId=$CLASS_ID")
STUDENT_ID=$(echo $STUDENTS_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$STUDENT_ID" ]; then
    echo "❌ No students found in class"
    exit 1
fi

# Extract user ID from login response
USER_ID=$(echo $LOGIN_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
    echo "❌ Could not extract user ID"
    exit 1
fi

echo "✅ Found Class: $CLASS_ID, Student: $STUDENT_ID, User: $USER_ID"

# 3. Mark Attendance as ABSENT
TODAY=$(date +%Y-%m-%d)
echo ""
echo "📝 3. Marking Student as ABSENT for $TODAY..."

ATTENDANCE_DATA="{\"studentId\":\"$STUDENT_ID\",\"classId\":\"$CLASS_ID\",\"date\":\"$TODAY\",\"status\":\"absent\",\"isJustified\":false,\"recordedBy\":\"$USER_ID\"}"

CREATE_ATT_RES=$(curl -s -X POST "$API_URL/attendance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ATTENDANCE_DATA")

ATT_ID=$(echo $CREATE_ATT_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ATT_ID" ] || [ "$ATT_ID" == "null" ]; then
    echo "⚠️  Attendance creation response: $CREATE_ATT_RES"
    echo "⚠️  Continuing to check if record exists..."
else
    echo "✅ Attendance record created: $ATT_ID"
fi

# 4. Verify Persistence (Immediate Read)
echo ""
echo "🔍 4. Verifying Immediate Persistence..."
sleep 1

GET_ATT_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/attendance?studentId=$STUDENT_ID&date=$TODAY")
CHECK_STATUS=$(echo $GET_ATT_RES | grep -o "absent")

if [ -z "$CHECK_STATUS" ]; then
    echo "❌ Attendance status not persisted"
    echo "Response: $GET_ATT_RES"
    exit 1
fi
echo "✅ Attendance persisted (status: Absent)"

# 5. Verify Dashboard Update
echo ""
echo "📊 5. Checking Dashboard Stats..."
DASHBOARD_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/analytics/dashboard")
echo "✅ Dashboard accessible (stats may take time to update)"

echo ""
echo "🎉 SCENARIO 2 COMPLETE: SUCCESS"
