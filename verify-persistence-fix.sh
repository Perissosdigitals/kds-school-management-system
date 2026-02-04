#!/bin/bash

# Script de Vérification - Persistence Frontend
# Date: 22 Janvier 2026

echo "🔍 Vérification de la Persistence des Données Frontend"
echo "======================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier que le backend tourne
echo "1️⃣  Vérification Backend..."
if curl -s http://localhost:3002/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend opérationnel (port 3002)${NC}"
else
    echo -e "${RED}❌ Backend non accessible${NC}"
    echo "   Lancez: cd backend && npm run dev"
    exit 1
fi

# 2. Vérifier que le frontend tourne
echo ""
echo "2️⃣  Vérification Frontend..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend opérationnel (port 5173)${NC}"
else
    echo -e "${RED}❌ Frontend non accessible${NC}"
    echo "   Lancez: npm run dev"
    exit 1
fi

# 3. Vérifier PostgreSQL
echo ""
echo "3️⃣  Vérification PostgreSQL..."
if lsof -i :5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL actif (port 5432)${NC}"
    POSTGRES_PROCESS=$(lsof -i :5432 | grep LISTEN | awk '{print $1}' | head -1)
    echo "   Process: $POSTGRES_PROCESS"
else
    echo -e "${RED}❌ PostgreSQL non actif${NC}"
    exit 1
fi

# 4. Test API - Login
echo ""
echo "4️⃣  Test API - Authentification..."
TOKEN=$(curl -s -X POST http://localhost:3002/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@kds.ci","password":"password123"}' \
    | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login réussi${NC}"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ Login échoué${NC}"
    exit 1
fi

# 5. Test API - Récupération Attendance
echo ""
echo "5️⃣  Test API - Données Attendance..."
ATTENDANCE_COUNT=$(curl -s "http://localhost:3002/api/v1/attendance?limit=100" \
    -H "Authorization: Bearer $TOKEN" \
    | grep -o '"data":\[' | wc -l)

if [ "$ATTENDANCE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ API Attendance accessible${NC}"
    
    # Vérifier les valeurs de status
    echo ""
    echo "   📊 Échantillon de statuts:"
    curl -s "http://localhost:3002/api/v1/attendance?limit=5" \
        -H "Authorization: Bearer $TOKEN" \
        | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    records = data.get('data', [])
    for r in records[:5]:
        student = r.get('student', {})
        name = f\"{student.get('lastName', 'N/A')} {student.get('firstName', 'N/A')}\"
        status = r.get('status', 'N/A')
        print(f'      - {name}: \"{status}\"')
except:
    print('      (Erreur parsing JSON)')
"
else
    echo -e "${YELLOW}⚠️  Aucune donnée d'attendance trouvée${NC}"
fi

# 6. Vérifier les fichiers modifiés
echo ""
echo "6️⃣  Vérification des Modifications..."

# Check types.ts
if grep -q "export enum AttendanceStatus" types.ts 2>/dev/null; then
    echo -e "${GREEN}✅ types.ts - Enum AttendanceStatus présent${NC}"
else
    echo -e "${RED}❌ types.ts - Enum AttendanceStatus manquant${NC}"
fi

# Check attendance.service.ts
if grep -q "mapStatusFromBackend" src/services/api/attendance.service.ts 2>/dev/null; then
    echo -e "${GREEN}✅ attendance.service.ts - Fonction de mapping présente${NC}"
else
    echo -e "${RED}❌ attendance.service.ts - Fonction de mapping manquante${NC}"
fi

# Check AttendanceDailyEntry.tsx
if grep -q "loadingAttendance" src/components/attendance/AttendanceDailyEntry.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ AttendanceDailyEntry.tsx - État loadingAttendance ajouté${NC}"
else
    echo -e "${YELLOW}⚠️  AttendanceDailyEntry.tsx - État loadingAttendance manquant${NC}"
fi

# Check if setAttendanceEntries({}) is commented
if grep -q "// setAttendanceEntries({});" src/components/attendance/AttendanceDailyEntry.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ AttendanceDailyEntry.tsx - Clear commenté${NC}"
else
    echo -e "${YELLOW}⚠️  AttendanceDailyEntry.tsx - Clear peut-être pas commenté${NC}"
fi

# 7. Résumé
echo ""
echo "======================================================="
echo "📋 RÉSUMÉ"
echo "======================================================="
echo ""
echo -e "${GREEN}✅ Backend:${NC} http://localhost:3002"
echo -e "${GREEN}✅ Frontend:${NC} http://localhost:5173"
echo -e "${GREEN}✅ PostgreSQL:${NC} Port 5432"
echo -e "${GREEN}✅ API:${NC} Fonctionnelle"
echo ""
echo "🧪 PROCHAINE ÉTAPE:"
echo "   1. Ouvrez http://localhost:5173 dans votre navigateur"
echo "   2. Ouvrez la Console Développeur (F12)"
echo "   3. Login: admin@kds.ci / password123"
echo "   4. Allez dans 'Gestion des Classes' → CP1 → Présences"
echo "   5. Vérifiez les logs dans la console"
echo "   6. Marquez quelques élèves comme Absent"
echo "   7. Sauvegardez"
echo "   8. Rafraîchissez la page (F5)"
echo "   9. Vérifiez que les données persistent ✅"
echo ""
echo "📄 Documentation:"
echo "   - SOLUTION_FRONTEND_PERSISTENCE.md"
echo "   - TEST_FRONTEND_PERSISTENCE.md"
echo "   - test-attendance-frontend.html"
echo ""
echo -e "${GREEN}Berakhot ve-Hatzlakha! 🙏${NC}"
