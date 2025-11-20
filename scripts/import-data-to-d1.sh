#!/bin/bash

# Script pour importer les données dans Cloudflare D1
# Importe par petits batchs pour éviter les timeouts
# Barukh HaShem! 🙏

echo ""
echo "📊 Import des Données dans Cloudflare D1"
echo "=========================================="
echo ""

cd /Users/apple/Desktop/kds-school-management-system/backend

# Nettoyer d'abord
echo "🧹 Nettoyage des données existantes..."
npx wrangler d1 execute kds-school-db --remote --command="DELETE FROM transactions"
npx wrangler d1 execute kds-school-db --remote --command="DELETE FROM documents"
npx wrangler d1 execute kds-school-db --remote --command="DELETE FROM students"
npx wrangler d1 execute kds-school-db --remote --command="DELETE FROM teachers"
npx wrangler d1 execute kds-school-db --remote --command="DELETE FROM classes"
npx wrangler d1 execute kds-school-db --remote --command="DELETE FROM users"

echo ""
echo "📥 Import des données..."
echo ""

# Importer le fichier SQL par morceaux
# D1 a une limite de taille de requête, donc on importe par sections

# 1. Users (6 lignes)
echo "👥 Import USERS (6)..."
npx wrangler d1 execute kds-school-db --remote --file=../cloudflare-d1-import.sql 2>&1 | head -20

sleep 2

# Vérifier les résultats
echo ""
echo "✅ Vérification des données importées:"
echo ""

echo "📊 Users:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM users"

echo "📊 Teachers:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM teachers"

echo "📊 Classes:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM classes"

echo "📊 Students:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM students"

echo "📊 Transactions:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM transactions"

echo ""
echo "✅ Import terminé!"
echo ""
echo "🌐 Testez l'API Cloudflare:"
echo "   curl https://kds-backend-api.perissosdigitals.workers.dev/api/v1/students"
echo ""
echo "Bérakhot ve-Shalom! 🙏"
echo ""
