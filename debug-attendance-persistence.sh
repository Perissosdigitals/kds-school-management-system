#!/bin/bash

echo "🔍 DEBUG: Vérification Complète de la Persistence"
echo "=================================================="
echo ""

# Get token
echo "1️⃣  Login..."
TOKEN=$(curl -s -X POST http://localhost:3002/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ksp-school.ci","password":"admin123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    exit 1
fi
echo "✅ Token obtained"
echo ""

# Get classes
echo "2️⃣  Récupération des classes..."
CLASS_ID=$(curl -s "http://localhost:3002/api/v1/classes" \
    -H "Authorization: Bearer $TOKEN" \
    | python3 -c "import sys, json; classes = json.load(sys.stdin); print(classes[0]['id'] if classes else '')")

if [ -z "$CLASS_ID" ]; then
    echo "❌ No classes found"
    exit 1
fi
echo "✅ Class ID: $CLASS_ID"
echo ""

# Get today's date
TODAY=$(date +%Y-%m-%d)
echo "3️⃣  Date: $TODAY"
echo ""

# Get attendance records
echo "4️⃣  Récupération des présences..."
echo "   URL: /attendance/daily/$CLASS_ID?date=$TODAY&period=morning"
echo ""

RESPONSE=$(curl -s "http://localhost:3002/api/v1/attendance/daily/$CLASS_ID?date=$TODAY&period=morning" \
    -H "Authorization: Bearer $TOKEN")

echo "📊 Réponse brute:"
echo "$RESPONSE" | python3 -m json.tool | head -50
echo ""

# Analyze response
echo "📈 Analyse:"
python3 << EOF
import json
import sys

response = '''$RESPONSE'''
try:
    data = json.loads(response)
    
    if isinstance(data, list):
        print(f"✅ Type: Liste (correct)")
        print(f"✅ Nombre d'enregistrements: {len(data)}")
        
        if len(data) > 0:
            print(f"\\n📝 Échantillon des statuts:")
            for i, record in enumerate(data[:5]):
                student = record.get('student', {})
                name = f"{student.get('lastName', 'N/A')} {student.get('firstName', 'N/A')}"
                status = record.get('status', 'N/A')
                print(f"   {i+1}. {name}: \"{status}\" (type: {type(status).__name__})")
            
            # Check status values
            statuses = [r.get('status') for r in data]
            unique_statuses = set(statuses)
            print(f"\\n🎯 Statuts uniques trouvés: {unique_statuses}")
            
            # Check if French or English
            has_french = any(s in ['Présent', 'Absent', 'Retard', 'Excusé'] for s in unique_statuses)
            has_english = any(s in ['present', 'absent', 'late', 'excused'] for s in unique_statuses)
            
            if has_french:
                print("✅ Statuts en FRANÇAIS détectés")
            if has_english:
                print("⚠️  Statuts en ANGLAIS détectés")
        else:
            print("⚠️  Aucun enregistrement trouvé pour cette date/classe")
    else:
        print(f"❌ Type inattendu: {type(data)}")
        print(f"   Données: {data}")
        
except json.JSONDecodeError as e:
    print(f"❌ Erreur JSON: {e}")
    print(f"   Réponse: {response[:200]}")
except Exception as e:
    print(f"❌ Erreur: {e}")
EOF

echo ""
echo "=================================================="
echo "Berakhot! 🙏"
