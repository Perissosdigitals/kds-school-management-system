#!/bin/bash

# Configuration
API_URL="http://localhost:3001/api/v1"
CM2_TEST_ID="0b6cf1c7-1cd7-4d98-ab28-5b168f32b21b"
CM2_A_TARGET_ID="60847cc8-814b-4d7c-8f2e-cf5ee3516854"

# Classes to delete (Empty duplicates)
declare -a CLASSES_TO_DELETE=(
    "f7643c2a-911f-4f66-9d3a-fe7beba20fd8" # CE1-A (Empty)
    "3ce10a38-ffe6-4e90-88a0-e421d0a3d7b8" # CE2-A (Empty)
    "8cb82d1f-34a3-4cb5-8f2f-9461b1ee65ff" # CM1-A (Empty)
    "b879624a-a37d-4b76-8f81-83d48df5b8c4" # CM2-A (Empty)
)

echo "🚀 Starting Class Cleanup..."

# 1. Migrate students from CM2 Test to CM2-A
echo "📋 Fetching students from CM2 Test..."
STUDENTS=$(curl -s "$API_URL/classes/$CM2_TEST_ID/students" | jq -r '.data[] | .id')

if [ -z "$STUDENTS" ]; then
    echo "ℹ️  No students found in CM2 Test."
else
    echo "🔄 Migrating students to CM2-A..."
    for STUDENT_ID in $STUDENTS; do
        echo "  - Moving student $STUDENT_ID..."
        curl -s -X PATCH "$API_URL/students/$STUDENT_ID/class" \
            -H "Content-Type: application/json" \
            -d "{\"classId\": \"$CM2_A_TARGET_ID\"}" > /dev/null
    done
    echo "✅ Migration complete."
fi

# 2. Delete CM2 Test Class
echo "🗑️  Deleting CM2 Test class..."
curl -s -X DELETE "$API_URL/classes/$CM2_TEST_ID" > /dev/null
echo "✅ CM2 Test deleted."

# 3. Delete Empty Duplicate Classes
echo "🗑️  Deleting empty duplicate classes..."
for CLASS_ID in "${CLASSES_TO_DELETE[@]}"; do
    echo "  - Deleting class $CLASS_ID..."
    curl -s -X DELETE "$API_URL/classes/$CLASS_ID" > /dev/null
done

echo "✨ Cleanup complete!"
