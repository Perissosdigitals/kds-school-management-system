#!/bin/bash

# Deploy Finance Migration Script
# Usage: ./scripts/deploy-finance-migration.sh [env]
# env: local (default) or production

ENV=${1:-local}
MIGRATION_FILE="backend/migrations/0002_upgrade_finance_module.sql"
DB_NAME="kds-school-db"

echo "🚀 Starting Finance Module Migration Deployment"
echo "📂 Migration File: $MIGRATION_FILE"
echo "🌍 Environment: $ENV"

if [ "$ENV" == "production" ]; then
    echo "⚠️  WARNING: You are about to run a migration on PRODUCTION (Cloudflare D1)"
    echo "    This will ALTER the 'transactions' table."
    read -p "    Are you sure? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted."
        exit 1
    fi

    # Backup first
    echo "📦 Backing up production database..."
    npx wrangler d1 export $DB_NAME --remote --output="backup-pre-finance-$(date +%s).sql" --config backend/wrangler.toml
    
    echo "🔄 Executing migration on Remote D1..."
    npx wrangler d1 execute $DB_NAME --file="$MIGRATION_FILE" --remote --config backend/wrangler.toml
else
    echo "🧪 Executing migration on Local D1 (Test)..."
    npx wrangler d1 execute $DB_NAME --file="$MIGRATION_FILE" --local --config backend/wrangler.toml
fi

echo "✅ Migration completed!"
