#!/bin/bash
# scripts/test-all-critical-modules.sh
# Validation critique post-déploiement

echo "🧪 VALIDATION CRITIQUE POST-DÉPLOIEMENT"
echo "======================================="

BASE_URL="https://kds-backend-api-production.perissosdigitals.workers.dev/api/v1"
FRONT_URL="https://ksp-school-management.pages.dev"

ERRORS=0

# 1. Accessibilité Frontend
echo "1. Test Frontend..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $FRONT_URL)
if [ "$HTTP_CODE" == "200" ]; then
    echo "   ✅ Frontend accessible ($HTTP_CODE)"
else
    echo "   ❌ Frontend inaccessible ($HTTP_CODE)"
    ERRORS=$((ERRORS+1))
fi

# 2. Santé Backend
echo "2. Test Backend Health..."
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" || echo "Err")
if [ "$HEALTH_CODE" == "200" ] || [ "$HEALTH_CODE" == "404" ]; then
    echo "   ✅ Backend répond ($HEALTH_CODE)"
else
    echo "   ❌ Backend erreur ($HEALTH_CODE)"
    ERRORS=$((ERRORS+1))
fi

# 3. Test Auth Endpoint (Disponibilité)
echo "3. Test Auth Endpoint..."
AUTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{}')
if [ "$AUTH_CODE" != "000" ] && [ "$AUTH_CODE" != "502" ] && [ "$AUTH_CODE" != "503" ]; then
    echo "   ✅ Auth endpoint répond ($AUTH_CODE)" # 400 ou 401 est attendu avec body vide
else
    echo "   ❌ Auth endpoint indisponible ($AUTH_CODE)"
    ERRORS=$((ERRORS+1))
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "🎉 TOUS LES TESTS CRITIQUES ONT RÉUSSI!"
    exit 0
else
    echo "⚠️  $ERRORS ÉCHECS DÉTECTÉS"
    exit 1
fi
