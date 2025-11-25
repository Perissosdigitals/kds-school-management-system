#!/bin/bash
# =============================================================================
# Script d'Installation E2E Framework
# Référence: PHASE2_FRONTEND_E2E_PROGRESS.md Section "Installation Playwright"
# =============================================================================

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Installation E2E Testing Framework (Playwright)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Install Playwright
echo "📦 Step 1: Installation de Playwright Test..."
npm install -D @playwright/test
echo "✅ Playwright Test installé"
echo ""

# Step 2: Install Browsers
echo "🌐 Step 2: Installation des navigateurs (Chromium)..."
npx playwright install chromium
echo "✅ Chromium installé"
echo ""

# Step 3: Create E2E Directory Structure
echo "📁 Step 3: Création de la structure E2E..."
mkdir -p e2e/.auth
mkdir -p e2e/cycles/cycle-attendance
mkdir -p e2e/cycles/cycle-multi-roles
echo "✅ Structure créée:"
echo "   e2e/.auth/"
echo "   e2e/cycles/cycle-attendance/"
echo "   e2e/cycles/cycle-multi-roles/"
echo ""

# Step 4: Create Auth Setup Script
echo "🔐 Step 4: Création du script d'authentification..."
cat > e2e/auth.setup.ts << 'EOF'
import { test as setup } from '@playwright/test';
import { TEST_USERS } from './fixtures/data';

/**
 * Authentication Setup
 * Generates .auth/*.json files for each user role
 * These files contain authenticated browser state (cookies, localStorage)
 * Used by Playwright projects via storageState option
 */

// Admin authentication
setup('authenticate as admin', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', TEST_USERS.admin.email);
  await page.fill('input[name="password"]', TEST_USERS.admin.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  
  // Save authenticated state
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
  console.log('✅ Admin auth saved to e2e/.auth/admin.json');
});

// Teacher authentication
setup('authenticate as teacher', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', TEST_USERS.teacher.email);
  await page.fill('input[name="password"]', TEST_USERS.teacher.password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  await page.context().storageState({ path: 'e2e/.auth/teacher.json' });
  console.log('✅ Teacher auth saved to e2e/.auth/teacher.json');
});

// Parent authentication
setup('authenticate as parent', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', TEST_USERS.parent.email);
  await page.fill('input[name="password"]', TEST_USERS.parent.password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  await page.context().storageState({ path: 'e2e/.auth/parent.json' });
  console.log('✅ Parent auth saved to e2e/.auth/parent.json');
});

// Student authentication
setup('authenticate as student', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', TEST_USERS.student.email);
  await page.fill('input[name="password"]', TEST_USERS.student.password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  await page.context().storageState({ path: 'e2e/.auth/student.json' });
  console.log('✅ Student auth saved to e2e/.auth/student.json');
});
EOF
echo "✅ e2e/auth.setup.ts créé"
echo ""

# Step 5: Update package.json scripts
echo "📝 Step 5: Ajout des scripts npm..."
if ! grep -q "test:e2e" package.json; then
  # Backup package.json
  cp package.json package.json.backup
  
  # Add scripts using node
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['test:e2e'] = 'playwright test';
    pkg.scripts['test:e2e:ui'] = 'playwright test --ui';
    pkg.scripts['test:e2e:headed'] = 'playwright test --headed';
    pkg.scripts['test:e2e:report'] = 'playwright show-report';
    pkg.scripts['test:e2e:auth'] = 'playwright test e2e/auth.setup.ts';
    pkg.scripts['test:cycle1'] = 'playwright test --project=cycle-notes';
    pkg.scripts['test:cycle2'] = 'playwright test --project=cycle-attendance';
    pkg.scripts['test:cycle3'] = 'playwright test --project=cycle-data-management';
    pkg.scripts['test:cycle4'] = 'playwright test --project=cycle-multi-roles';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  "
  
  echo "✅ Scripts ajoutés à package.json:"
  echo "   - npm run test:e2e"
  echo "   - npm run test:e2e:ui"
  echo "   - npm run test:e2e:headed"
  echo "   - npm run test:e2e:report"
  echo "   - npm run test:e2e:auth"
  echo "   - npm run test:cycle1"
  echo "   - npm run test:cycle2"
  echo "   - npm run test:cycle3"
  echo "   - npm run test:cycle4"
else
  echo "✅ Scripts E2E déjà présents dans package.json"
fi
echo ""

# Step 6: Create .gitignore entries
echo "🔒 Step 6: Configuration .gitignore..."
if ! grep -q "e2e-report" .gitignore 2>/dev/null; then
  cat >> .gitignore << 'EOF'

# Playwright E2E
/e2e-report/
/e2e-results.json
/playwright-report/
/test-results/
/e2e/.auth/*.json
EOF
  echo "✅ Ajouté au .gitignore: e2e-report/, test-results/, .auth/*.json"
else
  echo "✅ .gitignore déjà configuré"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation E2E Framework COMPLÈTE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. Démarrer backend & frontend:"
echo "   cd backend && npm run start:dev &"
echo "   cd .. && npm run start &"
echo ""
echo "2. Générer les états d'authentification:"
echo "   npm run test:e2e:auth"
echo ""
echo "3. Exécuter les tests E2E:"
echo "   npm run test:cycle1   # Tests Notes (N-001, N-002, N-003)"
echo "   npm run test:cycle3   # Tests Data Mgmt (D-001, D-007, D-008, D-010)"
echo "   npm run test:e2e      # Tous les tests"
echo ""
echo "4. Voir le rapport HTML:"
echo "   npm run test:e2e:report"
echo ""
echo "5. Mode UI interactif:"
echo "   npm run test:e2e:ui"
echo ""
echo "📚 Documentation:"
echo "   - PHASE2_FRONTEND_E2E_PROGRESS.md (tracker de progression)"
echo "   - E2E_TEST_MATRIX.md (matrice 50 tests)"
echo "   - E2E_TESTING_STUDY.md (4 cycles détaillés)"
echo ""
echo "🎯 Objectif: 50/50 tests PASS d'ici le 8 décembre 2024"
echo ""
echo "Berakhot ve-Shalom! 🙏"
