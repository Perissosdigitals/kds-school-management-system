#!/bin/bash

# Watchdog pour maintenir le frontend KDS en vie
# Relance automatiquement en cas de crash

PORT=5173
CHECK_INTERVAL=5  # Vérifier toutes les 5 secondes
RESTART_DELAY=3   # Attendre 3 secondes avant de relancer

echo "👁️  Watchdog KDS Frontend démarré"
echo "📍 Port surveillé: $PORT"
echo "⏱️  Intervalle: ${CHECK_INTERVAL}s"
echo ""

# Fonction pour démarrer le frontend
start_frontend() {
    echo "🔄 $(date '+%Y-%m-%d %H:%M:%S') - Démarrage du frontend..."
    
    # Nettoyer les anciens processus
    pkill -f "vite" 2>/dev/null
    sleep 1
    
    # Démarrer Vite
    cd /Users/apple/Desktop/kds-school-management-system
    npm run dev:stable > /tmp/kds-frontend-watchdog.log 2>&1 &
    VITE_PID=$!
    
    echo "   PID: $VITE_PID"
    
    # Attendre le démarrage
    sleep 5
    
    if kill -0 $VITE_PID 2>/dev/null; then
        if nc -z -w1 localhost $PORT 2>/dev/null; then
            echo "✅ Frontend démarré avec succès sur port $PORT"
            return 0
        else
            echo "⚠️  Processus actif mais port $PORT non disponible"
            return 1
        fi
    else
        echo "❌ Échec du démarrage (processus mort)"
        return 1
    fi
}

# Fonction pour vérifier l'état
check_status() {
    if nc -z -w1 localhost $PORT 2>/dev/null; then
        return 0  # OK
    else
        return 1  # DOWN
    fi
}

# Démarrage initial
start_frontend

# Boucle de surveillance infinie
while true; do
    sleep $CHECK_INTERVAL
    
    if ! check_status; then
        echo "❌ $(date '+%Y-%m-%d %H:%M:%S') - Frontend DOWN détecté!"
        echo "⏳ Attente de ${RESTART_DELAY}s avant relance..."
        sleep $RESTART_DELAY
        
        start_frontend
    fi
done
