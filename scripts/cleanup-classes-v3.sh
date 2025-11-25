#!/bin/bash

# Configuration
API_URL="http://localhost:3001/api/v1"
CM2_TEST_ID="0b6cf1c7-1cd7-4d98-ab28-5b168f32b21b"
CM2_A_TARGET_ID="60847cc8-814b-4d7c-8f2e-cf5ee3516854"

echo "🚀 Starting Class Cleanup V3..."

# 1. Find orphans from CM2 Test (since class is deleted, we search by classId)
echo "📋 Fetching students from CM2 Test (ID: $CM2_TEST_ID)..."
# Corrected jq: iterate over the array directly
STUDENTS=$(curl -s "$API_URL/students?classId=$CM2_TEST_ID" | jq -r '.[] | .id')

if [ -z "$STUDENTS" ]; then
    echo "ℹ️  No students found with CM2 Test ID."
else
    echo "🔄 Migrating students to CM2-A..."
    for STUDENT_ID in $STUDENTS; do
        echo "  - Moving student $STUDENT_ID..."
        curl -s -X PUT "$API_URL/students/$STUDENT_ID" \
            -H "Content-Type: application/json" \
            -d "{\"classId\": \"$CM2_A_TARGET_ID\"}" > /dev/null
    done
    echo "✅ Migration complete."
fi

echo "✨ Cleanup V3 complete!"
