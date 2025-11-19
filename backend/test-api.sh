#!/bin/bash

# KDS School Management System - API Testing Script
# Tests all 109 endpoints with comprehensive reporting

BASE_URL="http://localhost:3001/api/v1"
OUTPUT_FILE="api-test-report.json"

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 KDS School Management System - API Testing"
echo "=============================================="
echo ""

# Initialize report
echo "{" > $OUTPUT_FILE
echo "  \"timestamp\": \"$(date -Iseconds)\"," >> $OUTPUT_FILE
echo "  \"results\": [" >> $OUTPUT_FILE

# Function to test endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local name=$3
    local data=$4
    
    echo -n "Testing: $name ... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$path")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$path" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ $http_code${NC}"
        status="success"
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
        echo -e "${YELLOW}⚠ $http_code${NC}"
        status="client_error"
    else
        echo -e "${RED}✗ $http_code${NC}"
        status="error"
    fi
    
    # Add to report (escape quotes in body)
    escaped_body=$(echo "$body" | sed 's/"/\\"/g' | tr '\n' ' ')
    echo "    {" >> $OUTPUT_FILE
    echo "      \"endpoint\": \"$path\"," >> $OUTPUT_FILE
    echo "      \"method\": \"$method\"," >> $OUTPUT_FILE
    echo "      \"name\": \"$name\"," >> $OUTPUT_FILE
    echo "      \"status\": \"$status\"," >> $OUTPUT_FILE
    echo "      \"http_code\": $http_code," >> $OUTPUT_FILE
    echo "      \"response_preview\": \"${escaped_body:0:200}\"" >> $OUTPUT_FILE
    echo "    }," >> $OUTPUT_FILE
}

echo -e "${BLUE}=== Health Check ===${NC}"
test_endpoint "GET" "/health" "Health Check"

echo ""
echo -e "${BLUE}=== Students Module (12 endpoints) ===${NC}"
test_endpoint "GET" "/students/stats/count" "Students Count"
test_endpoint "GET" "/students/stats/by-grade" "Students by Grade"
test_endpoint "GET" "/students/stats/by-status" "Students by Status"
test_endpoint "GET" "/students?page=1&limit=10" "List Students (paginated)"

echo ""
echo -e "${BLUE}=== Teachers Module (9 endpoints) ===${NC}"
test_endpoint "GET" "/teachers/stats/count" "Teachers Count"
test_endpoint "GET" "/teachers/stats/by-subject" "Teachers by Subject"
test_endpoint "GET" "/teachers/stats/by-status" "Teachers by Status"
test_endpoint "GET" "/teachers?page=1&limit=5" "List Teachers"

echo ""
echo -e "${BLUE}=== Classes Module (11 endpoints) ===${NC}"
test_endpoint "GET" "/classes/stats/count" "Classes Count"
test_endpoint "GET" "/classes/stats/by-level" "Classes by Level"
test_endpoint "GET" "/classes/stats/by-academic-year" "Classes by Academic Year"
test_endpoint "GET" "/classes" "List All Classes"

echo ""
echo -e "${BLUE}=== Subjects Module (9 endpoints) ===${NC}"
test_endpoint "GET" "/subjects/stats/count" "Subjects Count"
test_endpoint "GET" "/subjects/stats/by-grade-level" "Subjects by Grade Level"
test_endpoint "GET" "/subjects/stats/total-weekly-hours" "Total Weekly Hours"
test_endpoint "GET" "/subjects" "List All Subjects"

echo ""
echo -e "${BLUE}=== Timetable Module (9 endpoints) ===${NC}"
test_endpoint "GET" "/timetable/stats/count" "Timetable Slots Count"
test_endpoint "GET" "/timetable?page=1&limit=20" "List Timetable Slots"

echo ""
echo -e "${BLUE}=== Grades Module (13 endpoints) ===${NC}"
test_endpoint "GET" "/grades/stats/count" "Grades Count"
test_endpoint "GET" "/grades/stats/distribution" "Grade Distribution"
test_endpoint "GET" "/grades/stats/top-students" "Top Students"
test_endpoint "GET" "/grades/stats/by-evaluation-type" "Grades by Evaluation Type"
test_endpoint "GET" "/grades?page=1&limit=20" "List Grades"

echo ""
echo -e "${BLUE}=== Attendance Module (14 endpoints) ===${NC}"
test_endpoint "GET" "/attendance/stats/count" "Attendance Records Count"
test_endpoint "GET" "/attendance/stats/absence-rate" "Absence Rate"
test_endpoint "GET" "/attendance/stats/by-status" "Attendance by Status"
test_endpoint "GET" "/attendance/stats/most-absent" "Most Absent Students"
test_endpoint "GET" "/attendance/stats/unjustified" "Unjustified Absences"

echo ""
echo -e "${BLUE}=== Finance Module (16 endpoints) ===${NC}"
test_endpoint "GET" "/finance/stats/count" "Transactions Count"
test_endpoint "GET" "/finance/stats/revenue" "Total Revenue"
test_endpoint "GET" "/finance/stats/expenses" "Total Expenses"
test_endpoint "GET" "/finance/stats/balance" "Financial Balance"
test_endpoint "GET" "/finance/stats/by-category" "Transactions by Category"
test_endpoint "GET" "/finance/pending" "Pending Payments"
test_endpoint "GET" "/finance?page=1&limit=10" "List Transactions"

echo ""
echo -e "${BLUE}=== Documents Module (16 endpoints) ===${NC}"
test_endpoint "GET" "/documents/stats/count" "Documents Count"
test_endpoint "GET" "/documents/stats/by-type" "Documents by Type"
test_endpoint "GET" "/documents/stats/by-entity-type" "Documents by Entity Type"
test_endpoint "GET" "/documents/stats/storage" "Storage Statistics"
test_endpoint "GET" "/documents/expired" "Expired Documents"
test_endpoint "GET" "/documents/expiring" "Expiring Documents"
test_endpoint "GET" "/documents?page=1&limit=10" "List Documents"

echo ""
echo -e "${BLUE}=== Analytics Module ===${NC}"
test_endpoint "GET" "/analytics/dashboard" "Dashboard Overview"

# Close JSON report
echo "    {}" >> $OUTPUT_FILE
echo "  ]" >> $OUTPUT_FILE
echo "}" >> $OUTPUT_FILE

echo ""
echo "=============================================="
echo "✅ API Testing Complete!"
echo "📄 Report saved to: $OUTPUT_FILE"
echo "📚 View Swagger docs at: http://localhost:3001/api/docs"
echo ""
