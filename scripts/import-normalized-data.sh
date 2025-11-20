#!/bin/bash

# ============================================
# Import Normalized Data to D1
# ============================================

echo "📥 Import des données normalisées vers D1..."
echo ""

cd "$(dirname "$0")/.." || exit

# Vérifier que le fichier SQL existe
if [ ! -f "cloudflare-d1-import-normalized.sql" ]; then
    echo "❌ Fichier cloudflare-d1-import-normalized.sql non trouvé"
    echo "🔧 Exécutez d'abord: npx tsx scripts/export-to-d1-normalized.ts"
    exit 1
fi

echo "📄 Lecture du fichier cloudflare-d1-import-normalized.sql..."
echo ""

# Lire le fichier SQL et l'importer en plusieurs lots
# (D1 limite à ~1000 commandes par batch)

echo "⚠️  Note: Import manuel par blocs pour éviter les limites D1"
echo ""
echo "🔧 Utilisation de wrangler d1 execute avec le fichier complet..."
echo ""

# Tentative d'import direct (peut échouer si trop de commandes)
npx wrangler d1 execute kds-school-db --remote --file=cloudflare-d1-import-normalized.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Données importées avec succès!"
    echo ""
    echo "📊 Vérification des données..."
    
    # Compter les utilisateurs
    echo "👥 Users:"
    npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM users"
    
    echo ""
    echo "👨‍🏫 Teachers:"
    npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM teachers"
    
    echo ""
    echo "👨‍🎓 Students:"
    npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM students"
    
    echo ""
    echo "✅ Import terminé avec succès!"
else
    echo ""
    echo "⚠️  L'import direct a échoué (probablement trop de commandes)"
    echo ""
    echo "📝 Solution alternative: Import manuel par blocs"
    echo ""
    echo "Étapes:"
    echo "1. Ouvrir cloudflare-d1-import-normalized.sql"
    echo "2. Copier les INSERT pour USERS (environ 100 lignes)"
    echo "3. Exécuter: npx wrangler d1 execute kds-school-db --remote --command=\"<paste SQL>\""
    echo "4. Répéter pour TEACHERS et STUDENTS"
    echo ""
    echo "Ou utiliser l'interface web Cloudflare Dashboard:"
    echo "https://dash.cloudflare.com > Workers & Pages > D1 > kds-school-db > Console"
fi
