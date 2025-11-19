#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Tests CRUD - KDS School Management System
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:3001/api/v1"
TOKEN=""

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print section header
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to print test result
print_result() {
    local test_name=$1
    local status=$2
    local message=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" == "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        [ -n "$message" ] && echo -e "  ${GREEN}→${NC} $message"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗${NC} $test_name"
        [ -n "$message" ] && echo -e "  ${RED}→${NC} $message"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local test_name=$5
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "$expected_status" ]; then
        print_result "$test_name" "PASS" "Status: $http_code"
        echo "$body"
        return 0
    else
        print_result "$test_name" "FAIL" "Expected: $expected_status, Got: $http_code"
        echo "$body"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════════════════════════

print_header "🔐 AUTHENTIFICATION"

echo "Connexion en tant qu'administrateur..."
auth_response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"fondatrice@kds-school.com","password":"password123"}')

TOKEN=$(echo "$auth_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Échec de l'authentification${NC}"
    echo "Response: $auth_response"
    exit 1
else
    print_result "Authentification" "PASS" "Token obtenu"
    echo -e "${YELLOW}Token:${NC} ${TOKEN:0:30}..."
fi

# ═══════════════════════════════════════════════════════════════
# STUDENTS (ÉLÈVES)
# ═══════════════════════════════════════════════════════════════

print_header "👨‍🎓 TESTS CRUD - ÉLÈVES"

# CREATE Student
echo "Test: Création d'un élève"
student_data='{
  "firstName": "Test",
  "lastName": "Student",
  "dateOfBirth": "2010-01-15",
  "gender": "M",
  "gradeLevel": "CM2",
  "parentName": "Parent Test",
  "parentPhone": "+221701234567",
  "parentEmail": "parent.test@example.com",
  "address": "Dakar, Sénégal",
  "status": "active"
}'

create_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/students" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$student_data")

student_http_code=$(echo "$create_response" | tail -n1)
student_body=$(echo "$create_response" | sed '$d')

if [ "$student_http_code" == "201" ] || [ "$student_http_code" == "200" ]; then
    STUDENT_ID=$(echo "$student_body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    print_result "CREATE Student" "PASS" "ID: $STUDENT_ID"
else
    print_result "CREATE Student" "FAIL" "Status: $student_http_code"
    echo "$student_body"
fi

# READ Students (List)
echo ""
echo "Test: Liste des élèves"
test_endpoint "GET" "/students" "" "200" "READ Students (List)"

# READ Student (Single)
if [ -n "$STUDENT_ID" ]; then
    echo ""
    echo "Test: Récupération d'un élève"
    test_endpoint "GET" "/students/$STUDENT_ID" "" "200" "READ Student (Single)"
fi

# UPDATE Student
if [ -n "$STUDENT_ID" ]; then
    echo ""
    echo "Test: Mise à jour d'un élève"
    update_data='{"firstName":"Updated","lastName":"Student"}'
    test_endpoint "PUT" "/students/$STUDENT_ID" "$update_data" "200" "UPDATE Student"
fi

# DELETE Student
if [ -n "$STUDENT_ID" ]; then
    echo ""
    echo "Test: Suppression d'un élève"
    test_endpoint "DELETE" "/students/$STUDENT_ID" "" "200" "DELETE Student"
fi

# ═══════════════════════════════════════════════════════════════
# TEACHERS (ENSEIGNANTS)
# ═══════════════════════════════════════════════════════════════

print_header "👨‍🏫 TESTS CRUD - ENSEIGNANTS"

# CREATE Teacher
echo "Test: Création d'un enseignant"
teacher_data='{
  "firstName": "Test",
  "lastName": "Teacher",
  "email": "test.teacher@kds.edu",
  "phone": "+221701234567",
  "subject": "Mathématiques",
  "specialization": "Algèbre",
  "status": "active"
}'

create_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/teachers" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$teacher_data")

teacher_http_code=$(echo "$create_response" | tail -n1)
teacher_body=$(echo "$create_response" | sed '$d')

if [ "$teacher_http_code" == "201" ] || [ "$teacher_http_code" == "200" ]; then
    TEACHER_ID=$(echo "$teacher_body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    print_result "CREATE Teacher" "PASS" "ID: $TEACHER_ID"
else
    print_result "CREATE Teacher" "FAIL" "Status: $teacher_http_code"
fi

# READ Teachers
echo ""
echo "Test: Liste des enseignants"
test_endpoint "GET" "/teachers" "" "200" "READ Teachers (List)"

# READ Teacher (Single)
if [ -n "$TEACHER_ID" ]; then
    echo ""
    echo "Test: Récupération d'un enseignant"
    test_endpoint "GET" "/teachers/$TEACHER_ID" "" "200" "READ Teacher (Single)"
fi

# UPDATE Teacher
if [ -n "$TEACHER_ID" ]; then
    echo ""
    echo "Test: Mise à jour d'un enseignant"
    update_data='{"specialization":"Géométrie"}'
    test_endpoint "PUT" "/teachers/$TEACHER_ID" "$update_data" "200" "UPDATE Teacher"
fi

# DELETE Teacher
if [ -n "$TEACHER_ID" ]; then
    echo ""
    echo "Test: Suppression d'un enseignant"
    test_endpoint "DELETE" "/teachers/$TEACHER_ID" "" "200" "DELETE Teacher"
fi

# ═══════════════════════════════════════════════════════════════
# CLASSES
# ═══════════════════════════════════════════════════════════════

print_header "🏫 TESTS CRUD - CLASSES"

# CREATE Class
echo "Test: Création d'une classe"
class_data='{
  "name": "CM2-A",
  "level": "CM2",
  "academicYear": "2024-2025",
  "capacity": 30,
  "status": "active"
}'

create_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/classes" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$class_data")

class_http_code=$(echo "$create_response" | tail -n1)
class_body=$(echo "$create_response" | sed '$d')

if [ "$class_http_code" == "201" ] || [ "$class_http_code" == "200" ]; then
    CLASS_ID=$(echo "$class_body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    print_result "CREATE Class" "PASS" "ID: $CLASS_ID"
else
    print_result "CREATE Class" "FAIL" "Status: $class_http_code"
fi

# READ Classes
echo ""
echo "Test: Liste des classes"
test_endpoint "GET" "/classes" "" "200" "READ Classes (List)"

# READ Class (Single)
if [ -n "$CLASS_ID" ]; then
    echo ""
    echo "Test: Récupération d'une classe"
    test_endpoint "GET" "/classes/$CLASS_ID" "" "200" "READ Class (Single)"
fi

# UPDATE Class
if [ -n "$CLASS_ID" ]; then
    echo ""
    echo "Test: Mise à jour d'une classe"
    update_data='{"capacity":35}'
    test_endpoint "PUT" "/classes/$CLASS_ID" "$update_data" "200" "UPDATE Class"
fi

# DELETE Class
if [ -n "$CLASS_ID" ]; then
    echo ""
    echo "Test: Suppression d'une classe"
    test_endpoint "DELETE" "/classes/$CLASS_ID" "" "200" "DELETE Class"
fi

# ═══════════════════════════════════════════════════════════════
# SUBJECTS (MATIÈRES)
# ═══════════════════════════════════════════════════════════════

print_header "📚 TESTS CRUD - MATIÈRES"

# CREATE Subject
echo "Test: Création d'une matière"
subject_data='{
  "name": "Mathématiques Avancées",
  "code": "MATH-ADV",
  "description": "Cours de mathématiques niveau avancé",
  "weeklyHours": 5,
  "coefficient": 3
}'

create_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/subjects" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$subject_data")

subject_http_code=$(echo "$create_response" | tail -n1)
subject_body=$(echo "$create_response" | sed '$d')

if [ "$subject_http_code" == "201" ] || [ "$subject_http_code" == "200" ]; then
    SUBJECT_ID=$(echo "$subject_body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    print_result "CREATE Subject" "PASS" "ID: $SUBJECT_ID"
else
    print_result "CREATE Subject" "FAIL" "Status: $subject_http_code"
fi

# READ Subjects
echo ""
echo "Test: Liste des matières"
test_endpoint "GET" "/subjects" "" "200" "READ Subjects (List)"

# READ Subject (Single)
if [ -n "$SUBJECT_ID" ]; then
    echo ""
    echo "Test: Récupération d'une matière"
    test_endpoint "GET" "/subjects/$SUBJECT_ID" "" "200" "READ Subject (Single)"
fi

# UPDATE Subject
if [ -n "$SUBJECT_ID" ]; then
    echo ""
    echo "Test: Mise à jour d'une matière"
    update_data='{"weeklyHours":6}'
    test_endpoint "PUT" "/subjects/$SUBJECT_ID" "$update_data" "200" "UPDATE Subject"
fi

# DELETE Subject
if [ -n "$SUBJECT_ID" ]; then
    echo ""
    echo "Test: Suppression d'une matière"
    test_endpoint "DELETE" "/subjects/$SUBJECT_ID" "" "200" "DELETE Subject"
fi

# ═══════════════════════════════════════════════════════════════
# GRADES (NOTES)
# ═══════════════════════════════════════════════════════════════

print_header "📝 TESTS CRUD - NOTES"

# READ Grades
echo "Test: Liste des notes"
test_endpoint "GET" "/grades" "" "200" "READ Grades (List)"

# ═══════════════════════════════════════════════════════════════
# ATTENDANCE (PRÉSENCES)
# ═══════════════════════════════════════════════════════════════

print_header "📅 TESTS CRUD - PRÉSENCES"

# READ Attendance
echo "Test: Liste des présences"
test_endpoint "GET" "/attendance" "" "200" "READ Attendance (List)"

# ═══════════════════════════════════════════════════════════════
# TIMETABLE (EMPLOI DU TEMPS)
# ═══════════════════════════════════════════════════════════════

print_header "⏰ TESTS CRUD - EMPLOI DU TEMPS"

# READ Timetable
echo "Test: Liste des créneaux"
test_endpoint "GET" "/timetable" "" "200" "READ Timetable (List)"

# ═══════════════════════════════════════════════════════════════
# FINANCE (TRANSACTIONS)
# ═══════════════════════════════════════════════════════════════

print_header "💰 TESTS CRUD - FINANCES"

# CREATE Transaction
echo "Test: Création d'une transaction"
transaction_data='{
  "type": "payment",
  "amount": 50000,
  "description": "Frais de scolarité - Test",
  "date": "2025-11-19",
  "status": "completed"
}'

create_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/finance/transactions" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$transaction_data")

finance_http_code=$(echo "$create_response" | tail -n1)
finance_body=$(echo "$create_response" | sed '$d')

if [ "$finance_http_code" == "201" ] || [ "$finance_http_code" == "200" ]; then
    TRANSACTION_ID=$(echo "$finance_body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    print_result "CREATE Transaction" "PASS" "ID: $TRANSACTION_ID"
else
    print_result "CREATE Transaction" "FAIL" "Status: $finance_http_code"
fi

# READ Transactions
echo ""
echo "Test: Liste des transactions"
test_endpoint "GET" "/finance/transactions" "" "200" "READ Transactions (List)"

# ═══════════════════════════════════════════════════════════════
# DOCUMENTS
# ═══════════════════════════════════════════════════════════════

print_header "📄 TESTS CRUD - DOCUMENTS"

# READ Documents
echo "Test: Liste des documents"
test_endpoint "GET" "/documents" "" "200" "READ Documents (List)"

# ═══════════════════════════════════════════════════════════════
# ANALYTICS (TABLEAUX DE BORD)
# ═══════════════════════════════════════════════════════════════

print_header "📊 TESTS - ANALYTICS"

echo "Test: Statistiques générales"
test_endpoint "GET" "/analytics/stats" "" "200" "GET Analytics Stats"

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════

print_header "📊 RÉSUMÉ DES TESTS"

echo -e "${BLUE}Total de tests:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Tests réussis:${NC} $PASSED_TESTS"
echo -e "${RED}Tests échoués:${NC} $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✅ TOUS LES TESTS SONT PASSÉS ✅                     ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║          ⚠️  CERTAINS TESTS ONT ÉCHOUÉ ⚠️                    ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
