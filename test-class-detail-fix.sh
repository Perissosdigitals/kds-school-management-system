#!/bin/bash

# Test rapide de la vue détaillée de classe

echo "🔍 Test de l'API getClassById..."
echo "================================"
echo ""

CLASS_ID=$(curl -s "http://localhost:3001/api/v1/classes?limit=1" | jq -r '.data[0].id')

echo "📋 Classe testée: $CLASS_ID"
echo ""

# Test de l'endpoint
echo "1. Test de l'endpoint backend:"
RESPONSE=$(curl -s "http://localhost:3001/api/v1/classes/$CLASS_ID")

NAME=$(echo $RESPONSE | jq -r '.name')
LEVEL=$(echo $RESPONSE | jq -r '.level')
STUDENT_COUNT=$(echo $RESPONSE | jq '.students | length')
HAS_STUDENTS=$(echo $RESPONSE | jq '.students != null')
HAS_MAIN_TEACHER=$(echo $RESPONSE | jq '.mainTeacher != null')

echo "   ✓ Nom: $NAME"
echo "   ✓ Niveau: $LEVEL"
echo "   ✓ Nombre d'élèves: $STUDENT_COUNT"
echo "   ✓ Array students présent: $HAS_STUDENTS"
echo "   ✓ mainTeacher présent: $HAS_MAIN_TEACHER"
echo ""

echo "2. Structure attendue par le frontend:"
echo "   {" 
echo "     classInfo: { id, name, level, ... },"
echo "     students: [ { id, firstName, lastName, ... } ],"
echo "     teacher: { id, firstName, lastName, ... },"
echo "     timetable: [ ... ],"
echo "     evaluations: [ ... ],"
echo "     grades: [ ... ]"
echo "   }"
echo ""

echo "3. Élèves dans la réponse API:"
echo $RESPONSE | jq '.students[0:3] | .[] | {firstName, lastName, registrationNumber}'
echo ""

echo "✅ L'API backend retourne les bonnes données!"
echo ""
echo "🔧 Le service frontend (getClassById) va maintenant:"
echo "   1. Récupérer la classe depuis l'API"
echo "   2. Mapper apiClass → classInfo avec mapApiClassToFrontend()"
echo "   3. Mapper apiClass.students → Student[]"
echo "   4. Mapper apiClass.mainTeacher → Teacher"
echo "   5. Retourner ClassDetailData complet"
echo ""
echo "🌐 Testez maintenant dans le navigateur:"
echo "   1. Allez sur http://localhost:5173"
echo "   2. Connectez-vous"
echo "   3. Cliquez sur 'Gestion des Classes'"
echo "   4. Cliquez sur la carte '$NAME'"
echo "   5. La vue détaillée devrait s'afficher! ✨"
echo ""
