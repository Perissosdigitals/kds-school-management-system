#!/bin/bash
# scripts/prepare-beta-release.sh
# Preparation script for Beta 1.0 Release

echo "🚀 PRÉPARATION DE LA VERSION BETA 1.0"
echo "======================================"
echo ""

# 1. Vérifier l'état git
echo "1. Vérification de l'état Git..."
UNCOMMITTED=$(git status --porcelain | grep -v "^\?")
if [ -z "$UNCOMMITTED" ]; then
  echo "   ✅ Répertoire propre (pas de modifications non committées)"
else
  echo "   ℹ️  Fichiers modifiés détectés (normal avant release):"
  git status --porcelain | grep -v "^\?" | head -10
  TOTAL_FILES=$(git status --porcelain | grep -v "^\?" | wc -l)
  echo "   📊 Total: $TOTAL_FILES fichiers modifiés"
fi
echo ""

# 2. Nettoyer les fichiers temporaires
echo "2. Nettoyage des fichiers temporaires..."
CLEANED=0

# Supprimer les fichiers .log
if [ $(find . -name "*.log" -type f | wc -l) -gt 0 ]; then
  find . -name "*.log" -type f -delete
  CLEANED=$((CLEANED + $(find . -name "*.log" -type f 2>/dev/null | wc -l)))
  echo "   ✅ Fichiers .log supprimés"
fi

# Supprimer les fichiers .tmp
if [ $(find . -name "*.tmp" -type f | wc -l) -gt 0 ]; then
  find . -name "*.tmp" -type f -delete
  CLEANED=$((CLEANED + 1))
  echo "   ✅ Fichiers .tmp supprimés"
fi

# Supprimer .env.local s'il existe
if [ -f ".env.local" ]; then
  rm .env.local
  echo "   ✅ .env.local supprimé"
fi

echo "   📊 Nettoyage terminé"
echo ""

# 3. Vérifier .gitignore
echo "3. Vérification .gitignore..."
GITIGNORE_OK=true

if ! grep -q "node_modules" .gitignore; then
  echo "   ⚠️  ATTENTION: 'node_modules' manquant dans .gitignore"
  GITIGNORE_OK=false
fi

if ! grep -q ".env" .gitignore; then
  echo "   ⚠️  ATTENTION: '.env' patterns manquants dans .gitignore"
  GITIGNORE_OK=false
fi

if ! grep -q "*.log" .gitignore; then
  echo "   ⚠️  ATTENTION: '*.log' manquant dans .gitignore"
  GITIGNORE_OK=false
fi

if [ "$GITIGNORE_OK" = true ]; then
  echo "   ✅ .gitignore correctement configuré"
else
  echo "   ⚠️  Vérifier .gitignore pour fichiers sensibles"
fi
echo ""

# 4. Vérifier la présence des fichiers critiques
echo "4. Vérification des fichiers critiques..."
CRITICAL_FILES=(
  "package.json"
  "wrangler.toml"
  "README.md"
  "backend/package.json"
)

ALL_PRESENT=true
for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ MANQUANT: $file"
    ALL_PRESENT=false
  fi
done
echo ""

# 5. Résumé
echo "📋 RÉSUMÉ DE LA PRÉPARATION"
echo "============================"
if [ "$ALL_PRESENT" = true ] && [ "$GITIGNORE_OK" = true ]; then
  echo "✅ Système prêt pour la création de la version Beta 1.0"
  echo ""
  echo "Prochaine étape:"
  echo "  ./scripts/create-beta-release.sh"
  exit 0
else
  echo "⚠️  Quelques problèmes détectés - vérifier avant de continuer"
  exit 1
fi
