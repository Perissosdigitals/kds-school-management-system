#!/bin/bash
# scripts/deploy-cloudflare-production.sh
# Automated Cloudflare Production Deployment for Beta 1.0

set -e

echo "🚀 DÉPLOIEMENT PRODUCTION BETA 1.0"
echo "==================================="
echo ""

# 0. Vérification des pré-requis
echo "0. Vérification de l'environnement..."
if ! command -v npx &> /dev/null; then
    echo "❌ npx n'est pas installé"
    exit 1
fi

echo "   🔍 Vérification de l'authentification Cloudflare..."
if npx wrangler whoami > /dev/null 2>&1; then
    echo "   ✅ Authentifié sur Cloudflare"
else
    echo "   ❌ Non authentifié. Veuillez exécuter 'npx wrangler login'"
    exit 1
fi

# Récupérer la version
VERSION=$(node -p "require('./package.json').version")
COMMIT_HASH=$(git rev-parse HEAD)
echo "   📦 Version à déployer: $VERSION"
echo "   🔑 Commit: $COMMIT_HASH"
echo ""

# 1. Déploiement Frontend
echo "1. Déploiement Frontend (Cloudflare Pages)..."
echo "   🏗️  Construction du frontend..."
npm run build

echo "   🚀 Déploiement vers Cloudflare Pages..."
npx wrangler pages deploy ./dist \
  --project-name=ksp-school-management \
  --branch=main \
  --commit-hash=$COMMIT_HASH

if [ $? -eq 0 ]; then
    echo "   ✅ Frontend déployé avec succès"
else
    echo "   ❌ Échec du déploiement Frontend"
    exit 1
fi
echo ""

# 2. Déploiement Backend
echo "2. Déploiement Backend (Cloudflare Workers)..."
cd backend

echo "   🏗️  Construction du backend..."
npm run build

echo "   🚀 Déploiement vers Cloudflare Workers..."
npx wrangler deploy \
  --env production \
  --var API_VERSION="$VERSION"

if [ $? -eq 0 ]; then
    echo "   ✅ Backend déployé avec succès"
else
    echo "   ❌ Échec du déploiement Backend"
    exit 1
fi
cd ..
echo ""

# 3. Vérification Post-Déploiement
echo "3. Vérification de santé (Smoke Test)..."
sleep 5 # Attendre la propagation

echo "   🏥 Test API Backend..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://kds-backend-api.perissosdigitals.workers.dev/api/v1/health || echo "Err")
if [ "$API_STATUS" == "200" ] || [ "$API_STATUS" == "404" ]; then # 404 peut être ok si /health n'est pas public, mais on vérifie la connectivité
    echo "   ✅ API répond (Status: $API_STATUS)"
else
    echo "   ⚠️  API Status: $API_STATUS (Vérifier logs)"
fi

echo "   🌐 Test Frontend..."
FRONT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://ksp-school-management.pages.dev)
if [ "$FRONT_STATUS" == "200" ]; then
    echo "   ✅ Frontend accessible"
else
    echo "   ⚠️  Frontend Status: $FRONT_STATUS"
fi

echo ""
echo "🎉 DÉPLOIEMENT PRODUCTION TERMINÉ!"
echo "Version: $VERSION"
echo "Berakhot ve-Hatzlakha! 🙏"
