#!/bin/bash

# Script de test complet pour le module de gestion de notes
# Usage: ./test-notes-module.sh

set -e

echo "🧪 ============================================"
echo "🧪 TEST MODULE GESTION DE NOTES"
echo "🧪 ============================================"
echo ""

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
API_URL="${BASE_URL}/api/grades"

# IDs de test (basés sur les données de simulation)
CLASS_ID="60847cc8-814b-4d7c-8f2e-cf5ee3516854"  # CM2-A
STUDENT_ID="99245563-0359-4a54-be9d-b5ecac6a7d59"  # Daniel Abitbol
TRIMESTER="Premier%20trimestre"
ACADEMIC_YEAR="2024-2025"

echo "📋 Configuration:"
echo "   Base URL: $BASE_URL"
echo "   Classe: CM2-A"
echo "   Élève: Daniel Abitbol"
echo "   Période: Premier trimestre 2024-2025"
echo ""

# Fonction pour tester un endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "   🔍 $name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$url" \
            -H "Content-Type: application/json" \
            -d '{"classIds":["60847cc8-814b-4d7c-8f2e-cf5ee3516854"],"trimester":"Premier trimestre","academicYear":"2024-2025"}' \
            -w "\n%{http_code}")
    else
        response=$(curl -s -w "\n%{http_code}" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅ OK (HTTP $http_code)"
        
        # Afficher un aperçu de la réponse
        if command -v jq &> /dev/null; then
            echo "$body" | jq -C '.' 2>/dev/null | head -20 || echo "$body" | head -5
        else
            echo "$body" | head -5
        fi
        echo ""
        return 0
    else
        echo "❌ ÉCHEC (HTTP $http_code)"
        echo "$body"
        echo ""
        return 1
    fi
}

# Tests des endpoints standards
echo "📊 TEST 1: Endpoints Standards"
echo "================================"
test_endpoint "Liste des notes" "${API_URL}?limit=5"
test_endpoint "Statistiques générales" "${API_URL}/stats/count"
echo ""

# Tests des nouveaux endpoints analytiques
echo "📊 TEST 2: Endpoints Analytiques - Élève"
echo "========================================="
test_endpoint "Performance élève" \
    "${API_URL}/analytics/student/${STUDENT_ID}/performance?trimester=${TRIMESTER}&academicYear=${ACADEMIC_YEAR}"

test_endpoint "Bulletin élève" \
    "${API_URL}/analytics/student/${STUDENT_ID}/report-card?trimester=${TRIMESTER}&academicYear=${ACADEMIC_YEAR}"

# Progression nécessite deux trimestres
echo "   🔍 Progression élève... ⏭️  SKIP (nécessite 2 trimestres)"
echo ""

echo "📊 TEST 3: Endpoints Analytiques - Classe"
echo "=========================================="
test_endpoint "Classement classe" \
    "${API_URL}/analytics/class/${CLASS_ID}/ranking?trimester=${TRIMESTER}&academicYear=${ACADEMIC_YEAR}"

test_endpoint "Statistiques classe" \
    "${API_URL}/analytics/class/${CLASS_ID}/statistics?trimester=${TRIMESTER}&academicYear=${ACADEMIC_YEAR}"

test_endpoint "Alertes classe" \
    "${API_URL}/analytics/class/${CLASS_ID}/alerts?trimester=${TRIMESTER}&academicYear=${ACADEMIC_YEAR}"
echo ""

echo "📊 TEST 4: Endpoints Analytiques - Comparaison"
echo "==============================================="
test_endpoint "Comparaison classes" \
    "${API_URL}/analytics/classes/compare" \
    "POST"
echo ""

# Résumé
echo "🎉 ============================================"
echo "🎉 TESTS TERMINÉS"
echo "🎉 ============================================"
echo ""
echo "📊 Pour des tests plus détaillés, utilisez:"
echo "   - Postman/Insomnia pour tester manuellement"
echo "   - Les composants React pour l'interface"
echo "   - Les requêtes SQL dans queries-notes-utiles.sql"
echo ""
echo "📚 Documentation:"
echo "   - MODULE_GESTION_NOTES_COMPLET.md"
echo "   - QUICK_START_NOTES.md"
echo "   - NOTES_MODULE_RECAP.md"
echo ""
echo "Berakhot ve-Shalom! 🙏"
