#!/bin/bash

# Script de démarrage robuste du frontend KDS
# Garantit que le frontend tourne toujours sur le port 5173

PORT=5173
MAX_RETRIES=3
RETRY_COUNT=0

echo "🚀 Démarrage du frontend KDS sur port $PORT..."

# Fonction pour nettoyer les processus existants
cleanup_port() {
    echo "🧹 Nettoyage du port $PORT..."
    
    # Tuer tous les processus Vite
    pkill -f "vite" 2>/dev/null
    
    # Tuer le processus occupant le port si nécessaire
    PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ -n "$PID" ]; then
        echo "   Arrêt du processus $PID sur port $PORT"
        kill -9 $PID 2>/dev/null
    fi
    
    sleep 2
}

# Fonction pour vérifier si le port est disponible
check_port() {
    if lsof -ti:$PORT >/dev/null 2>&1; then
        return 1  # Port occupé
    else
        return 0  # Port libre
    fi
}

# Fonction pour vérifier si le serveur répond
check_server() {
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null | grep -q "200"; then
        return 0  # Serveur répond
    else
        return 1  # Serveur ne répond pas
    fi
}

# Boucle de tentatives de démarrage
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo ""
    echo "📌 Tentative $((RETRY_COUNT + 1))/$MAX_RETRIES"
    
    # Nettoyer le port au début
    cleanup_port
    
    # Vérifier que le port est bien libre
    if ! check_port; then
        echo "❌ Le port $PORT est encore occupé après nettoyage"
        RETRY_COUNT=$((RETRY_COUNT + 1))
        continue
    fi
    
    echo "✅ Port $PORT disponible"
    echo "🔄 Démarrage de Vite..."
    
    # Démarrer Vite en arrière-plan
    npm run dev > /tmp/kds-frontend.log 2>&1 &
    VITE_PID=$!
    
    echo "   PID Vite: $VITE_PID"
    
    # Attendre que le serveur démarre (max 15 secondes)
    echo "⏳ Attente du démarrage du serveur..."
    WAIT_COUNT=0
    MAX_WAIT=15
    
    while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
        sleep 1
        WAIT_COUNT=$((WAIT_COUNT + 1))
        
        # Vérifier si le processus est toujours vivant
        if ! kill -0 $VITE_PID 2>/dev/null; then
            echo "❌ Le processus Vite est mort (PID: $VITE_PID)"
            echo "   Logs:"
            tail -20 /tmp/kds-frontend.log
            break
        fi
        
        # Vérifier si le serveur répond
        if check_server; then
            echo ""
            echo "✅ ═══════════════════════════════════════"
            echo "✅  FRONTEND KDS DÉMARRÉ AVEC SUCCÈS!"
            echo "✅ ═══════════════════════════════════════"
            echo ""
            echo "🌐 URL:     http://localhost:$PORT"
            echo "📝 PID:     $VITE_PID"
            echo "📂 Logs:    /tmp/kds-frontend.log"
            echo ""
            echo "Pour arrêter: kill $VITE_PID"
            echo "Pour relancer: ./start-frontend.sh"
            echo ""
            exit 0
        fi
        
        # Afficher un point pour montrer la progression
        echo -n "."
    done
    
    echo ""
    echo "⚠️  Le serveur n'a pas répondu dans les $MAX_WAIT secondes"
    
    # Tuer le processus si toujours vivant
    if kill -0 $VITE_PID 2>/dev/null; then
        kill -9 $VITE_PID 2>/dev/null
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

# Si on arrive ici, toutes les tentatives ont échoué
echo ""
echo "❌ ═══════════════════════════════════════"
echo "❌  ÉCHEC DU DÉMARRAGE DU FRONTEND"
echo "❌ ═══════════════════════════════════════"
echo ""
echo "Consultez les logs: tail -f /tmp/kds-frontend.log"
echo ""
exit 1
