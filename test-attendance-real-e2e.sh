#!/bin/bash

# Configuration
API_URL="http://localhost:3002/api/v1"
ADMIN_EMAIL="admin@ksp-school.ci"
ADMIN_PASSWORD="admin123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting Attendance E2E Verification...${NC}"

# 1. Login
echo -n "🔑 logging in... "
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}FAILED${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi
echo -e "${GREEN}OK${NC}"

# 2. Get a Class
echo -n "🏫 Getting classes... "
CLASSES_RESPONSE=$(curl -s -X GET "${API_URL}/classes" \
  -H "Authorization: Bearer ${TOKEN}")

# Extract first ID (assuming response structure { data: [...] })
CLASS_ID=$(echo $CLASSES_RESPONSE | jq -r '.data[0].id')
# Fallback if structure is just array
if [ "$CLASS_ID" == "null" ]; then
  CLASS_ID=$(echo $CLASSES_RESPONSE | jq -r '.[0].id')
fi

if [ -z "$CLASS_ID" ] || [ "$CLASS_ID" == "null" ]; then
    echo -e "${RED}FAILED - No classes found${NC}"
    echo "Response: $CLASSES_RESPONSE"
    exit 1
fi
echo -e "${GREEN}OK (Class ID: $CLASS_ID)${NC}"

# 3. Get a Student from that class
echo -n "👨‍🎓 Getting students for class... "
STUDENTS_RESPONSE=$(curl -s -X GET "${API_URL}/classes/${CLASS_ID}/students" \
  -H "Authorization: Bearer ${TOKEN}")

STUDENT_ID=$(echo $STUDENTS_RESPONSE | jq -r '.[0].id')

if [ -z "$STUDENT_ID" ] || [ "$STUDENT_ID" == "null" ]; then
    echo -e "${RED}FAILED - No students in class${NC}"
    echo "Response: $STUDENTS_RESPONSE"
    exit 1
fi
echo -e "${GREEN}OK (Student ID: $STUDENT_ID)${NC}"

# 4. Record Attendance (CREATE)
# This simulates exactly what the frontend sends now (Array of objects)
TODAY=$(date +%Y-%m-%d)
echo -n "📝 Recording attendance (ABSENT) for Today ($TODAY)... "

# Payload: Array of objects
PAYLOAD="[{\"studentId\":\"${STUDENT_ID}\",\"classId\":\"${CLASS_ID}\",\"date\":\"${TODAY}\",\"status\":\"absent\",\"recordedBy\":\"${STUDENT_ID}\"}]"

CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/attendance/bulk" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Check if response contains the ID of the created record
CREATED_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$CREATED_ID" ]; then 
    echo -e "${RED}FAILED${NC}"
    echo "Response: $CREATE_RESPONSE"
    # Try sending as object {records: [...]} just to see if the OLD way was actually working on the backend?
    # No, we want to verify the NEW way.
else
    echo -e "${GREEN}OK${NC}"
fi

# 5. Verify Persistence (READ)
echo -n "🔍 Verifying persistence... "
GET_RESPONSE=$(curl -s -X GET "${API_URL}/attendance/daily/${CLASS_ID}?date=${TODAY}" \
  -H "Authorization: Bearer ${TOKEN}")

# Filter for our specific student
STATUS=$(echo $GET_RESPONSE | jq -r ".[] | select(.studentId == \"${STUDENT_ID}\") | .status")

if [ "$STATUS" == "absent" ]; then
    echo -e "${GREEN}SUCCESS! Data persisted correctly.${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Expected: absent"
    echo "Actual: $STATUS"
    # echo "Full Response: $GET_RESPONSE" # Too noisy
fi
