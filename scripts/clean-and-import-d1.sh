#!/bin/bash

# ============================================
# Clean and Import Fresh Data to D1
# ============================================

echo "🧹 Nettoyage et Import Frais vers D1..."
echo ""

cd "$(dirname "$0")/.." || exit

echo "1️⃣  Suppression des données existantes..."
npx wrangler d1 execute kds-school-db --remote --command="
DELETE FROM attendance;
DELETE FROM grades;
DELETE FROM documents;
DELETE FROM transactions;
DELETE FROM students;
DELETE FROM classes;
DELETE FROM teachers;
DELETE FROM users WHERE role != 'admin';
"

if [ $? -eq 0 ]; then
    echo "✅ Données nettoyées"
else
    echo "❌ Erreur lors du nettoyage"
    exit 1
fi

echo ""
echo "2️⃣  Import des nouvelles données..."
npx tsx scripts/import-sample-to-d1.ts

echo ""
echo "✅ Terminé!"
