#!/bin/bash

# 🚀 Script de démarrage complet de l'environnement local KSP
# Lance Backend + Frontend + Watchdog

echo ""
echo "🚀 DÉMARRAGE ENVIRONNEMENT LOCAL KSP"
echo "====================================="
echo ""

# Vérifier qu'on est en mode local
if [ -f ".env.local" ]; then
    API_URL=$(grep "VITE_API_URL" .env.local | cut -d '=' -f2)
    if [[ "$API_URL" != *"localhost"* ]]; then
        echo "❌ .env.local ne pointe pas vers localhost"
        echo "   Exécutez: ./switch-to-local.sh"
        exit 1
    fi
fi

echo "📋 Vérification des prérequis..."
echo ""

# 1. PostgreSQL
if ! lsof -ti:5432 >/dev/null 2>&1; then
    echo "❌ PostgreSQL non actif sur port 5432"
    echo "   Démarrez PostgreSQL avant de continuer"
    exit 1
else
    echo "✅ PostgreSQL actif (port 5432)"
fi

# 2. Nettoyer les anciens processus
echo "🧹 Nettoyage des anciens processus..."
pkill -f "nest start" 2>/dev/null
pkill -f "vite" 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2
echo "✅ Nettoyage terminé"

echo ""
echo "🚀 Démarrage des services..."
echo ""

# 3. Démarrer le Backend
echo "📦 Backend NestJS (port 3002)..."
cd backend
nohup npm run dev > /tmp/ksp-backend.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > ../backend.pid
cd ..
echo "   PID: $BACKEND_PID"
echo "   Logs: /tmp/ksp-backend.log"

# Attendre que le backend démarre
echo "   ⏳ Attente du démarrage..."
WAIT=0
MAX_WAIT=30

while [ $WAIT -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3002/api/v1/health 2>/dev/null | grep -q "ok"; then
        echo "   ✅ Backend prêt!"
        break
    fi
    sleep 1
    WAIT=$((WAIT + 1))
    echo -n "."
done

if [ $WAIT -eq $MAX_WAIT ]; then
    echo ""
    echo "   ❌ Backend timeout - vérifiez /tmp/ksp-backend.log"
    tail -20 /tmp/ksp-backend.log
    exit 1
fi

echo ""

# 4. Démarrer le Frontend avec Watchdog
echo "🎨 Frontend Vite (port 5173) avec Watchdog..."
nohup ./watchdog-frontend.sh > /tmp/ksp-watchdog.log 2>&1 &
WATCHDOG_PID=$!
echo "$WATCHDOG_PID" > watchdog.pid
echo "   PID Watchdog: $WATCHDOG_PID"
echo "   Logs: /tmp/ksp-watchdog.log"

# Attendre que le frontend démarre
echo "   ⏳ Attente du démarrage..."
WAIT=0
MAX_WAIT=15

while [ $WAIT -lt $MAX_WAIT ]; do
    if nc -z -w1 localhost 5173 2>/dev/null; then
        echo "   ✅ Frontend prêt!"
        break
    fi
    sleep 1
    WAIT=$((WAIT + 1))
    echo -n "."
done

if [ $WAIT -eq $MAX_WAIT ]; then
    echo ""
    echo "   ❌ Frontend timeout - vérifiez /tmp/ksp-watchdog.log"
    tail -20 /tmp/ksp-watchdog.log
    tail -20 /tmp/kds-frontend-watchdog.log
    exit 1
fi

echo ""
echo ""
echo "✅ ═══════════════════════════════════════════"
echo "✅  ENVIRONNEMENT LOCAL KSP PRÊT!"
echo "✅ ═══════════════════════════════════════════"
echo ""
echo "🌐 Frontend:  http://localhost:5173"
echo "⚙️  Backend:   http://localhost:3002"
echo "📚 API Docs:  http://localhost:3002/api/docs"
echo "🗄️  Database: PostgreSQL localhost:5432"
echo ""
echo "📊 PIDs:"
echo "   Backend:  $BACKEND_PID (fichier: backend.pid)"
echo "   Watchdog: $WATCHDOG_PID (fichier: watchdog.pid)"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/ksp-backend.log"
echo "   Frontend: tail -f /tmp/kds-frontend-watchdog.log"
echo "   Watchdog: tail -f /tmp/ksp-watchdog.log"
echo ""
echo "🛑 Pour arrêter:"
echo "   ./stop-local.sh"
echo ""
echo "🔍 Pour vérifier l'état:"
echo "   ./check-environment.sh"
echo ""
echo "═══════════════════════════════════════════"
echo ""
