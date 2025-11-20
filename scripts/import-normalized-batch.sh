#!/bin/bash

# ============================================
# Import Normalized Data to D1 (Batch Import)
# ============================================

echo "📥 Import des données normalisées vers D1 par blocs..."
echo ""

cd "$(dirname "$0")/.." || exit

# Vérifier que le fichier SQL existe
if [ ! -f "cloudflare-d1-import-normalized.sql" ]; then
    echo "❌ Fichier cloudflare-d1-import-normalized.sql non trouvé"
    echo "🔧 Exécutez d'abord: npx tsx scripts/export-to-d1-normalized.ts"
    exit 1
fi

echo "📄 Lecture et séparation du fichier SQL..."

# Extraire les sections du fichier
csplit -s -f temp_sql_ -b "%02d.sql" cloudflare-d1-import-normalized.sql '/^-- ============================================$/' '{*}'

# Compter les fichiers créés
file_count=$(ls temp_sql_*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$file_count" -eq 0 ]; then
    echo "⚠️  Aucune section trouvée. Import direct..."
    npx wrangler d1 execute kds-school-db --remote --file=cloudflare-d1-import-normalized.sql
    exit $?
fi

echo "📦 $file_count sections détectées"
echo ""

# Importer chaque section
success_count=0
fail_count=0

for file in temp_sql_*.sql; do
    # Ignorer les fichiers vides
    if [ ! -s "$file" ]; then
        rm "$file"
        continue
    fi
    
    section_name=$(head -n 2 "$file" | tail -n 1 | sed 's/-- //' | sed 's/ *$//')
    
    echo "📥 Import: $section_name"
    
    if npx wrangler d1 execute kds-school-db --remote --file="$file" 2>/dev/null; then
        echo "   ✅ OK"
        ((success_count++))
    else
        echo "   ⚠️  Erreur (peut-être trop de commandes, continuons...)"
        ((fail_count++))
    fi
    
    rm "$file"
done

echo ""
echo "📊 Résultat: $success_count sections OK, $fail_count avec erreurs"
echo ""

# Vérification finale
echo "📊 Vérification des données importées..."
echo ""

echo "👥 Users:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM users WHERE role='teacher'"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM users WHERE role='student'"

echo ""
echo "👨‍🏫 Teachers:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM teachers"

echo ""
echo "👨‍🎓 Students:"
npx wrangler d1 execute kds-school-db --remote --command="SELECT COUNT(*) as count FROM students"

echo ""

if [ "$fail_count" -gt 0 ]; then
    echo "⚠️  Certaines sections ont échoué."
    echo ""
    echo "💡 Solution alternative: Import manuel via Cloudflare Dashboard"
    echo "   https://dash.cloudflare.com > Workers & Pages > D1 > kds-school-db > Console"
    echo ""
    echo "   Ou exécuter les commandes en plus petits lots:"
    echo "   1. Ouvrir cloudflare-d1-import-normalized.sql"
    echo "   2. Copier 10-20 INSERT à la fois"
    echo "   3. Exécuter via: npx wrangler d1 execute kds-school-db --remote --command=\"<paste>\""
    exit 1
else
    echo "✅ Import terminé avec succès!"
fi
