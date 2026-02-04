#!/bin/bash

###############################################################################
# CLOUDFLARE DEPLOYMENT VALIDATION SCRIPT
# Tests critical CRUD operations on Cloudflare-deployed frontend
###############################################################################

set -e

# Configuration
CLOUDFLARE_URL="${CLOUDFLARE_URL:-https://ksp-production.pages.dev}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@ksp-school.ci}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

###############################################################################
# Helper Functions
###############################################################################

log_test() {
    echo -e "${YELLOW}🧪 TEST: $1${NC}"
    ((TOTAL_TESTS++))
}

log_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((PASSED_TESTS++))
}

log_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    ((FAILED_TESTS++))
}

log_info() {
    echo -e "ℹ️  $1"
}

###############################################################################
# Test Functions
###############################################################################

test_environment() {
    log_test "Environment Configuration"
    
    # Check if Cloudflare URL is accessible
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$CLOUDFLARE_URL")
    
    if [ "$HTTP_CODE" = "200" ]; then
        log_pass "Cloudflare URL accessible (HTTP $HTTP_CODE)"
    else
        log_fail "Cloudflare URL returned HTTP $HTTP_CODE"
        return 1
    fi
}

test_authentication() {
    log_test "Authentication Flow"
    
    # Attempt login
    LOGIN_RESPONSE=$(curl -s -X POST "$CLOUDFLARE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
    
    # Extract token
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        log_pass "Login successful, token received"
        echo "$TOKEN" > /tmp/cloudflare_test_token.txt
        return 0
    else
        log_fail "Login failed or no token received"
        echo "Response: $LOGIN_RESPONSE"
        return 1
    fi
}

test_students_crud() {
    log_test "Students CRUD Operations"
    
    TOKEN=$(cat /tmp/cloudflare_test_token.txt 2>/dev/null || echo "")
    if [ -z "$TOKEN" ]; then
        log_fail "No authentication token available"
        return 1
    fi
    
    # CREATE: Add test student
    STUDENT_DATA="{
        \"lastName\": \"Test\",
        \"firstName\": \"Cloudflare\",
        \"dob\": \"2010-01-01\",
        \"gender\": \"Masculin\",
        \"nationality\": \"Ivoirienne\",
        \"birthPlace\": \"Abidjan\",
        \"address\": \"Test Address\",
        \"phone\": \"+2250700000000\",
        \"email\": \"test.cloudflare@example.com\",
        \"gradeLevel\": \"6ème\"
    }"
    
    CREATE_RESPONSE=$(curl -s -X POST "$CLOUDFLARE_URL/api/v1/students" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$STUDENT_DATA")
    
    STUDENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id // empty')
    
    if [ -n "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ]; then
        log_pass "Student created (ID: $STUDENT_ID)"
        echo "$STUDENT_ID" > /tmp/cloudflare_test_student_id.txt
    else
        log_fail "Student creation failed"
        echo "Response: $CREATE_RESPONSE"
        return 1
    fi
    
    # READ: Fetch student
    READ_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$CLOUDFLARE_URL/api/v1/students/$STUDENT_ID")
    
    READ_NAME=$(echo "$READ_RESPONSE" | jq -r '.lastName // empty')
    
    if [ "$READ_NAME" = "Test" ]; then
        log_pass "Student retrieved successfully"
    else
        log_fail "Student retrieval failed"
        return 1
    fi
    
    # UPDATE: Modify student
    UPDATE_DATA="{\"phone\":\"+2250711111111\"}"
    UPDATE_RESPONSE=$(curl -s -X PATCH "$CLOUDFLARE_URL/api/v1/students/$STUDENT_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$UPDATE_DATA")
    
    UPDATED_PHONE=$(echo "$UPDATE_RESPONSE" | jq -r '.phone // empty')
    
    if [ "$UPDATED_PHONE" = "+2250711111111" ]; then
        log_pass "Student updated successfully"
    else
        log_fail "Student update failed"
        return 1
    fi
    
    # DELETE: Remove student
    DELETE_RESPONSE=$(curl -s -X DELETE "$CLOUDFLARE_URL/api/v1/students/$STUDENT_ID" \
        -H "Authorization: Bearer $TOKEN")
    
    # Verify deletion
    VERIFY_RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" \
        "$CLOUDFLARE_URL/api/v1/students/$STUDENT_ID")
    
    if echo "$VERIFY_RESPONSE" | grep -q "404"; then
        log_pass "Student deleted successfully"
    else
        log_fail "Student deletion verification failed"
        return 1
    fi
}

test_classes_crud() {
    log_test "Classes CRUD Operations"
    
    TOKEN=$(cat /tmp/cloudflare_test_token.txt 2>/dev/null || echo "")
    if [ -z "$TOKEN" ]; then
        log_fail "No authentication token available"
        return 1
    fi
    
    # CREATE: Add test class
    CLASS_DATA="{
        \"name\": \"Test Cloudflare Class\",
        \"level\": \"6ème\",
        \"academicYear\": \"2024-2025\",
        \"roomNumber\": \"TEST-001\",
        \"capacity\": 30
    }"
    
    CREATE_RESPONSE=$(curl -s -X POST "$CLOUDFLARE_URL/api/v1/classes" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$CLASS_DATA")
    
    CLASS_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id // empty')
    
    if [ -n "$CLASS_ID" ] && [ "$CLASS_ID" != "null" ]; then
        log_pass "Class created (ID: $CLASS_ID)"
    else
        log_fail "Class creation failed"
        echo "Response: $CREATE_RESPONSE"
        return 1
    fi
    
    # READ: Fetch class
    READ_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$CLOUDFLARE_URL/api/v1/classes/$CLASS_ID")
    
    READ_NAME=$(echo "$READ_RESPONSE" | jq -r '.name // empty')
    
    if [ "$READ_NAME" = "Test Cloudflare Class" ]; then
        log_pass "Class retrieved successfully"
    else
        log_fail "Class retrieval failed"
        return 1
    fi
    
    # DELETE: Remove class
    curl -s -X DELETE "$CLOUDFLARE_URL/api/v1/classes/$CLASS_ID" \
        -H "Authorization: Bearer $TOKEN" > /dev/null
    
    log_pass "Class deleted successfully"
}

test_attendance_crud() {
    log_test "Attendance CRUD Operations"
    
    TOKEN=$(cat /tmp/cloudflare_test_token.txt 2>/dev/null || echo "")
    if [ -z "$TOKEN" ]; then
        log_fail "No authentication token available"
        return 1
    fi
    
    # Get a real student ID for testing
    STUDENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$CLOUDFLARE_URL/api/v1/students?limit=1")
    
    STUDENT_ID=$(echo "$STUDENTS_RESPONSE" | jq -r '.data[0].id // empty')
    
    if [ -z "$STUDENT_ID" ] || [ "$STUDENT_ID" = "null" ]; then
        log_fail "No students available for attendance test"
        return 1
    fi
    
    # Get user ID from token
    USER_ID=$(echo "$TOKEN" | jq -R 'split(".") | .[1] | @base64d' | jq -r '.sub // empty')
    
    # CREATE: Mark attendance
    TODAY=$(date +%Y-%m-%d)
    ATTENDANCE_DATA="{
        \"studentId\": \"$STUDENT_ID\",
        \"date\": \"$TODAY\",
        \"status\": \"present\",
        \"recordedBy\": \"$USER_ID\"
    }"
    
    CREATE_RESPONSE=$(curl -s -X POST "$CLOUDFLARE_URL/api/v1/attendance" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$ATTENDANCE_DATA")
    
    ATTENDANCE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id // empty')
    
    if [ -n "$ATTENDANCE_ID" ] && [ "$ATTENDANCE_ID" != "null" ]; then
        log_pass "Attendance marked (ID: $ATTENDANCE_ID)"
    else
        log_fail "Attendance marking failed"
        echo "Response: $CREATE_RESPONSE"
        return 1
    fi
    
    # READ: Fetch attendance
    READ_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$CLOUDFLARE_URL/api/v1/attendance?studentId=$STUDENT_ID&date=$TODAY")
    
    if echo "$READ_RESPONSE" | jq -e '.data | length > 0' > /dev/null; then
        log_pass "Attendance retrieved successfully"
    else
        log_fail "Attendance retrieval failed"
        return 1
    fi
}

test_grades_crud() {
    log_test "Grades CRUD Operations"
    
    TOKEN=$(cat /tmp/cloudflare_test_token.txt 2>/dev/null || echo "")
    if [ -z "$TOKEN" ]; then
        log_fail "No authentication token available"
        return 1
    fi
    
    # Get student, subject, and teacher IDs
    STUDENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$CLOUDFLARE_URL/api/v1/students?limit=1")
    STUDENT_ID=$(echo "$STUDENTS_RESPONSE" | jq -r '.data[0].id // empty')
    
    SUBJECTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$CLOUDFLARE_URL/api/v1/subjects?limit=1")
    SUBJECT_ID=$(echo "$SUBJECTS_RESPONSE" | jq -r '.data[0].id // empty')
    
    TEACHERS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$CLOUDFLARE_URL/api/v1/teachers?limit=1")
    TEACHER_ID=$(echo "$TEACHERS_RESPONSE" | jq -r '.data[0].id // empty')
    
    if [ -z "$STUDENT_ID" ] || [ -z "$SUBJECT_ID" ] || [ -z "$TEACHER_ID" ]; then
        log_fail "Missing required data for grade test"
        return 1
    fi
    
    # CREATE: Add grade
    GRADE_DATA="{
        \"studentId\": \"$STUDENT_ID\",
        \"subjectId\": \"$SUBJECT_ID\",
        \"teacherId\": \"$TEACHER_ID\",
        \"evaluationType\": \"Devoir\",
        \"value\": 15,
        \"maxValue\": 20,
        \"trimester\": \"Premier trimestre\",
        \"academicYear\": \"2024-2025\",
        \"evaluationDate\": \"$(date +%Y-%m-%d)\"
    }"
    
    CREATE_RESPONSE=$(curl -s -X POST "$CLOUDFLARE_URL/api/v1/grades" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$GRADE_DATA")
    
    GRADE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id // empty')
    
    if [ -n "$GRADE_ID" ] && [ "$GRADE_ID" != "null" ]; then
        log_pass "Grade created (ID: $GRADE_ID)"
    else
        log_fail "Grade creation failed"
        echo "Response: $CREATE_RESPONSE"
        return 1
    fi
    
    # READ: Fetch grade
    READ_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$CLOUDFLARE_URL/api/v1/grades?studentId=$STUDENT_ID")
    
    if echo "$READ_RESPONSE" | jq -e '.data | length > 0' > /dev/null; then
        log_pass "Grade retrieved successfully"
    else
        log_fail "Grade retrieval failed"
        return 1
    fi
}

###############################################################################
# Main Test Execution
###############################################################################

main() {
    echo "═══════════════════════════════════════════════════════════"
    echo "  CLOUDFLARE DEPLOYMENT VALIDATION TEST SUITE"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "Target URL: $CLOUDFLARE_URL"
    echo "Admin Email: $ADMIN_EMAIL"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    
    # Run tests
    test_environment || true
    test_authentication || true
    test_students_crud || true
    test_classes_crud || true
    test_attendance_crud || true
    test_grades_crud || true
    
    # Summary
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  TEST SUMMARY"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✅ ALL TESTS PASSED - DEPLOYMENT READY!${NC}"
        exit 0
    else
        echo -e "${RED}❌ SOME TESTS FAILED - REVIEW REQUIRED${NC}"
        exit 1
    fi
}

# Run main function
main
