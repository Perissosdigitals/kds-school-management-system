#!/bin/bash
API_URL="http://localhost:3001/api/v1"
STUDENT_ID="fc362559-c40d-4354-bf28-ee937daa015a"
TARGET_CLASS_ID="60847cc8-814b-4d7c-8f2e-cf5ee3516854"

echo "1. Fetching student before update..."
curl -s "$API_URL/students/$STUDENT_ID" | jq '{id, firstName, classId, class: .class.name}'

echo "2. Updating student..."
curl -s -X PUT "$API_URL/students/$STUDENT_ID" \
    -H "Content-Type: application/json" \
    -d "{\"classId\": \"$TARGET_CLASS_ID\"}" | jq '{id, firstName, classId, class: .class.name}'

echo "3. Fetching student after update..."
curl -s "$API_URL/students/$STUDENT_ID" | jq '{id, firstName, classId, class: .class.name}'
