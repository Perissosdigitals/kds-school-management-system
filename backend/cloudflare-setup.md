# KSP Backend - Cloudflare Deployment Guide

## Overview
This guide explains how to deploy the KSP School Management System backend to Cloudflare Workers with D1 Database.

## Architecture
- **Cloudflare Workers**: Serverless backend API
- **Cloudflare D1**: SQL database (SQLite-based)
- **Cloudflare KV**: Key-Value storage for sessions/cache
- **Cloudflare R2**: Object storage for documents

## Prerequisites
1. Cloudflare account
2. Wrangler CLI installed: `npm install -g wrangler`
3. Authenticated: `wrangler login`

## Initial Setup

### 1. Create D1 Database
```bash
cd backend
wrangler d1 create kds-school-db
```
Copy the `database_id` and update `wrangler.toml`

### 2. Create KV Namespace
```bash
wrangler kv:namespace create KV
```
Copy the `id` and update `wrangler.toml`

### 3. Create R2 Bucket
```bash
wrangler r2 bucket create kds-documents
```

### 4. Set Secrets
```bash
# JWT Secret
wrangler secret put JWT_SECRET

# CORS Origins
wrangler secret put CORS_ORIGINS
# Example: https://your-frontend.pages.dev,https://yourdomain.com
```

### 5. Initialize Database Schema
```bash
# Apply migrations to D1
wrangler d1 execute kds-school-db --file=./shared/database/schema.sql

# Seed initial data
wrangler d1 execute kds-school-db --file=./shared/database/seeds/seed-fixed.sql
```

## Deployment

### Deploy Backend API
```bash
cd backend
npm run build
wrangler deploy
```

Your API will be available at: `https://kds-backend-api.<your-subdomain>.workers.dev`

### Update Frontend Configuration
Update the frontend API URL in `config.ts`:
```typescript
export const API_BASE_URL = 'https://kds-backend-api.<your-subdomain>.workers.dev/api/v1';
```

Then redeploy frontend:
```bash
cd ..
npm run build
npx wrangler pages deploy dist --project-name=kds-school-management
```

## Custom Domain (Optional)

### Add Custom Domain to Workers
```bash
wrangler route add "api.yourdomain.com/*" --name kds-backend-api
```

### Add Custom Domain to Pages
In Cloudflare Dashboard:
1. Go to Pages > kds-school-management > Custom domains
2. Add your domain (e.g., `school.yourdomain.com`)

## Environment-Specific Deployment

### Production
```bash
wrangler deploy --env production
```

### Staging
```bash
wrangler deploy --env staging
```

## Monitoring

View logs:
```bash
wrangler tail
```

View metrics in Cloudflare Dashboard:
- Workers > kds-backend-api > Metrics
- Pages > kds-school-management > Analytics

## Database Management

### Execute SQL
```bash
wrangler d1 execute kds-school-db --command="SELECT * FROM users LIMIT 10"
```

### Backup Database
```bash
wrangler d1 export kds-school-db --output=backup.sql
```

### Import Data
```bash
wrangler d1 execute kds-school-db --file=backup.sql
```

## Troubleshooting

### Check Worker Logs
```bash
wrangler tail --format pretty
```

### Test Locally
```bash
wrangler dev
```

### Common Issues

1. **Database Connection Error**
   - Verify `database_id` in `wrangler.toml`
   - Check D1 database exists: `wrangler d1 list`

2. **CORS Issues**
   - Update CORS_ORIGINS secret with correct frontend URL
   - Verify CORS configuration in `main.ts`

3. **Authentication Errors**
   - Check JWT_SECRET is set: `wrangler secret list`
   - Verify token expiration settings

## Cost Optimization

Cloudflare Free Tier includes:
- Workers: 100,000 requests/day
- D1: 5GB storage, 5M reads/day
- R2: 10GB storage, 1M Class A operations/month
- KV: 100,000 reads/day, 1,000 writes/day

For higher limits, upgrade to Workers Paid plan ($5/month).

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions)
2. Configure monitoring and alerts
3. Implement database backups
4. Add rate limiting
5. Set up staging environment
