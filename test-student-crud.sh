#!/bin/bash

# Student CRUD Operations Test Script
# Run this to verify all student CRUD operations are working

echo "=================================================="
echo "STUDENT CRUD OPERATIONS TEST"
echo "Date: $(date)"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3002/api/v1"

# Test 1: LIST Students
echo -e "${YELLOW}Test 1: LIST Students${NC}"
response=$(curl -s "${API_BASE}/students?limit=3")
count=$(echo "$response" | jq '. | length')
if [ "$count" -ge "1" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Retrieved $count students"
  echo "$response" | jq '.[0] | {id, firstName, lastName, registrationNumber}'
else
  echo -e "${RED}❌ FAIL${NC} - No students found"
fi
echo ""

# Test 2: GET Single Student
echo -e "${YELLOW}Test 2: GET Single Student${NC}"
student_id=$(echo "$response" | jq -r '.[0].id')
single=$(curl -s "${API_BASE}/students/${student_id}")
firstName=$(echo "$single" | jq -r '.firstName')
if [ -n "$firstName" ] && [ "$firstName" != "null" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Retrieved student: $firstName"
  echo "$single" | jq '{id, firstName, lastName, email, phone, class: .class.name}'
else
  echo -e "${RED}❌ FAIL${NC} - Failed to retrieve student"
fi
echo ""

# Test 3: COUNT Students
echo -e "${YELLOW}Test 3: COUNT Students${NC}"
count_response=$(curl -s "${API_BASE}/students/stats/count")
total=$(echo "$count_response" | jq -r '.count')
if [ "$total" -ge "1" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Total students: $total"
else
  echo -e "${RED}❌ FAIL${NC} - Count endpoint failed"
fi
echo ""

# Test 4: CREATE Student
echo -e "${YELLOW}Test 4: CREATE Student${NC}"
create_payload='{
  "firstName": "TestCRUD",
  "lastName": "Verification",
  "dob": "2020-03-15",
  "gender": "Masculin",
  "nationality": "Ivoirienne",
  "birthPlace": "Abidjan",
  "address": "Test CRUD Address",
  "phone": "+2250799000001",
  "email": "testcrud@kds.ci",
  "gradeLevel": "Maternelle",
  "emergencyContactName": "Parent CRUD",
  "emergencyContactPhone": "+2250799000002",
  "status": "Actif",
  "classId": "50000000-0000-0000-0000-000000000001"
}'
create_response=$(curl -s -X POST "${API_BASE}/students" \
  -H "Content-Type: application/json" \
  -d "$create_payload")

created_id=$(echo "$create_response" | jq -r '.id')
if [ -n "$created_id" ] && [ "$created_id" != "null" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Created student with ID: $created_id"
  echo "$create_response" | jq '{id, firstName, lastName, registrationNumber, status}'
else
  echo -e "${RED}❌ FAIL${NC} - Failed to create student"
  echo "$create_response"
fi
echo ""

# Test 5: UPDATE Student
if [ -n "$created_id" ] && [ "$created_id" != "null" ]; then
  echo -e "${YELLOW}Test 5: UPDATE Student${NC}"
  update_payload='{
    "lastName": "Verification Updated",
    "phone": "+2250799000099",
    "address": "Updated CRUD Address"
  }'
  update_response=$(curl -s -X PUT "${API_BASE}/students/${created_id}" \
    -H "Content-Type: application/json" \
    -d "$update_payload")
  
  updated_phone=$(echo "$update_response" | jq -r '.phone')
  if [ "$updated_phone" = "+2250799000099" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Updated student successfully"
    echo "$update_response" | jq '{id, firstName, lastName, phone, address}'
  else
    echo -e "${RED}❌ FAIL${NC} - Failed to update student"
    echo "$update_response"
  fi
  echo ""

  # Test 6: DELETE Student
  echo -e "${YELLOW}Test 6: DELETE Student${NC}"
  delete_response=$(curl -s -X DELETE "${API_BASE}/students/${created_id}" -w "%{http_code}")
  if [ "$delete_response" = "204" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Deleted student successfully (HTTP 204)"
  else
    echo -e "${RED}❌ FAIL${NC} - Failed to delete student (HTTP $delete_response)"
  fi
  echo ""
else
  echo -e "${YELLOW}Skipping UPDATE and DELETE tests (no student created)${NC}"
  echo ""
fi

# Test 7: Search Students
echo -e "${YELLOW}Test 7: SEARCH Students${NC}"
search_response=$(curl -s "${API_BASE}/students?search=Aya&limit=5")
search_count=$(echo "$search_response" | jq '. | length')
if [ "$search_count" -ge "1" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Found $search_count students matching 'Aya'"
  echo "$search_response" | jq '.[0] | {firstName, lastName, email}'
else
  echo -e "${RED}❌ FAIL${NC} - Search returned no results"
fi
echo ""

# Test 8: Filter by Grade Level
echo -e "${YELLOW}Test 8: FILTER by Grade Level${NC}"
filter_response=$(curl -s "${API_BASE}/students?gradeLevel=Maternelle&limit=5")
filter_count=$(echo "$filter_response" | jq '. | length')
if [ "$filter_count" -ge "1" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Found $filter_count Maternelle students"
  echo "$filter_response" | jq '.[0] | {firstName, lastName, gradeLevel}'
else
  echo -e "${RED}❌ FAIL${NC} - Filter returned no results"
fi
echo ""

# Test 9: Filter by Status
echo -e "${YELLOW}Test 9: FILTER by Status${NC}"
status_response=$(curl -s "${API_BASE}/students?status=Actif&limit=5")
status_count=$(echo "$status_response" | jq '. | length')
if [ "$status_count" -ge "1" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Found $status_count Actif students"
  echo "$status_response" | jq '.[0] | {firstName, lastName, status}'
else
  echo -e "${RED}❌ FAIL${NC} - Status filter returned no results"
fi
echo ""

# Test 10: Statistics by Grade
echo -e "${YELLOW}Test 10: STATISTICS by Grade${NC}"
stats_response=$(curl -s "${API_BASE}/students/stats/by-grade")
stats_count=$(echo "$stats_response" | jq '. | length')
if [ "$stats_count" -ge "1" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Retrieved statistics for $stats_count grade levels"
  echo "$stats_response" | jq '.'
else
  echo -e "${RED}❌ FAIL${NC} - Stats endpoint failed"
fi
echo ""

echo "=================================================="
echo "TEST SUMMARY"
echo "=================================================="
echo "All backend CRUD operations should be passing ✅"
echo ""
echo "If frontend update is failing:"
echo "1. Check browser console for errors"
echo "2. Check Network tab for API calls"
echo "3. Verify /api/v1/students/:id is being called"
echo "4. Clear browser cache and reload"
echo ""
echo "Berakhot ve-Shalom! 🙏"
