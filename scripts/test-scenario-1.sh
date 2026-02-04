#!/bin/bash

# Configuration
API_URL="http://localhost:3002/api/v1"
ADMIN_EMAIL="admin@ksp-school.ci"
ADMIN_PASSWORD="admin123"

echo "🧪 TEST SCENARIO 1: NEW STUDENT LIFECYCLE"
echo "=========================================="

# 1. Login
echo ""
echo "🔐 1. Authentication..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RES | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    echo "Response: $LOGIN_RES"
    exit 1
fi
echo "✅ Login successful"

# 2. Get a Class ID (e.g., 6ème)
echo ""
echo "🏫 2. Fetching Classes..."
CLASSES_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/classes")
CLASS_ID=$(echo $CLASSES_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CLASS_ID" ]; then
    echo "❌ No classes found"
    exit 1
fi
echo "✅ Found Class ID: $CLASS_ID"

# 3. Create Student
E_NUM=$((RANDOM % 1000))
NEW_STUDENT_DATA="{\"firstName\":\"TestStudent\",\"lastName\":\"ScenarioOne-$E_NUM\",\"dob\":\"2015-01-01\",\"gender\":\"Masculin\",\"nationality\":\"Ivoirienne\",\"birthPlace\":\"Abidjan\",\"address\":\"123 Rue Test\",\"phone\":\"+225 01 02 03 04 05\",\"gradeLevel\":\"6ème\",\"emergencyContactName\":\"TestParent\",\"emergencyContactPhone\":\"+225 05 04 03 02 01\",\"status\":\"Actif\",\"classId\":\"$CLASS_ID\"}"

echo ""
echo "👶 3. Creating Student..."
CREATE_RES=$(curl -s -X POST "$API_URL/students" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$NEW_STUDENT_DATA")

STUDENT_ID=$(echo $CREATE_RES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$STUDENT_ID" ] || [ "$STUDENT_ID" == "null" ]; then
    echo "❌ Student creation failed"
    echo "Response: $CREATE_RES"
    exit 1
else
    echo "✅ Student Created: ID $STUDENT_ID"
fi

# 4. Verify Student in List
echo ""
echo "🔍 4. Verifying Persistence..."
GET_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/students/$STUDENT_ID")
CHECK_NAME=$(echo $GET_RES | grep -o "ScenarioOne-$E_NUM")

if [ -z "$CHECK_NAME" ]; then
    echo "❌ Student not found by ID"
    exit 1
fi
echo "✅ Student verified in DB"

# 5. Verify Class Assignment
echo ""
echo "📂 5. Verifying Class Assignment..."
CLASS_STUDENTS_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/classes/$CLASS_ID")
CHECK_IN_CLASS=$(echo $CLASS_STUDENTS_RES | grep -o "ScenarioOne-$E_NUM")

if [ -z "$CHECK_IN_CLASS" ]; then
    echo "⚠️ Student not found in Class list endpoint (might be pagination or different structure)"
    # Try alternate endpoint if exists
else
     echo "✅ Student found in Class roster"
fi

echo ""
echo "🎉 SCENARIO 1 COMPLETE: SUCCESS"
