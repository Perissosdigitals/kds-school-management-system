#!/bin/bash

# 🛑 Script pour arrêter l'environnement local KSP

echo ""
echo "🛑 ARRÊT ENVIRONNEMENT LOCAL KSP"
echo "================================="
echo ""

STOPPED=0

# 1. Arrêter le Watchdog
if [ -f "watchdog.pid" ]; then
    WD_PID=$(cat watchdog.pid)
    if ps -p $WD_PID >/dev/null 2>&1; then
        kill $WD_PID 2>/dev/null
        echo "✅ Watchdog arrêté (PID: $WD_PID)"
        STOPPED=$((STOPPED + 1))
    fi
    rm watchdog.pid
fi

# 2. Arrêter Vite
pkill -f "vite" 2>/dev/null && echo "✅ Vite arrêté" && STOPPED=$((STOPPED + 1))
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 3. Arrêter le Backend
if [ -f "backend.pid" ]; then
    BE_PID=$(cat backend.pid)
    if ps -p $BE_PID >/dev/null 2>&1; then
        kill $BE_PID 2>/dev/null
        echo "✅ Backend arrêté (PID: $BE_PID)"
        STOPPED=$((STOPPED + 1))
    fi
    rm backend.pid
fi

pkill -f "nest start" 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# 4. Vérifications finales
sleep 2

echo ""
echo "🔍 Vérification des ports..."

if lsof -ti:3001 >/dev/null 2>&1; then
    echo "⚠️  Port 3001 encore occupé"
    lsof -ti:3001 | xargs kill -9
else
    echo "✅ Port 3001 libre"
fi

if lsof -ti:5173 >/dev/null 2>&1; then
    echo "⚠️  Port 5173 encore occupé"
    lsof -ti:5173 | xargs kill -9
else
    echo "✅ Port 5173 libre"
fi

echo ""

if [ $STOPPED -gt 0 ]; then
    echo "✅ Arrêt terminé ($STOPPED service(s) arrêté(s))"
else
    echo "ℹ️  Aucun service actif trouvé"
fi

echo ""
echo "Pour redémarrer: ./start-local.sh"
echo ""
