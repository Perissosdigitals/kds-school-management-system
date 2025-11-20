#!/bin/bash

# Migrate D1 Students Table to Add Denormalized Name Fields
# This aligns D1 schema with NestJS entity expectations

echo "🔄 Migration D1: Ajout des champs first_name et last_name dans students"
echo "=" | tr -d '\n' | xargs printf '%.0s=' {1..60}
echo ""

# Step 1: Add columns to students table
echo "📝 Étape 1: Ajout des colonnes first_name et last_name..."
npx wrangler d1 execute kds-school-db --remote --command="
ALTER TABLE students ADD COLUMN first_name TEXT;
"

npx wrangler d1 execute kds-school-db --remote --command="
ALTER TABLE students ADD COLUMN last_name TEXT;
"

echo ""

# Step 2: Copy names from users table to students table
echo "📋 Étape 2: Copie des noms depuis la table users..."
npx wrangler d1 execute kds-school-db --remote --command="
UPDATE students 
SET 
  first_name = (SELECT first_name FROM users WHERE users.id = students.user_id),
  last_name = (SELECT last_name FROM users WHERE users.id = students.user_id)
WHERE user_id IS NOT NULL;
"

echo ""

# Step 3: Verify the migration
echo "✅ Étape 3: Vérification..."
npx wrangler d1 execute kds-school-db --remote --command="
SELECT 
  student_code, 
  first_name, 
  last_name, 
  academic_level 
FROM students 
LIMIT 5;
"

echo ""
echo "✅ Migration terminée!"
echo ""
echo "🎯 Prochaine étape: Tester l'API Worker"
echo "   curl https://kds-backend-api.perissosdigitals.workers.dev/api/v1/students | jq '.[0:3]'"
