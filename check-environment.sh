#!/bin/bash

# Script pour vérifier quel environnement est actuellement configuré

echo ""
echo "🔍 VÉRIFICATION DE L'ENVIRONNEMENT ACTUEL"
echo "=========================================="
echo ""

# Frontend
echo "📱 FRONTEND:"
echo "------------"

if [ -f ".env.local" ]; then
    API_URL=$(grep "VITE_API_URL" .env.local | cut -d '=' -f2)
    echo "   Fichier actif: .env.local"
    echo "   API Backend:   $API_URL"
    
    if [[ "$API_URL" == *"localhost"* ]]; then
        echo "   ✅ Mode: DÉVELOPPEMENT LOCAL"
    elif [[ "$API_URL" == *"workers.dev"* ]]; then
        echo "   ⚠️  Mode: CLOUDFLARE (inhabituel pour .env.local)"
    fi
else
    echo "   ⚠️  Pas de .env.local trouvé"
    echo "   → Utilisera .env.development par défaut"
fi

echo ""

# Backend
echo "⚙️  BACKEND:"
echo "------------"

# Vérifier si backend tourne localement
if lsof -ti:3001 >/dev/null 2>&1; then
    echo "   ✅ Backend LOCAL actif sur port 3001"
    
    # Test de santé
    HEALTH=$(curl -s http://localhost:3001/api/v1/health 2>/dev/null | grep -o '"status":"ok"')
    if [ -n "$HEALTH" ]; then
        echo "   ✅ Health check: OK"
    else
        echo "   ⚠️  Health check: ÉCHEC"
    fi
else
    echo "   ❌ Backend LOCAL non actif sur port 3001"
fi

echo ""

# Cloudflare Backend
echo "☁️  CLOUDFLARE BACKEND:"
echo "----------------------"

CF_HEALTH=$(curl -s https://kds-backend-api.perissosdigitals.workers.dev/api/v1/health 2>/dev/null | grep -o '"status":"ok"' | head -1)
if [ -n "$CF_HEALTH" ]; then
    echo "   ✅ Cloudflare Workers: ACTIF"
else
    echo "   ⚠️  Cloudflare Workers: Non accessible ou erreur"
fi

echo ""

# Frontend local
echo "🌐 FRONTEND LOCAL:"
echo "------------------"

if lsof -ti:5173 >/dev/null 2>&1; then
    echo "   ✅ Vite Dev Server actif sur port 5173"
else
    echo "   ❌ Vite Dev Server non actif sur port 5173"
fi

echo ""

# Base de données
echo "🗄️  BASE DE DONNÉES:"
echo "-------------------"

if lsof -ti:5432 >/dev/null 2>&1; then
    echo "   ✅ PostgreSQL local actif sur port 5432"
else
    echo "   ⚠️  PostgreSQL local non actif sur port 5432"
fi

echo ""
echo "=========================================="
echo ""

# Résumé
echo "📊 RÉSUMÉ:"
echo ""

if [ -f ".env.local" ] && [[ "$API_URL" == *"localhost"* ]] && lsof -ti:3001 >/dev/null 2>&1; then
    echo "   ✅ Configuration: DÉVELOPPEMENT LOCAL"
    echo "   → Frontend Vite (5173) → Backend NestJS (3001) → PostgreSQL (5432)"
    echo ""
    echo "   Pour tester: http://localhost:5173"
elif [ -f ".env.local" ] && [[ "$API_URL" == *"workers.dev"* ]]; then
    echo "   ⚠️  Configuration: MIXTE (Frontend local → Backend Cloudflare)"
    echo "   → À éviter en développement!"
    echo ""
    echo "   Pour corriger, exécutez: ./switch-to-local.sh"
else
    echo "   ⚠️  Configuration: INDÉTERMINÉE"
    echo ""
    echo "   Créez .env.local avec: ./switch-to-local.sh"
fi

echo ""
