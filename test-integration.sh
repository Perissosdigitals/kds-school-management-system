#!/bin/bash

# Script de test d'intégration Frontend-Backend
# Usage: chmod +x test-integration.sh && ./test-integration.sh

echo "🧪 Test d'Intégration Frontend-Backend"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonction de test
test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  
  echo -n "Testing $name... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -X "$method" "$url" -H "Content-Type: application/json")
  else
    response=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
  fi
  
  if [ $? -eq 0 ] && [ -n "$response" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
    echo "  Response: $(echo $response | head -c 100)..."
    echo ""
    return 0
  else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
    echo ""
    return 1
  fi
}

# Tests
echo -e "${YELLOW}1. Vérification des Services${NC}"
echo "==============================="
test_endpoint "Backend Health" "GET" "http://localhost:3001/api/v1/health"
test_endpoint "Frontend Running" "GET" "http://localhost:3000"

echo ""
echo -e "${YELLOW}2. Tests d'Authentification${NC}"
echo "============================="
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kds-school.com","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
  echo -e "${GREEN}✓ Login PASSED${NC}"
  ((PASSED++))
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  echo "  Token: ${TOKEN:0:30}..."
  echo ""
else
  echo -e "${RED}✗ Login FAILED${NC}"
  ((FAILED++))
  echo "  Response: $LOGIN_RESPONSE"
  echo ""
fi

echo ""
echo -e "${YELLOW}3. Tests des Endpoints Principaux${NC}"
echo "==================================="
test_endpoint "Students List" "GET" "http://localhost:3001/api/v1/students"
test_endpoint "Teachers List" "GET" "http://localhost:3001/api/v1/teachers"
test_endpoint "Classes List" "GET" "http://localhost:3001/api/v1/classes"
test_endpoint "Grades List" "GET" "http://localhost:3001/api/v1/grades"
test_endpoint "Timetable List" "GET" "http://localhost:3001/api/v1/timetable"
test_endpoint "Attendance List" "GET" "http://localhost:3001/api/v1/attendance"

echo ""
echo -e "${YELLOW}4. Tests de Création de Données${NC}"
echo "==============================="

# Test création élève
CREATE_STUDENT_DATA='{"firstName":"TestStudent","lastName":"Integration","dob":"2015-01-01","gender":"Masculin","nationality":"Française","birthPlace":"Paris","address":"123 Rue Test","phone":"0612345678","gradeLevel":"CP"}'
test_endpoint "Create Student" "POST" "http://localhost:3001/api/v1/students" "$CREATE_STUDENT_DATA"

# Test création enseignant
CREATE_TEACHER_DATA='{"firstName":"TestTeacher","lastName":"Integration","subject":"Français","email":"test@kds.com","phone":"0612345678"}'
test_endpoint "Create Teacher" "POST" "http://localhost:3001/api/v1/teachers" "$CREATE_TEACHER_DATA"

echo ""
echo "======================================"
echo -e "📊 Résultats:"
echo -e "  ${GREEN}✓ Réussis: $PASSED${NC}"
echo -e "  ${RED}✗ Échoués: $FAILED${NC}"
echo "======================================"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Tous les tests sont passés!${NC}"
  exit 0
else
  echo -e "${RED}❌ Certains tests ont échoué${NC}"
  exit 1
fi
