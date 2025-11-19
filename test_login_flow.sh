#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         TEST DU FLUX DE CONNEXION - KDS SCHOOL                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Fonction pour tester la connexion
test_login() {
    echo "🧪 Test de connexion API..."
    
    response=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -H "Origin: http://localhost:3002" \
      -d '{"email":"fondatrice@kds-school.com","password":"password123"}')
    
    if echo "$response" | grep -q "access_token"; then
        echo "✅ Authentification API: SUCCESS"
        
        # Extraire les données
        token=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        email=$(echo "$response" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
        role=$(echo "$response" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
        firstName=$(echo "$response" | grep -o '"firstName":"[^"]*"' | cut -d'"' -f4)
        lastName=$(echo "$response" | grep -o '"lastName":"[^"]*"' | cut -d'"' -f4)
        
        echo "   📧 Email: $email"
        echo "   👤 Nom: $firstName $lastName"
        echo "   🎭 Rôle: $role"
        echo "   🔑 Token: ${token:0:30}..."
        
        return 0
    else
        echo "❌ Authentification API: FAILED"
        echo "   Response: $response"
        return 1
    fi
}

echo "═══════════════════════════════════════════════════════════════"
echo "📊 VÉRIFICATION DES SERVICES"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Frontend
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ Frontend: http://localhost:3002"
else
    echo "❌ Frontend: HORS LIGNE"
    exit 1
fi

# Backend
if curl -s http://localhost:3001/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{}' > /dev/null 2>&1; then
    echo "✅ Backend: http://localhost:3001/api/v1"
else
    echo "❌ Backend: HORS LIGNE"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🔐 TEST D'AUTHENTIFICATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_login

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📝 INSTRUCTIONS DE TEST MANUEL"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Ouvrir http://localhost:3002 dans votre navigateur"
echo "2. Ouvrir les DevTools (F12) → Console"
echo "3. Vider le localStorage:"
echo "   localStorage.clear()"
echo "4. Actualiser la page (F5)"
echo "5. Vous devriez voir la page de login"
echo "6. Cliquer sur un rôle (ex: Fondatrice)"
echo "7. Observer:"
echo "   ✅ Stockage du token dans localStorage"
echo "   ✅ Redirection vers /dashboard"
echo "   ✅ Affichage du dashboard SANS rechargement manuel"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🔍 Pour déboguer, vérifiez dans la console:"
echo "   console.log('Token:', localStorage.getItem('kds_token'))"
echo "   console.log('User:', localStorage.getItem('kds_user'))"
echo ""
echo "═══════════════════════════════════════════════════════════════"

