# KSP Backend - Cloudflare Deployment Strategy

Berakhot! Here's the deployment plan for your KSP School Management System.

## Current Setup Status

✅ **Frontend Deployed**: https://eedc390e.kds-school-management.pages.dev
✅ **D1 Database Created**: `kds-school-db` (ID: d293f4d0-fb4d-4f99-a45c-783fcd374a6e)
⚠️ **R2 Storage**: Needs to be enabled in Cloudflare Dashboard

## Deployment Options

### Option 1: Keep Current Architecture (Recommended for Now)
Since your backend is already running well with NestJS + PostgreSQL + TypeORM:

**Local/VPS Deployment:**
- Deploy backend to a VPS (DigitalOcean, Linode, AWS EC2)
- Use your existing PostgreSQL database
- Point frontend to backend URL
- Estimated cost: $5-20/month

**Benefits:**
- No code changes needed
- Full PostgreSQL features
- Existing NestJS setup works perfectly

### Option 2: Hybrid Cloudflare Deployment
**Backend**: Cloudflare Workers for API endpoints
**Database**: Cloudflare D1 (SQLite-based)
**Storage**: Cloudflare R2 for documents

**Required Changes:**
- Adapt NestJS to work with Workers runtime
- Convert PostgreSQL queries to SQLite-compatible
- Refactor TypeORM usage

**Benefits:**
- Serverless, auto-scaling
- Global edge network
- Free tier: 100K requests/day

### Option 3: Full Cloudflare Stack (Future Migration)
Rebuild backend specifically for Cloudflare:
- Workers for compute
- D1 for database
- R2 for storage
- Durable Objects for real-time features

## Immediate Next Steps

### For Option 1 (VPS Deployment):
```bash
# 1. Get a VPS (e.g., DigitalOcean Droplet)
# 2. Install Node.js and PostgreSQL
# 3. Clone your repository
git clone YOUR_REPO_URL
cd kds-school-management-system/backend

# 4. Install dependencies
npm install

# 5. Set up environment variables
cp .env.example .env
# Edit .env with production values

# 6. Run migrations
npm run migration:run

# 7. Seed database
npm run db:seed

# 8. Start with PM2
npm install -g pm2
pm2 start npm --name "kds-backend" -- run start

# 9. Set up Nginx reverse proxy
# Point domain to your server
```

### For Option 2 (Cloudflare Hybrid):
```bash
# 1. Enable R2 in Cloudflare Dashboard
# Go to: https://dash.cloudflare.com > R2

# 2. Simplify database schema for D1 (SQLite)
# Remove PostgreSQL-specific features (JSONB, extensions, etc.)

# 3. Create simplified D1 schema
npx wrangler d1 execute kds-school-db --remote --file=./shared/database/schema-d1.sql

# 4. Deploy Workers
npx wrangler deploy

# 5. Update frontend config with Workers URL
```

## Current Configuration

**wrangler.toml** is configured with:
- D1 Database: `kds-school-db`
- R2 Bucket: `kds-documents` (needs enabling)
- Node.js compatibility enabled

## Update Frontend to Use Backend

Edit `config.ts`:
```typescript
// For VPS deployment
export const API_BASE_URL = 'https://api.yourdomain.com/api/v1';

// For Cloudflare Workers
export const API_BASE_URL = 'https://kds-backend-api.your-subdomain.workers.dev/api/v1';
```

Then redeploy frontend:
```bash
npm run build
npx wrangler pages deploy dist --project-name=kds-school-management
```

## Cost Comparison

**Cloudflare (Option 2/3):**
- Free tier: Good for small schools (<100K requests/day)
- Paid: $5/month (unlimited requests)

**VPS (Option 1):**
- Basic: $5-10/month (1GB RAM)
- Production: $12-20/month (2GB+ RAM)
- Database backup: +$2-5/month

## Recommendation

**For Production Launch**: Start with **Option 1 (VPS)**
- Fastest to deploy (no code changes)
- Full PostgreSQL features
- Predictable costs
- Easy to scale

**For Future**: Migrate to **Option 3 (Full Cloudflare)**
- Better for global scaling
- Edge computing benefits
- Lower latency worldwide

## Need Help?

**Current Status:**
- ✅ Frontend live on Cloudflare Pages
- ✅ Backend running locally (localhost:3001)
- ⏳ Need to deploy backend to production

**Next Action Required:**
Choose your deployment option and I'll help you execute it!

Berakhot! 🙏
