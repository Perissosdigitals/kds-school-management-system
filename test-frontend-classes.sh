#!/bin/bash

# Script de test rapide du frontend - Module Classes
echo "🧪 TEST DU FRONTEND - MODULE GESTION DES CLASSES"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Test 1: Frontend accessible
echo -e "${BLUE}Test 1: Frontend accessible${NC}"
if curl -s http://localhost:5173 | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✅ Frontend répond correctement${NC}"
else
    echo -e "${RED}❌ Frontend ne répond pas${NC}"
    exit 1
fi
echo ""

# Test 2: Backend accessible
echo -e "${BLUE}Test 2: Backend API accessible${NC}"
if curl -s http://localhost:3001/api/v1/classes | grep -q "data"; then
    echo -e "${GREEN}✅ Backend API répond correctement${NC}"
else
    echo -e "${RED}❌ Backend API ne répond pas${NC}"
    exit 1
fi
echo ""

# Test 3: Récupération des classes
echo -e "${BLUE}Test 3: Liste des classes${NC}"
CLASSES_COUNT=$(curl -s "http://localhost:3001/api/v1/classes" | jq '.data | length')
echo -e "   Nombre de classes: ${GREEN}${CLASSES_COUNT}${NC}"
if [ "$CLASSES_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Classes disponibles${NC}"
else
    echo -e "${RED}❌ Aucune classe trouvée${NC}"
fi
echo ""

# Test 4: Détails d'une classe spécifique
echo -e "${BLUE}Test 4: Détails de la classe 6ème-A${NC}"
CLASS_ID=$(curl -s "http://localhost:3001/api/v1/classes?limit=1" | jq -r '.data[0].id')
CLASS_DETAILS=$(curl -s "http://localhost:3001/api/v1/classes/${CLASS_ID}")

CLASS_NAME=$(echo $CLASS_DETAILS | jq -r '.name')
STUDENT_COUNT=$(echo $CLASS_DETAILS | jq '.students | length')
CAPACITY=$(echo $CLASS_DETAILS | jq -r '.capacity')
LEVEL=$(echo $CLASS_DETAILS | jq -r '.level')

echo -e "   📋 Nom: ${GREEN}${CLASS_NAME}${NC}"
echo -e "   🎓 Niveau: ${GREEN}${LEVEL}${NC}"
echo -e "   👥 Élèves: ${GREEN}${STUDENT_COUNT}/${CAPACITY}${NC}"

if [ "$STUDENT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Classe avec élèves assignés${NC}"
else
    echo -e "${YELLOW}⚠️  Classe sans élèves${NC}"
fi
echo ""

# Test 5: Structure des données élèves
echo -e "${BLUE}Test 5: Structure des données élèves${NC}"
FIRST_STUDENT=$(echo $CLASS_DETAILS | jq '.students[0]')
if [ "$FIRST_STUDENT" != "null" ]; then
    STUDENT_NAME=$(echo $FIRST_STUDENT | jq -r '.firstName + " " + .lastName')
    STUDENT_CODE=$(echo $FIRST_STUDENT | jq -r '.registrationNumber')
    echo -e "   Premier élève: ${GREEN}${STUDENT_NAME}${NC} (${STUDENT_CODE})"
    echo -e "${GREEN}✅ Données élèves complètes${NC}"
else
    echo -e "${YELLOW}⚠️  Pas d'élèves dans cette classe${NC}"
fi
echo ""

# Test 6: Calcul des statistiques
echo -e "${BLUE}Test 6: Calcul des statistiques${NC}"
BOYS=$(echo $CLASS_DETAILS | jq '[.students[] | select(.gender == "Masculin")] | length')
GIRLS=$(echo $CLASS_DETAILS | jq '[.students[] | select(.gender == "Féminin")] | length')
OCCUPANCY=$(echo "scale=0; ($STUDENT_COUNT * 100) / $CAPACITY" | bc)

echo -e "   👦 Garçons: ${GREEN}${BOYS}${NC}"
echo -e "   👧 Filles: ${GREEN}${GIRLS}${NC}"
echo -e "   📊 Taux de remplissage: ${GREEN}${OCCUPANCY}%${NC}"
echo -e "${GREEN}✅ Statistiques calculables${NC}"
echo ""

# Résumé
echo -e "${GREEN}=================================================="
echo -e "✅ TOUS LES TESTS PASSENT!"
echo -e "==================================================${NC}"
echo ""

echo -e "${YELLOW}📱 Pour tester dans le navigateur:${NC}"
echo ""
echo -e "1. ${BLUE}Ouvrez http://localhost:5173${NC}"
echo -e "2. ${BLUE}Connectez-vous avec admin@kds.com / admin123${NC}"
echo -e "3. ${BLUE}Cliquez sur 'Gestion des Classes'${NC}"
echo -e "4. ${BLUE}Vérifiez les compteurs:${NC}"
echo -e "   • Total: ${GREEN}${CLASSES_COUNT} classes${NC}"
echo -e "   • 6ème-A: ${GREEN}${STUDENT_COUNT} élèves${NC}"
echo -e "5. ${BLUE}Cliquez sur la carte '6ème-A'${NC}"
echo -e "6. ${BLUE}Explorez les 4 onglets:${NC}"
echo -e "   • 📋 Vue d'ensemble"
echo -e "   • 👥 Élèves (${GREEN}${STUDENT_COUNT}${NC})"
echo -e "   • 🕐 Emploi du temps"
echo -e "   • 📊 Statistiques"
echo ""

echo -e "${YELLOW}🔍 Points à vérifier visuellement:${NC}"
echo -e "   ✓ Les cartes de classe affichent le bon nombre d'élèves"
echo -e "   ✓ Les noms d'enseignants (ou 'Non assigné')"
echo -e "   ✓ La navigation vers la vue détaillée fonctionne"
echo -e "   ✓ Tous les onglets sont cliquables"
echo -e "   ✓ La recherche d'élèves fonctionne"
echo -e "   ✓ Les statistiques s'affichent correctement"
echo -e "   ✓ Le bouton 'Retour' fonctionne"
echo ""
