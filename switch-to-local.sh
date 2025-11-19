#!/bin/bash

# Script pour basculer en mode DÉVELOPPEMENT LOCAL

echo ""
echo "🔧 BASCULEMENT EN MODE DÉVELOPPEMENT LOCAL"
echo "==========================================="
echo ""

# Créer/mettre à jour .env.local
cat > .env.local << 'EOF'
# ============================================
# 🔧 ENVIRONNEMENT LOCAL DE DÉVELOPPEMENT
# ============================================
# Ce fichier est prioritaire et ne sera JAMAIS commité (dans .gitignore)
# Utilisé pour le développement local uniquement

# 🌐 Backend API Local (NestJS sur localhost:3001)
VITE_API_URL=http://localhost:3001/api/v1

# 🔌 Mode de données
VITE_USE_MOCK_DATA=false

# 🔑 API Keys (placeholders pour dev local)
GEMINI_API_KEY=PLACEHOLDER_API_KEY
OPENROUTER_API_KEY=PLACEHOLDER_API_KEY

# ⚙️ Configuration Vite
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HOST=0.0.0.0

# 📊 Environnement
NODE_ENV=development
EOF

echo "✅ Fichier .env.local créé/mis à jour"
echo ""

# Vérifier .gitignore
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
    echo ".env.local" >> .gitignore
    echo "✅ .env.local ajouté à .gitignore"
else
    echo "✅ .env.local déjà dans .gitignore"
fi

echo ""
echo "📋 Configuration actuelle:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001/api/v1"
echo "   Database: PostgreSQL localhost:5432"
echo ""

# Proposer de démarrer les services
read -p "Voulez-vous démarrer les services locaux? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Démarrage des services..."
    echo ""
    
    # Backend
    if ! lsof -ti:3001 >/dev/null 2>&1; then
        echo "📦 Démarrage du backend NestJS..."
        cd backend
        npm run start:dev > /tmp/kds-backend.log 2>&1 &
        BACKEND_PID=$!
        cd ..
        echo "   PID Backend: $BACKEND_PID"
        sleep 3
    else
        echo "✅ Backend déjà actif sur port 3001"
    fi
    
    # Frontend
    if ! lsof -ti:5173 >/dev/null 2>&1; then
        echo "🎨 Démarrage du frontend Vite..."
        npm run dev > /tmp/kds-frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "   PID Frontend: $FRONTEND_PID"
        sleep 3
    else
        echo "✅ Frontend déjà actif sur port 5173"
    fi
    
    echo ""
    echo "⏳ Attente du démarrage des services..."
    sleep 5
    
    # Vérifications
    echo ""
    if lsof -ti:3001 >/dev/null 2>&1; then
        echo "✅ Backend accessible sur http://localhost:3001"
    else
        echo "❌ Backend non accessible - vérifiez /tmp/kds-backend.log"
    fi
    
    if lsof -ti:5173 >/dev/null 2>&1; then
        echo "✅ Frontend accessible sur http://localhost:5173"
    else
        echo "❌ Frontend non accessible - vérifiez /tmp/kds-frontend.log"
    fi
    
    echo ""
    echo "🌐 Ouvrir dans le navigateur: http://localhost:5173"
fi

echo ""
echo "=========================================="
echo "✅ Basculement en mode LOCAL terminé"
echo "=========================================="
echo ""
