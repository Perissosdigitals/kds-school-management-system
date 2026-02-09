#!/bin/bash
# scripts/prepare-cloud-verification.sh

echo "🔧 PRÉPARATION DES TESTS CLOUDFLARE PRODUCTION"
echo "=============================================="

# 1. Variables d'environnement
export BASE_URL="https://ksp-school-management.pages.dev"
export API_URL="https://kds-backend-api-production.perissosdigitals.workers.dev"
export TEST_MODE="production_verification"
export TEST_TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 2. Créer répertoire de logs
mkdir -p logs/verification/$TEST_TIMESTAMP

# 3. Vérifier l'accès
echo "1. Vérification accès production..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" "$BASE_URL" > logs/verification/$TEST_TIMESTAMP/access.log
curl -s -o /dev/null -w "Backend: %{http_code}\n" "$API_URL/api/v1/health" >> logs/verification/$TEST_TIMESTAMP/access.log

# 4. Créer credentials de test
cat > test-credentials.json << 'EOF'
{
  "admin": {
    "email": "admin-test@karatschool.org",
    "password": "TestAdmin2026!",
    "role": "ADMIN"
  },
  "teacher": {
    "email": "teacher-test@karatschool.org",
    "password": "TestTeacher2026!",
    "role": "TEACHER"
  }
}
EOF

echo "✅ Environnement de test prêt!"
