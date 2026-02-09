#!/bin/bash
# scripts/run-cloud-verification-full.sh

echo "🚀 VÉRIFICATION COMPLÈTE CLOUDFLARE PRODUCTION"
echo "=============================================="

# 1. Préparation
chmod +x ./scripts/prepare-cloud-verification.sh
./scripts/prepare-cloud-verification.sh

# Charger les variables exportées par prepare-cloud-verification.sh
# Note: Since specific exports don't persist after script exit, we re-export here for safety
export BASE_URL="https://ksp-school-management.pages.dev"
export API_URL="https://kds-backend-api-production.perissosdigitals.workers.dev"
export TEST_TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Export Test Credentials (matching those in auth.setup.ts defaults or overriding them)
export ADMIN_EMAIL="supporteam@perissosdigital.com"
export ADMIN_PASSWORD="chr1$$t0u$$1s0"
export TEACHER_EMAIL="jean.dupont@teacher.kds.edu"
export TEACHER_PASSWORD="teacher123" # Assuming default
export PARENT_EMAIL="parent1@example.com"
export PARENT_PASSWORD="parent123" # Assuming default
export STUDENT_EMAIL="alice.dubois@student.kds.edu"
export STUDENT_PASSWORD="student123" # Assuming default

# 2. Tests E2E existants
echo "2. Exécution des tests E2E..."
npx tsx scripts/run-cloud-verification.ts

# 3. Test Documents R2 (Requires cycle-documents project in playwright config)
echo "3. Test intégration R2 Documents..."
# We need to add cycle-documents to playwright config first or run by file path
# Running by file path is safer if project config isn't updated involves less risk
npx playwright test e2e/cycles/cycle-documents/documents.spec.ts --reporter=html --output=logs/verification/playwright-r2

echo "✅ Vérification complétée!"
echo "📊 Rapport disponible: logs/verification/"
