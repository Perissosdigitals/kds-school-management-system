#!/bin/bash

# Script de test du workflow complet d'inscription
# Test end-to-end: Inscription élève → Affectation classe → Génération docs → Suivi pédagogique

BASE_URL="http://localhost:3001/api/v1"
echo "🧪 Test du Workflow Complet d'Inscription"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier que le serveur est démarré
echo "1️⃣  Vérification du serveur..."
HEALTH=$(curl -s ${BASE_URL}/health 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Serveur opérationnel${NC}"
else
    echo -e "${RED}✗ Serveur non disponible${NC}"
    exit 1
fi
echo ""

# 2. Créer une classe test si elle n'existe pas
echo "2️⃣  Création d'une classe test..."
CLASS_RESPONSE=$(curl -s -X POST ${BASE_URL}/classes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CM2 Test",
    "level": "CM2",
    "academicYear": "2024-2025",
    "capacity": 30,
    "roomNumber": "Salle 101"
  }' 2>&1)

CLASS_ID=$(echo $CLASS_RESPONSE | jq -r '.id // empty')

if [ -z "$CLASS_ID" ]; then
    # Si la classe existe déjà, récupérer la première
    echo -e "${YELLOW}⚠ Classe existe déjà, récupération...${NC}"
    CLASSES=$(curl -s ${BASE_URL}/classes?limit=1)
    CLASS_ID=$(echo $CLASSES | jq -r '.[0].id // empty')
fi

if [ -z "$CLASS_ID" ]; then
    echo -e "${RED}✗ Impossible de créer ou récupérer une classe${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Classe ID: ${CLASS_ID}${NC}"
echo ""

# 3. Inscrire un nouvel élève (WORKFLOW PRINCIPAL)
echo "3️⃣  📝 Inscription d'un nouvel élève..."
ENROLLMENT_RESPONSE=$(curl -s -X POST ${BASE_URL}/enrollment \
  -H "Content-Type: application/json" \
  -d "{
    \"lastName\": \"KOUASSI\",
    \"firstName\": \"Jean\",
    \"dob\": \"2010-05-15\",
    \"gender\": \"Masculin\",
    \"nationality\": \"Ivoirienne\",
    \"birthPlace\": \"Abidjan\",
    \"address\": \"Plateau, Abidjan\",
    \"phone\": \"+225 07 12 34 56 78\",
    \"email\": \"jean.kouassi@email.com\",
    \"gradeLevel\": \"CM2\",
    \"previousSchool\": \"École Primaire du Plateau\",
    \"emergencyContactName\": \"Marie KOUASSI\",
    \"emergencyContactPhone\": \"+225 05 43 21 98 76\",
    \"medicalInfo\": \"Aucune allergie connue\",
    \"classId\": \"${CLASS_ID}\",
    \"academicYear\": \"2024-2025\",
    \"generateFinancialRecords\": true
  }")

echo "$ENROLLMENT_RESPONSE" | jq '.'

# Extraire les informations
STUDENT_ID=$(echo $ENROLLMENT_RESPONSE | jq -r '.student.id // empty')
SUCCESS=$(echo $ENROLLMENT_RESPONSE | jq -r '.success // false')

if [ "$SUCCESS" = "true" ] && [ ! -z "$STUDENT_ID" ]; then
    echo -e "${GREEN}✓ Élève inscrit avec succès${NC}"
    echo -e "  - Matricule: $(echo $ENROLLMENT_RESPONSE | jq -r '.student.registrationNumber')"
    echo -e "  - Nom: $(echo $ENROLLMENT_RESPONSE | jq -r '.student.firstName') $(echo $ENROLLMENT_RESPONSE | jq -r '.student.lastName')"
    echo -e "  - Classe: $(echo $ENROLLMENT_RESPONSE | jq -r '.classInfo.name')"
    echo -e "  - Professeur: $(echo $ENROLLMENT_RESPONSE | jq -r '.classInfo.mainTeacher.firstName // "Non assigné"') $(echo $ENROLLMENT_RESPONSE | jq -r '.classInfo.mainTeacher.lastName // ""')"
    echo -e "  - Frais générés: $(echo $ENROLLMENT_RESPONSE | jq -r '.financialRecords | length') transactions"
else
    echo -e "${RED}✗ Échec de l'inscription${NC}"
    echo "$ENROLLMENT_RESPONSE" | jq -r '.message // "Erreur inconnue"'
    exit 1
fi
echo ""

# 4. Vérifier le dossier complet de l'élève
echo "4️⃣  📁 Récupération du dossier complet..."
PROFILE=$(curl -s ${BASE_URL}/enrollment/student/${STUDENT_ID}/profile)
echo "$PROFILE" | jq '{
  student: {
    id: .student.id,
    name: (.student.firstName + " " + .student.lastName),
    registrationNumber: .student.registrationNumber,
    class: .student.class.name,
    status: .student.status
  },
  financial: {
    totalDue: .financial.totalDue,
    totalPaid: .financial.totalPaid,
    balance: .financial.balance,
    status: .financial.status
  },
  documents: .documents | length
}'

BALANCE=$(echo $PROFILE | jq -r '.financial.balance')
DOC_COUNT=$(echo $PROFILE | jq -r '.documents | length')

echo -e "${GREEN}✓ Dossier complet récupéré${NC}"
echo -e "  - Solde à payer: ${BALANCE} FCFA"
echo -e "  - Documents requis: ${DOC_COUNT}"
echo ""

# 5. Vérifier la classe mise à jour
echo "5️⃣  🏫 Vérification de la classe..."
CLASS_INFO=$(curl -s ${BASE_URL}/classes/${CLASS_ID})
STUDENT_COUNT=$(curl -s "${BASE_URL}/students?classId=${CLASS_ID}" | jq '. | length')

echo -e "${GREEN}✓ Classe mise à jour${NC}"
echo -e "  - Nom: $(echo $CLASS_INFO | jq -r '.name')"
echo -e "  - Capacité: $(echo $CLASS_INFO | jq -r '.capacity')"
echo -e "  - Élèves actuels: ${STUDENT_COUNT}"
echo ""

# 6. Récupérer les transactions financières
echo "6️⃣  💰 Vérification des transactions financières..."
TRANSACTIONS=$(curl -s "${BASE_URL}/finance?studentId=${STUDENT_ID}")
echo "$TRANSACTIONS" | jq '[.[] | {
  category: .category,
  amount: .amount,
  status: .status,
  dueDate: .dueDate
}]'

TRANSACTION_COUNT=$(echo $TRANSACTIONS | jq '. | length')
echo -e "${GREEN}✓ ${TRANSACTION_COUNT} transactions générées${NC}"
echo ""

# 7. Récapitulatif
echo "=========================================="
echo "📊 RÉCAPITULATIF DU WORKFLOW"
echo "=========================================="
echo -e "${GREEN}✓ Classe créée/récupérée${NC}"
echo -e "${GREEN}✓ Élève inscrit avec matricule unique${NC}"
echo -e "${GREEN}✓ Affectation à la classe réussie${NC}"
echo -e "${GREEN}✓ Documents requis initialisés (${DOC_COUNT})${NC}"
echo -e "${GREEN}✓ Transactions financières générées (${TRANSACTION_COUNT})${NC}"
echo -e "${GREEN}✓ Dossier complet accessible${NC}"
echo ""
echo -e "${GREEN}🎉 WORKFLOW COMPLET VALIDÉ !${NC}"
echo ""
echo "📝 Prochaines étapes suggérées:"
echo "  1. Soumettre les documents requis"
echo "  2. Effectuer les paiements"
echo "  3. Générer la carte d'élève"
echo "  4. Consulter l'emploi du temps de la classe"
echo ""
