#!/bin/bash

# ========================================================================
# Script d'importation des emplois du temps de test
# ========================================================================

set -e

echo "🎓 KDS School Management - Import des emplois du temps de test"
echo "================================================================"
echo ""

# Vérifier que PostgreSQL est accessible
echo "📡 Vérification de la connexion PostgreSQL..."
if ! docker exec kds-postgres pg_isready -U kds_admin -d kds_school_db > /dev/null 2>&1; then
    echo "❌ PostgreSQL n'est pas accessible. Veuillez démarrer la base de données."
    echo "   Commande: cd backend && docker-compose up -d postgres"
    exit 1
fi
echo "✅ PostgreSQL est accessible"
echo ""

# Exécuter le script SQL
echo "📚 Import des emplois du temps..."
docker exec -i kds-postgres psql -U kds_admin -d kds_school_db < scripts/seed-timetables.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================================"
    echo "✅ Import des emplois du temps terminé avec succès!"
    echo ""
    echo "📊 Statistiques:"
    echo "   - 6ème-A: Emploi du temps complet (Lun-Ven)"
    echo "   - CM2-A: Emploi du temps complet (Lun-Ven)"
    echo ""
    echo "🌐 Accédez au module 'Gestion de classe' pour consulter"
    echo "   les emplois du temps: http://localhost:5173"
    echo "================================================================"
else
    echo ""
    echo "❌ Erreur lors de l'import des emplois du temps"
    exit 1
fi
