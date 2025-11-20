#!/bin/bash

# Script pour déployer le schéma D1 sur Cloudflare
# Barukh HaShem! 🙏

echo ""
echo "🚀 Déploiement Schéma D1 sur Cloudflare"
echo "=========================================="
echo ""

cd backend

# Tables principales
echo "1️⃣  Création table TEACHERS..."
npx wrangler d1 execute kds-school-db --remote --command="CREATE TABLE IF NOT EXISTS teachers (id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT UNIQUE, phone TEXT, subject TEXT, hire_date TEXT, status TEXT DEFAULT 'active', created_at TEXT DEFAULT (datetime('now')))"

echo "2️⃣  Création table CLASSES..."
npx wrangler d1 execute kds-school-db --remote --command="CREATE TABLE IF NOT EXISTS classes (id TEXT PRIMARY KEY, name TEXT NOT NULL, level TEXT NOT NULL, teacher_id TEXT, capacity INTEGER DEFAULT 30, room TEXT, is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')))"

echo "3️⃣  Création table STUDENTS..."
npx wrangler d1 execute kds-school-db --remote --command="CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, registration_number TEXT UNIQUE, first_name TEXT NOT NULL, last_name TEXT NOT NULL, date_of_birth TEXT, gender TEXT, grade_level TEXT, class_id TEXT, guardian_name TEXT, guardian_phone TEXT, address TEXT, status TEXT DEFAULT 'active', created_at TEXT DEFAULT (datetime('now')))"

echo "4️⃣  Création table USERS..."
npx wrangler d1 execute kds-school-db --remote --command="CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, first_name TEXT, last_name TEXT, role TEXT NOT NULL, password_hash TEXT, is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')))"

echo "5️⃣  Création table TRANSACTIONS..."
npx wrangler d1 execute kds-school-db --remote --command="CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, type TEXT NOT NULL, category TEXT, amount REAL NOT NULL, student_id TEXT, description TEXT, status TEXT DEFAULT 'pending', transaction_date TEXT, created_at TEXT DEFAULT (datetime('now')))"

echo "6️⃣  Création table DOCUMENTS..."
npx wrangler d1 execute kds-school-db --remote --command="CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, type TEXT NOT NULL, status TEXT DEFAULT 'missing', file_url TEXT, submitted_at TEXT, created_at TEXT DEFAULT (datetime('now')))"

echo "7️⃣  Création table GRADES..."
npx wrangler d1 execute kds-school-db --remote --command="CREATE TABLE IF NOT EXISTS grades (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, subject TEXT NOT NULL, grade_value REAL NOT NULL, evaluation_date TEXT, teacher_id TEXT, comments TEXT, created_at TEXT DEFAULT (datetime('now')))"

echo "8️⃣  Création table ATTENDANCE..."
npx wrangler d1 execute kds-school-db --remote --command="CREATE TABLE IF NOT EXISTS attendance (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, notes TEXT, created_at TEXT DEFAULT (datetime('now')))"

echo ""
echo "✅ Schéma D1 déployé avec succès!"
echo ""
echo "📋 Prochaine étape: Importer les données"
echo "   Exécutez: ./import-data-to-d1.sh"
echo ""
echo "Bérakhot ve-Shalom! 🙏"
echo ""
