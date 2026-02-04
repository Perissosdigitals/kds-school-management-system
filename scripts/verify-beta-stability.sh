#!/bin/bash
# scripts/verify-beta-stability.sh
# Stability verification for Beta 1.0

echo "🔍 VÉRIFICATION DE STABILITÉ BETA 1.0"
echo "====================================="
echo ""

ERRORS=0

# 1. Build frontend
echo "1. Build frontend..."
if npm run build > /tmp/frontend-build.log 2>&1; then
  echo "   ✅ Frontend build successful"
  BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
  echo "   📦 Taille du build: $BUILD_SIZE"
else
  echo "   ❌ Frontend build failed"
  echo "   📄 Voir les logs: /tmp/frontend-build.log"
  tail -20 /tmp/frontend-build.log
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Build backend
echo "2. Build backend..."
if (cd backend && npm run build > /tmp/backend-build.log 2>&1); then
  echo "   ✅ Backend build successful"
  if [ -d "backend/dist" ]; then
    BACKEND_SIZE=$(du -sh backend/dist 2>/dev/null | cut -f1)
    echo "   📦 Taille du build: $BACKEND_SIZE"
  fi
else
  echo "   ❌ Backend build failed"
  echo "   📄 Voir les logs: /tmp/backend-build.log"
  tail -20 /tmp/backend-build.log
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Vérifier les versions
echo "3. Vérification des versions..."
if [ -f "package.json" ]; then
  PACKAGE_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
  echo "   📦 package.json: $PACKAGE_VERSION"
else
  echo "   ❌ package.json introuvable"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "version.json" ]; then
  if command -v jq &> /dev/null; then
    VERSION_JSON=$(cat version.json | jq -r '.version' 2>/dev/null)
    echo "   📄 version.json: $VERSION_JSON"
    
    if [ "$PACKAGE_VERSION" = "$VERSION_JSON" ]; then
      echo "   ✅ Versions synchronisées"
    else
      echo "   ⚠️  Versions désynchronisées!"
      echo "      package.json: $PACKAGE_VERSION"
      echo "      version.json: $VERSION_JSON"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo "   ℹ️  jq non installé - impossible de vérifier version.json"
  fi
else
  echo "   ℹ️  version.json non trouvé (sera créé)"
fi
echo ""

# 4. Vérifier git status
echo "4. Vérification état Git..."
if [ -z "$(git status --porcelain)" ]; then
  echo "   ✅ Répertoire Git propre"
else
  UNCOMMITTED=$(git status --porcelain | wc -l)
  echo "   ℹ️  $UNCOMMITTED fichiers non commités (vérifié si normal):"
  git status --porcelain | head -5
  if [ "$UNCOMMITTED" -gt 20 ]; then
    echo "   ⚠️  Beaucoup de fichiers non commités!"
  fi
fi
echo ""

# 5. Vérifier les dépendances critiques
echo "5. Vérification des dépendances..."
CRITICAL_DEPS=("react" "react-dom" "axios")
DEPS_OK=true

for dep in "${CRITICAL_DEPS[@]}"; do
  if grep -q "\"$dep\"" package.json; then
    echo "   ✅ $dep présent"
  else
    echo "   ❌ $dep MANQUANT"
    DEPS_OK=false
    ERRORS=$((ERRORS + 1))
  fi
done

if [ "$DEPS_OK" = true ]; then
  echo "   ✅ Dépendances critiques présentes"
fi
echo ""

# 6. Test smoke (optionnel - décommenter pour tester)
echo "6. Test smoke frontend..."
echo "   ℹ️  Test smoke désactivé (démarrage manuel recommandé)"
echo "   Pour tester manuellement:"
echo "   - npm run dev"
echo "   - Vérifier http://localhost:5173"
echo ""

# Optionnel: Décommenter pour test automatique
# echo "   Démarrage du serveur de dev..."
# timeout 30 npm run dev > /tmp/dev-server.log 2>&1 &
# DEV_PID=$!
# sleep 8
#
# if curl -s http://localhost:5173 > /dev/null 2>&1; then
#   echo "   ✅ Frontend accessible localement"
#   kill $DEV_PID 2>/dev/null
#   pkill -P $DEV_PID 2>/dev/null
# else
#   echo "   ❌ Frontend non accessible"
#   kill $DEV_PID 2>/dev/null
#   pkill -P $DEV_PID 2>/dev/null
#   ERRORS=$((ERRORS + 1))
# fi

# 7. Résumé final
echo "📊 RÉSUMÉ DE VÉRIFICATION"
echo "========================="
if [ $ERRORS -eq 0 ]; then
  echo "✅ BETA 1.0 STABLE ET PRÊTE!"
  echo ""
  echo "🎉 Toutes les vérifications sont passées avec succès!"
  echo ""
  echo "Prochaines étapes recommandées:"
  echo "1. Tester manuellement: npm run dev"
  echo "2. Vérifier les builds: ls -lh dist/ backend/dist/"
  echo "3. Préparer le déploiement Cloudflare"
  echo ""
  echo "Berakhot ve-Hatzlakha Rabbah! 🙏"
  exit 0
else
  echo "⚠️  $ERRORS erreur(s) détectée(s)"
  echo ""
  echo "Veuillez corriger les erreurs avant de déployer."
  echo "Consultez les logs dans /tmp/ pour plus de détails."
  exit 1
fi
