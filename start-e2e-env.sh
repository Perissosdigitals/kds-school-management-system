#!/bin/bash

# Script de démarrage simplifié pour tests E2E
# Lance Backend + Frontend pour génération auth states

echo "🧪 DÉMARRAGE ENVIRONNEMENT E2E"
echo "================================"
echo ""

# 1. Vérifier Docker containers
echo "📦 Vérification PostgreSQL & Redis (Docker)..."
if ! docker ps | grep -q kds-postgres; then
    echo "❌ PostgreSQL container non actif"
    echo "   Lancement: docker-compose -f backend/docker-compose.yml up -d postgres redis"
    cd backend && docker-compose up -d postgres redis && cd ..
    sleep 3
fi
echo "✅ Docker containers actifs"
echo ""

# 2. Nettoyer processus existants
echo "🧹 Nettoyage anciens processus..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2
echo "✅ Nettoyage terminé"
echo ""

# 3. Démarrer Backend
echo "🔧 Démarrage Backend (port 3001)..."
cd backend
npm run dev > /tmp/kds-backend-e2e.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > ../backend.pid
cd ..
echo "   Backend PID: $BACKEND_PID"
echo "   Logs: /tmp/kds-backend-e2e.log"

# Attendre backend
echo "   ⏳ Attente backend (max 60s)..."
WAIT=0
MAX_WAIT=60
while [ $WAIT -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3001/api/v1/health 2>/dev/null | grep -q "ok\|status"; then
        echo "   ✅ Backend prêt!"
        break
    fi
    sleep 1
    WAIT=$((WAIT + 1))
    if [ $((WAIT % 10)) -eq 0 ]; then
        echo "   ... $WAIT secondes écoulées"
    fi
done

if [ $WAIT -eq $MAX_WAIT ]; then
    echo "   ❌ Backend timeout - erreur:"
    tail -30 /tmp/kds-backend-e2e.log
    exit 1
fi
echo ""

# 4. Démarrer Frontend
echo "⚛️  Démarrage Frontend (port 3000)..."
npm run start > /tmp/kds-frontend-e2e.log 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > frontend.pid
echo "   Frontend PID: $FRONTEND_PID"
echo "   Logs: /tmp/kds-frontend-e2e.log"

# Attendre frontend
echo "   ⏳ Attente frontend (max 30s)..."
WAIT=0
MAX_WAIT=30
while [ $WAIT -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3000 2>/dev/null | grep -q "<!DOCTYPE\|<html"; then
        echo "   ✅ Frontend prêt!"
        break
    fi
    sleep 1
    WAIT=$((WAIT + 1))
done

if [ $WAIT -eq $MAX_WAIT ]; then
    echo "   ⚠️  Frontend timeout (continuera en arrière-plan)"
fi
echo ""

# 5. Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ENVIRONNEMENT E2E DÉMARRÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 URLs:"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/kds-backend-e2e.log"
echo "   Frontend: tail -f /tmp/kds-frontend-e2e.log"
echo ""
echo "🧪 Prochaine étape:"
echo "   npm run test:e2e:auth"
echo ""
echo "🛑 Pour arrêter:"
echo "   ./stop-local.sh"
echo ""
