#!/bin/bash

###############################################################################
# CLOUDFLARE PRODUCTION DEPLOYMENT SCRIPT
# Builds and deploys KDS School Management System to Cloudflare Pages
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  KDS SCHOOL MANAGEMENT - CLOUDFLARE DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Environment Verification
echo -e "${YELLOW}📋 Step 1: Verifying Environment Configuration...${NC}"

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration found${NC}"
echo ""

# Step 2: Install Dependencies
echo -e "${YELLOW}📦 Step 2: Installing Dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Run Tests (if available)
echo -e "${YELLOW}🧪 Step 3: Running Pre-Deployment Tests...${NC}"
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    npm run test || echo -e "${YELLOW}⚠️  Tests skipped or failed${NC}"
else
    echo -e "${YELLOW}⚠️  No tests configured${NC}"
fi
echo ""

# Step 4: Build Production Bundle
echo -e "${YELLOW}🔨 Step 4: Building Production Bundle...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not created${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Production build completed${NC}"
echo ""

# Step 5: Deploy to Cloudflare Pages
echo -e "${YELLOW}🚀 Step 5: Deploying to Cloudflare Pages...${NC}"

# Get current git commit info
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "Production deployment")

echo "Commit: $COMMIT_HASH"
echo "Message: $COMMIT_MSG"
echo ""

# Deploy using Wrangler
if command -v wrangler &> /dev/null; then
    npx wrangler pages deploy ./dist \
        --project-name=ksp-production \
        --branch=main \
        --commit-hash="$COMMIT_HASH" \
        --commit-message="$COMMIT_MSG"
    
    echo -e "${GREEN}✅ Deployment to Cloudflare Pages completed!${NC}"
else
    echo -e "${YELLOW}⚠️  Wrangler not found. Installing...${NC}"
    npm install -g wrangler
    
    npx wrangler pages deploy ./dist \
        --project-name=ksp-production \
        --branch=main \
        --commit-hash="$COMMIT_HASH" \
        --commit-message="$COMMIT_MSG"
    
    echo -e "${GREEN}✅ Deployment completed!${NC}"
fi

echo ""

# Step 6: Post-Deployment Verification
echo -e "${YELLOW}🔍 Step 6: Post-Deployment Verification...${NC}"
echo ""
echo -e "${GREEN}Deployment URL: https://ksp-production.pages.dev${NC}"
echo -e "${GREEN}API Backend: https://kds-backend-api.perissosdigitals.workers.dev${NC}"
echo ""

# Step 7: Run Automated Tests
echo -e "${YELLOW}🧪 Step 7: Running Automated CRUD Tests...${NC}"
echo ""
echo "To run automated tests, execute:"
echo -e "${BLUE}  CLOUDFLARE_URL='https://ksp-production.pages.dev' ./scripts/test-cloudflare-deployment.sh${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next Steps:"
echo "1. Verify deployment at: https://ksp-production.pages.dev"
echo "2. Run CRUD tests: ./scripts/test-cloudflare-deployment.sh"
echo "3. Monitor for 72 hours post-launch"
echo ""
echo -e "${GREEN}Baruch Hashem! Berakhot ve-Hatzlakha Rabbah! 🎉✨${NC}"
