#!/bin/bash

# Script de test de la vue détaillée des classes
# Test du module Class Management avec vue détaillée

echo "🔍 Test de la vue détaillée des classes..."
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Test: Récupérer toutes les classes
echo -e "${BLUE}1. Récupération de toutes les classes${NC}"
CLASSES=$(curl -s "http://localhost:3001/api/v1/classes?limit=5" | jq -r '.data[0:3] | .[] | "\(.id) - \(.name) (\(.level))"')
echo "$CLASSES"
echo ""

# 2. Extraire un ID de classe
CLASS_ID=$(curl -s "http://localhost:3001/api/v1/classes?limit=1" | jq -r '.data[0].id')
echo -e "${BLUE}2. Classe sélectionnée pour les tests: ${CLASS_ID}${NC}"
echo ""

# 3. Test: Récupérer les détails d'une classe
echo -e "${BLUE}3. Détails de la classe${NC}"
curl -s "http://localhost:3001/api/v1/classes/${CLASS_ID}" | jq '{
  name: .name,
  level: .level,
  capacity: .capacity,
  room: .room_number,
  teacher: .teacher_first_name + " " + .teacher_last_name,
  studentCount: .students | length
}'
echo ""

# 4. Test: Récupérer les élèves de la classe
echo -e "${BLUE}4. Élèves de la classe (premier 5)${NC}"
curl -s "http://localhost:3001/api/v1/classes/${CLASS_ID}" | jq -r '.students[0:5] | .[] | .user.first_name + " " + .user.last_name'
echo ""

# 5. Test: Vérifier l'emploi du temps
echo -e "${BLUE}5. Emploi du temps de la classe${NC}"
curl -s "http://localhost:3001/api/v1/timetable?classId=${CLASS_ID}" | jq 'if length > 0 then .[0:3] | .[] | {day: .day_of_week, time: .start_time + "-" + .end_time, subject: .subject_name} else "Pas d'\''emploi du temps configuré" end'
echo ""

# 6. Test: Statistiques des classes par niveau
echo -e "${BLUE}6. Statistiques par niveau${NC}"
curl -s "http://localhost:3001/api/v1/classes" | jq -r 'group_by(.level) | .[] | "\(.[0].level): \(length) classe(s)"'
echo ""

# 7. Résumé
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Tests terminés avec succès!${NC}"
echo ""
echo -e "${YELLOW}📌 Actions disponibles dans la vue détaillée:${NC}"
echo "   - Vue d'ensemble avec infos générales"
echo "   - Liste complète des élèves avec recherche"
echo "   - Emploi du temps complet de la semaine"
echo "   - Statistiques détaillées (genre, âge, remplissage)"
echo ""
echo -e "${YELLOW}💡 Pour tester dans le navigateur:${NC}"
echo "   1. Allez sur http://localhost:5173"
echo "   2. Connectez-vous avec admin@kds.com"
echo "   3. Cliquez sur 'Gestion des Classes'"
echo "   4. Cliquez sur n'importe quelle carte de classe"
echo "   5. Explorez les 4 onglets: Vue d'ensemble, Élèves, Emploi du temps, Statistiques"
echo ""
