#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://localhost:3001/api/v1"
ACADEMIC_YEAR="2024-2025"
TRIMESTER="Premier trimestre"

echo "🚀 Starting Grade Calculation Test..."

# 1. Create a Test Student
echo "👤 Creating Test Student..."
STUDENT_ID=$(curl -s -X POST "$API_URL/students" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Grade",
    "lastName": "Tester",
    "dob": "2015-01-01",
    "gender": "Masculin",
    "nationality": "Ivoirienne",
    "birthPlace": "Abidjan",
    "address": "123 Test St",
    "phone": "+225 07 12 34 56 78",
    "gradeLevel": "CM2",
    "emergencyContactName": "Test Guardian",
    "emergencyContactPhone": "+225 05 43 21 98 76"
  }' | jq -r '.id')

if [ "$STUDENT_ID" == "null" ]; then
  echo -e "${RED}Failed to create student${NC}"
  exit 1
fi
echo -e "${GREEN}Student created: $STUDENT_ID${NC}"

# 1.5 Create Test Teacher
echo "👨‍🏫 Creating Test Teacher..."
TEACHER_RES=$(curl -s -X POST "$API_URL/teachers" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Prof",
    "lastName": "Test",
    "email": "prof.test@school.com",
    "phone": "+22501020304",
    "subject": "Mathématiques",
    "status": "Actif"
  }')

echo "Teacher Creation Response: $TEACHER_RES"
TEACHER_ID=$(echo "$TEACHER_RES" | jq -r '.id')

if [ "$TEACHER_ID" == "null" ] || [ -z "$TEACHER_ID" ]; then
    # Try to get an existing teacher if creation fails (e.g. duplicate email)
    echo "Creation failed, trying to fetch existing teacher..."
    TEACHER_LIST=$(curl -s "$API_URL/teachers")
    echo "Teacher List Response: $TEACHER_LIST"
    TEACHER_ID=$(echo "$TEACHER_LIST" | jq -r '.[0].id')
fi

echo -e "${GREEN}Teacher ID: $TEACHER_ID${NC}"

# 2. Create Test Subjects (Math coeff 2, English coeff 1)
echo "📚 Creating Test Subjects..."
MATH_ID=$(curl -s -X POST "$API_URL/subjects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Math Test",
    "code": "MATH_TEST",
    "gradeLevel": "CM2",
    "weeklyHours": 4,
    "coefficient": 2
  }' | jq -r '.id')

ENG_ID=$(curl -s -X POST "$API_URL/subjects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "English Test",
    "code": "ENG_TEST",
    "gradeLevel": "CM2",
    "weeklyHours": 2,
    "coefficient": 1
  }' | jq -r '.id')

echo -e "${GREEN}Subjects created: Math ($MATH_ID), English ($ENG_ID)${NC}"

# 3. Add Grades
# Math: 15/20 (coeff 1), 18/20 (coeff 2) -> Avg = (15*1 + 18*2) / 3 = 51/3 = 17
# English: 12/20 (coeff 1) -> Avg = 12
# General Avg: (17*2 + 12*1) / (2+1) = 46/3 = 15.33

echo "📝 Adding Grades..."

# Math Grade 1: 15/20, coeff 1
curl -s -X POST "$API_URL/grades" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg studentId "$STUDENT_ID" \
    --arg subjectId "$MATH_ID" \
    --arg teacherId "$TEACHER_ID" \
    --arg evaluationType "Devoir" \
    --argjson value 15 \
    --argjson maxValue 20 \
    --argjson coefficient 1 \
    --arg trimester "$TRIMESTER" \
    --arg academicYear "$ACADEMIC_YEAR" \
    --arg evaluationDate "2024-11-21" \
    '{studentId: $studentId, subjectId: $subjectId, teacherId: $teacherId, evaluationType: $evaluationType, value: $value, maxValue: $maxValue, coefficient: $coefficient, trimester: $trimester, academicYear: $academicYear, evaluationDate: $evaluationDate}')"

# Math Grade 2: 18/20, coeff 2
curl -s -X POST "$API_URL/grades" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg studentId "$STUDENT_ID" \
    --arg subjectId "$MATH_ID" \
    --arg teacherId "$TEACHER_ID" \
    --arg evaluationType "Examen" \
    --argjson value 18 \
    --argjson maxValue 20 \
    --argjson coefficient 2 \
    --arg trimester "$TRIMESTER" \
    --arg academicYear "$ACADEMIC_YEAR" \
    --arg evaluationDate "2024-11-22" \
    '{studentId: $studentId, subjectId: $subjectId, teacherId: $teacherId, evaluationType: $evaluationType, value: $value, maxValue: $maxValue, coefficient: $coefficient, trimester: $trimester, academicYear: $academicYear, evaluationDate: $evaluationDate}')"

# English Grade 1: 12/20, coeff 1
curl -s -X POST "$API_URL/grades" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg studentId "$STUDENT_ID" \
    --arg subjectId "$ENG_ID" \
    --arg teacherId "$TEACHER_ID" \
    --arg evaluationType "Devoir" \
    --argjson value 12 \
    --argjson maxValue 20 \
    --argjson coefficient 1 \
    --arg trimester "$TRIMESTER" \
    --arg academicYear "$ACADEMIC_YEAR" \
    --arg evaluationDate "2024-11-21" \
    '{studentId: $studentId, subjectId: $subjectId, teacherId: $teacherId, evaluationType: $evaluationType, value: $value, maxValue: $maxValue, coefficient: $coefficient, trimester: $trimester, academicYear: $academicYear, evaluationDate: $evaluationDate}')"

echo -e "${GREEN}Grades added.${NC}"

# 4. Verify Report Card
echo "📊 Fetching Report Card..."
REPORT=$(curl -s -G "$API_URL/grades/analytics/student/$STUDENT_ID/report-card" \
  --data-urlencode "trimester=$TRIMESTER" \
  --data-urlencode "academicYear=$ACADEMIC_YEAR")

echo "$REPORT" | jq .

GENERAL_AVG=$(echo "$REPORT" | jq '.generalAverage')

if (( $(echo "$GENERAL_AVG == 15.33" | bc -l) )); then
  echo -e "${GREEN}✅ General Average Verified: $GENERAL_AVG${NC}"
else
  echo -e "${RED}❌ General Average Mismatch. Expected 15.33, got $GENERAL_AVG${NC}"
fi

# 5. Verify Class Ranking
echo "🏆 Fetching Class Ranking..."
RANKING=$(curl -s -G "$API_URL/grades/analytics/class/mock-class-id/ranking" \
  --data-urlencode "trimester=$TRIMESTER" \
  --data-urlencode "academicYear=$ACADEMIC_YEAR")
# Note: We can't easily test this without a real class ID, but we can check if the endpoint responds
echo "Ranking endpoint response code: $(curl -s -o /dev/null -w "%{http_code}" -G "$API_URL/grades/analytics/class/mock-class-id/ranking" --data-urlencode "trimester=$TRIMESTER" --data-urlencode "academicYear=$ACADEMIC_YEAR")"

# Cleanup
echo "🧹 Cleaning up..."
curl -X DELETE "$API_URL/students/$STUDENT_ID" > /dev/null
curl -X DELETE "$API_URL/subjects/$MATH_ID" > /dev/null
curl -X DELETE "$API_URL/subjects/$ENG_ID" > /dev/null
echo -e "${GREEN}Cleanup complete.${NC}"
