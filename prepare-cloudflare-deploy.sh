#!/bin/bash

# Script pour préparer le déploiement Cloudflare

echo ""
echo "🚀 PRÉPARATION DÉPLOIEMENT CLOUDFLARE"
echo "======================================"
echo ""

# Vérifier qu'on est en mode local actuellement
if [ -f ".env.local" ]; then
    API_URL=$(grep "VITE_API_URL" .env.local | cut -d '=' -f2)
    if [[ "$API_URL" == *"localhost"* ]]; then
        echo "✅ Mode actuel: DÉVELOPPEMENT LOCAL"
    fi
fi

echo ""
echo "📋 Vérifications pré-déploiement..."
echo ""

# 1. Tests locaux
echo "1️⃣  Tests locaux:"
if lsof -ti:3001 >/dev/null 2>&1 && lsof -ti:5173 >/dev/null 2>&1; then
    echo "   ✅ Services locaux actifs"
    read -p "   Les tests locaux sont-ils tous passés? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   ❌ Veuillez d'abord tester localement"
        exit 1
    fi
else
    echo "   ⚠️  Services locaux non actifs"
    echo "   Assurez-vous que les tests locaux ont été effectués"
fi

echo ""

# 2. Vérifier .env.production
echo "2️⃣  Configuration production:"
if [ -f ".env.production" ]; then
    PROD_URL=$(grep "VITE_API_URL" .env.production | cut -d '=' -f2)
    if [[ "$PROD_URL" == *"workers.dev"* ]]; then
        echo "   ✅ .env.production correctement configuré"
        echo "   → $PROD_URL"
    else
        echo "   ❌ .env.production ne pointe pas vers Cloudflare Workers"
        exit 1
    fi
else
    echo "   ❌ .env.production introuvable"
    exit 1
fi

echo ""

# 3. Git status
echo "3️⃣  État Git:"
if git diff --quiet && git diff --cached --quiet; then
    echo "   ✅ Pas de modifications non commitées"
else
    echo "   ⚠️  Modifications non commitées détectées"
    echo ""
    git status --short
    echo ""
    read -p "   Voulez-vous commiter maintenant? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "   Message de commit: " COMMIT_MSG
        git add .
        git commit -m "$COMMIT_MSG"
        echo "   ✅ Changements committés"
    else
        echo "   ⚠️  Continuez sans commiter (non recommandé)"
    fi
fi

echo ""

# 4. Build de production
echo "4️⃣  Build de production:"
echo "   Construction avec mode production..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "   ✅ Build réussi"
    
    # Vérifier que le build contient l'URL Cloudflare
    if grep -r "workers.dev" dist/ >/dev/null 2>&1; then
        echo "   ✅ Build contient l'URL Cloudflare Workers"
    else
        echo "   ⚠️  URL Cloudflare Workers non trouvée dans le build"
        echo "   Vérifiez que .env.production est correct"
    fi
else
    echo ""
    echo "   ❌ Échec du build"
    exit 1
fi

echo ""

# 5. Prévisualisation (optionnel)
echo "5️⃣  Prévisualisation:"
read -p "   Voulez-vous prévisualiser le build? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Démarrage de la prévisualisation..."
    echo "   Ouvrir: http://localhost:4173"
    echo "   Appuyez sur Ctrl+C pour arrêter"
    echo ""
    npm run preview
fi

echo ""

# 6. Déploiement
echo "6️⃣  Déploiement:"
read -p "   Voulez-vous déployer sur Cloudflare Pages maintenant? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "   🚀 Déploiement sur Cloudflare Pages..."
    echo ""
    
    npm run deploy
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "   ✅ Déploiement réussi!"
        echo ""
        echo "   🌐 URL Frontend: https://kds-school-management.pages.dev"
        echo "   🌐 URL Backend:  https://kds-backend-api.perissosdigitals.workers.dev"
        echo ""
        echo "   Testez l'application déployée avant de confirmer"
    else
        echo ""
        echo "   ❌ Échec du déploiement"
        exit 1
    fi
else
    echo ""
    echo "   ⏸️  Déploiement annulé"
    echo ""
    echo "   Pour déployer plus tard: npm run deploy"
fi

echo ""
echo "=========================================="
echo "✅ Préparation terminée"
echo "=========================================="
echo ""

# Rappel de revenir en mode local
echo "💡 RAPPEL:"
echo "   Après le déploiement, revenez en mode local:"
echo "   → ./switch-to-local.sh"
echo ""
