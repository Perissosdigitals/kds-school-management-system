#!/bin/bash

# ============================================================================
# KSP School Management System - Project Audit Script
# Analyse approfondie pour identifier les fonctionnalités manquantes
# ============================================================================

echo "🔍 KSP Project Audit - $(date '+%Y-%m-%d %H:%M')"
echo "============================================================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs globaux
TOTAL_ISSUES=0
CRITICAL=0
HIGH=0
MEDIUM=0
LOW=0

# Fonction pour ajouter une issue
add_issue() {
    local severity=$1
    local category=$2
    local message=$3
    ((TOTAL_ISSUES++))
    case $severity in
        "CRITICAL") ((CRITICAL++)); echo -e "${RED}[CRITICAL]${NC} [$category] $message" ;;
        "HIGH") ((HIGH++)); echo -e "${YELLOW}[HIGH]${NC} [$category] $message" ;;
        "MEDIUM") ((MEDIUM++)); echo -e "${BLUE}[MEDIUM]${NC} [$category] $message" ;;
        "LOW") ((LOW++)); echo -e "${GREEN}[LOW]${NC} [$category] $message" ;;
    esac
}

echo ""
echo "📂 1. ANALYSE DES COMPOSANTS FRONTEND"
echo "--------------------------------------"

# Vérifier les composants de vue détail
DETAIL_VIEWS=("StudentDetail" "TeacherDetail" "ClassDetail" "GradeDetail" "AttendanceDetail" "ParentDetail")
for view in "${DETAIL_VIEWS[@]}"; do
    if ! find components -name "*${view}*" -type f 2>/dev/null | grep -q .; then
        add_issue "HIGH" "FRONTEND" "Vue détail manquante: ${view}View.tsx"
    fi
done

# Vérifier les formulaires CRUD
CRUD_FORMS=("StudentForm" "TeacherForm" "ClassForm" "SubjectForm" "GradeForm" "AttendanceForm" "UserForm")
for form in "${CRUD_FORMS[@]}"; do
    found=$(find components -name "*${form}*" -o -name "*${form%Form}Registration*" -o -name "*${form%Form}Entry*" 2>/dev/null | head -1)
    if [ -z "$found" ]; then
        add_issue "MEDIUM" "FRONTEND" "Formulaire CRUD potentiellement manquant: ${form}.tsx"
    fi
done

# Vérifier les modales de confirmation/suppression
if ! grep -r "DeleteConfirm\|ConfirmDelete\|DeleteModal" components/ 2>/dev/null | grep -q .; then
    add_issue "MEDIUM" "FRONTEND" "Modale de confirmation de suppression manquante"
fi

echo ""
echo "🔌 2. ANALYSE DES SERVICES API"
echo "--------------------------------------"

# Services requis
REQUIRED_SERVICES=("students" "teachers" "classes" "grades" "attendance" "auth" "users" "subjects" "parents" "documents" "finance")
for service in "${REQUIRED_SERVICES[@]}"; do
    if ! find services -name "*${service}*" -type f 2>/dev/null | grep -q .; then
        add_issue "HIGH" "SERVICES" "Service API manquant: ${service}.service.ts"
    fi
done

# Vérifier les méthodes CRUD dans chaque service
echo ""
echo "   Vérification des méthodes CRUD par service:"
for svc in services/api/*.ts services/*.ts 2>/dev/null; do
    if [ -f "$svc" ]; then
        svc_name=$(basename "$svc" .ts)
        has_create=$(grep -c "create\|post\|POST" "$svc" 2>/dev/null || echo 0)
        has_read=$(grep -c "get\|GET\|find\|fetch" "$svc" 2>/dev/null || echo 0)
        has_update=$(grep -c "update\|put\|PUT\|patch\|PATCH" "$svc" 2>/dev/null || echo 0)
        has_delete=$(grep -c "delete\|DELETE\|remove" "$svc" 2>/dev/null || echo 0)
        
        if [ "$has_create" -eq 0 ]; then
            add_issue "MEDIUM" "SERVICES" "${svc_name}: méthode CREATE manquante"
        fi
        if [ "$has_update" -eq 0 ]; then
            add_issue "MEDIUM" "SERVICES" "${svc_name}: méthode UPDATE manquante"
        fi
        if [ "$has_delete" -eq 0 ]; then
            add_issue "MEDIUM" "SERVICES" "${svc_name}: méthode DELETE manquante"
        fi
    fi
done

echo ""
echo "🗄️ 3. ANALYSE DU BACKEND"
echo "--------------------------------------"

# Vérifier les controllers NestJS
REQUIRED_CONTROLLERS=("students" "teachers" "classes" "grades" "attendance" "auth" "users" "subjects" "parents" "documents" "finance" "enrollment")
for ctrl in "${REQUIRED_CONTROLLERS[@]}"; do
    if ! find backend -name "*${ctrl}*.controller.ts" -type f 2>/dev/null | grep -q .; then
        add_issue "CRITICAL" "BACKEND" "Controller manquant: ${ctrl}.controller.ts"
    else
        ctrl_file=$(find backend -name "*${ctrl}*.controller.ts" -type f 2>/dev/null | head -1)
        # Vérifier les méthodes HTTP
        has_post=$(grep -c "@Post\|@HttpCode.*CREATED" "$ctrl_file" 2>/dev/null || echo 0)
        has_get=$(grep -c "@Get" "$ctrl_file" 2>/dev/null || echo 0)
        has_put=$(grep -c "@Put\|@Patch" "$ctrl_file" 2>/dev/null || echo 0)
        has_delete=$(grep -c "@Delete" "$ctrl_file" 2>/dev/null || echo 0)
        
        if [ "$has_post" -eq 0 ]; then
            add_issue "HIGH" "BACKEND" "${ctrl}.controller: endpoint POST manquant"
        fi
        if [ "$has_put" -eq 0 ]; then
            add_issue "HIGH" "BACKEND" "${ctrl}.controller: endpoint PUT/PATCH manquant"
        fi
        if [ "$has_delete" -eq 0 ]; then
            add_issue "HIGH" "BACKEND" "${ctrl}.controller: endpoint DELETE manquant"
        fi
    fi
done

echo ""
echo "🧪 4. ANALYSE DES TESTS E2E"
echo "--------------------------------------"

# Compter les tests existants
E2E_TEST_COUNT=$(find e2e -name "*.spec.ts" -type f 2>/dev/null | wc -l | tr -d ' ')
E2E_TEST_CASES=$(grep -r "test(\|it(\|test.describe" e2e/ 2>/dev/null | wc -l | tr -d ' ')

echo "   Tests specs trouvés: $E2E_TEST_COUNT fichiers"
echo "   Cas de test trouvés: ~$E2E_TEST_CASES"

# Vérifier les cycles de test
REQUIRED_CYCLES=("cycle-notes" "cycle-attendance" "cycle-data-management" "cycle-multi-roles" "cycle-auth" "cycle-students" "cycle-teachers" "cycle-classes")
for cycle in "${REQUIRED_CYCLES[@]}"; do
    if ! [ -d "e2e/cycles/${cycle}" ]; then
        add_issue "MEDIUM" "E2E" "Cycle de test manquant: ${cycle}/"
    else
        spec_count=$(find "e2e/cycles/${cycle}" -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$spec_count" -eq 0 ]; then
            add_issue "MEDIUM" "E2E" "Aucun test dans: ${cycle}/"
        fi
    fi
done

# Vérifier auth setup
if ! [ -f "e2e/auth.setup.ts" ]; then
    add_issue "HIGH" "E2E" "Fichier auth.setup.ts manquant"
fi

# Vérifier les états d'auth
if ! [ -d "e2e/.auth" ]; then
    add_issue "HIGH" "E2E" "Dossier e2e/.auth/ manquant - états d'authentification non générés"
else
    for role in admin teacher parent student; do
        if ! [ -f "e2e/.auth/${role}.json" ]; then
            add_issue "MEDIUM" "E2E" "État auth manquant: ${role}.json"
        fi
    done
fi

echo ""
echo "🔗 5. ANALYSE DES ROUTES FRONTEND"
echo "--------------------------------------"

# Vérifier App.tsx pour les routes
if [ -f "App.tsx" ]; then
    routes_defined=$(grep -c "Route\|path=" App.tsx 2>/dev/null || echo 0)
    echo "   Routes définies dans App.tsx: ~$routes_defined"
    
    # Routes attendues
    EXPECTED_ROUTES=("/students" "/teachers" "/classes" "/grades" "/attendance" "/finance" "/documents" "/users" "/settings" "/reports")
    for route in "${EXPECTED_ROUTES[@]}"; do
        if ! grep -q "path=\"${route}\|path='${route}" App.tsx 2>/dev/null; then
            add_issue "LOW" "ROUTES" "Route potentiellement manquante: ${route}"
        fi
    done
fi

echo ""
echo "📊 6. ANALYSE DES TYPES TYPESCRIPT"
echo "--------------------------------------"

# Vérifier les interfaces/types
REQUIRED_TYPES=("Student" "Teacher" "Class" "Grade" "Attendance" "User" "Parent" "Subject" "Document" "Finance")
for type in "${REQUIRED_TYPES[@]}"; do
    if ! grep -r "interface ${type}\|type ${type}" types/ src/types/ 2>/dev/null | grep -q .; then
        if ! grep -r "interface ${type}\|type ${type}" components/ services/ 2>/dev/null | grep -q .; then
            add_issue "LOW" "TYPES" "Interface/Type potentiellement manquant: ${type}"
        fi
    fi
done

echo ""
echo "🔧 7. ANALYSE DE LA CONFIGURATION"
echo "--------------------------------------"

# Fichiers de config requis
CONFIG_FILES=("package.json" "tsconfig.json" "vite.config.ts" "tailwind.config.js" "playwright.config.ts" ".env" ".env.example")
for cfg in "${CONFIG_FILES[@]}"; do
    if ! [ -f "$cfg" ]; then
        add_issue "LOW" "CONFIG" "Fichier de configuration manquant: ${cfg}"
    fi
done

# Vérifier wrangler.toml
if [ -f "wrangler.toml" ] || [ -f "backend/wrangler.toml" ]; then
    if grep -q "kds-" wrangler.toml backend/wrangler.toml 2>/dev/null; then
        add_issue "MEDIUM" "CONFIG" "Référence KDS encore présente dans wrangler.toml (devrait être KSP)"
    fi
fi

echo ""
echo "🌐 8. ANALYSE CLOUDFLARE WORKERS (backend/src/index.ts)"
echo "--------------------------------------"

if [ -f "backend/src/index.ts" ]; then
    # Endpoints dans Workers
    workers_endpoints=$(grep -c "app\.\(get\|post\|put\|delete\|patch\)" backend/src/index.ts 2>/dev/null || echo 0)
    echo "   Endpoints Workers trouvés: $workers_endpoints"
    
    # Vérifier les endpoints CRUD par entité
    ENTITIES=("students" "teachers" "classes" "grades" "attendance" "users" "subjects" "parents" "documents" "finance")
    for entity in "${ENTITIES[@]}"; do
        has_crud=$(grep -c "/api/v1/${entity}" backend/src/index.ts 2>/dev/null || echo 0)
        if [ "$has_crud" -eq 0 ]; then
            add_issue "HIGH" "WORKERS" "Endpoints manquants pour: /api/v1/${entity}"
        else
            # Vérifier CRUD complet
            has_get=$(grep -c "get('/api/v1/${entity}" backend/src/index.ts 2>/dev/null || echo 0)
            has_post=$(grep -c "post('/api/v1/${entity}" backend/src/index.ts 2>/dev/null || echo 0)
            has_put=$(grep -c "put('/api/v1/${entity}" backend/src/index.ts 2>/dev/null || echo 0)
            has_delete=$(grep -c "delete('/api/v1/${entity}" backend/src/index.ts 2>/dev/null || echo 0)
            
            [ "$has_post" -eq 0 ] && add_issue "MEDIUM" "WORKERS" "${entity}: POST manquant"
            [ "$has_put" -eq 0 ] && add_issue "MEDIUM" "WORKERS" "${entity}: PUT manquant"
            [ "$has_delete" -eq 0 ] && add_issue "MEDIUM" "WORKERS" "${entity}: DELETE manquant"
        fi
    done
fi

echo ""
echo "============================================================================"
echo "📋 RÉSUMÉ DE L'AUDIT"
echo "============================================================================"
echo ""
echo -e "Total des problèmes détectés: ${RED}${TOTAL_ISSUES}${NC}"
echo -e "  - ${RED}CRITICAL${NC}: $CRITICAL"
echo -e "  - ${YELLOW}HIGH${NC}: $HIGH"
echo -e "  - ${BLUE}MEDIUM${NC}: $MEDIUM"
echo -e "  - ${GREEN}LOW${NC}: $LOW"
echo ""

# Générer le fichier de tâches
TASK_FILE="AUDIT_TASKS_$(date '+%Y%m%d_%H%M').md"
echo "📝 Génération du fichier de tâches: $TASK_FILE"

cat > "$TASK_FILE" << TASKEOF
# 📋 KSP School - Audit Tasks
**Généré le:** $(date '+%Y-%m-%d %H:%M')
**Total issues:** $TOTAL_ISSUES (Critical: $CRITICAL, High: $HIGH, Medium: $MEDIUM, Low: $LOW)

---

## 🔴 CRITICAL ($CRITICAL)
$(grep -E "^\[CRITICAL\]" /tmp/audit_output.txt 2>/dev/null | sed 's/\[CRITICAL\]/- [ ]/' || echo "Aucune issue critique")

## 🟠 HIGH ($HIGH)
$(grep -E "^\[HIGH\]" /tmp/audit_output.txt 2>/dev/null | sed 's/\[HIGH\]/- [ ]/' || echo "Aucune issue haute priorité")

## 🟡 MEDIUM ($MEDIUM)
$(grep -E "^\[MEDIUM\]" /tmp/audit_output.txt 2>/dev/null | sed 's/\[MEDIUM\]/- [ ]/' || echo "Aucune issue moyenne priorité")

## 🟢 LOW ($LOW)
$(grep -E "^\[LOW\]" /tmp/audit_output.txt 2>/dev/null | sed 's/\[LOW\]/- [ ]/' || echo "Aucune issue basse priorité")

---

## 📊 Statistiques du Projet

### Frontend
- Composants: $(find components -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ') fichiers
- Services: $(find services -name "*.ts" 2>/dev/null | wc -l | tr -d ' ') fichiers
- Lignes de code: ~$(find components services -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')

### Backend (NestJS)
- Controllers: $(find backend -name "*.controller.ts" 2>/dev/null | wc -l | tr -d ' ')
- Services: $(find backend -name "*.service.ts" 2>/dev/null | wc -l | tr -d ' ')
- Modules: $(find backend -name "*.module.ts" 2>/dev/null | wc -l | tr -d ' ')

### Tests E2E
- Fichiers spec: $(find e2e -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
- Cas de test: ~$(grep -r "test(\|it(" e2e/ 2>/dev/null | wc -l | tr -d ' ')

### Cloudflare Workers
- Endpoints: $(grep -c "app\.\(get\|post\|put\|delete\|patch\)" backend/src/index.ts 2>/dev/null || echo 0)

TASKEOF

echo "✅ Audit terminé!"
