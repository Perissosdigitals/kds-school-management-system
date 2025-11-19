# 🚀 Development Workflow Guide

## Environment Setup

### Overview
This project supports **two environments** that work seamlessly together:

| Environment | Frontend | Backend | Database | Use Case |
|------------|----------|---------|----------|----------|
| **Development** | localhost:3000 | localhost:3001 | PostgreSQL | Local development & testing |
| **Production** | Cloudflare Pages | Cloudflare Workers | D1 (SQLite) | Live deployment |

---

## 📁 Environment Files

```
.env.local          # Local development (used by default with npm run dev)
.env.development    # Development mode settings
.env.production     # Production mode settings (Cloudflare)
```

### `.env.local` (Local Development)
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_USE_MOCK_DATA=false
```

### `.env.production` (Cloudflare Production)
```env
VITE_API_URL=https://kds-backend-api.perissosdigitals.workers.dev/api/v1
```

---

## 🛠️ Development Workflow

### 1️⃣ Local Development

#### Start Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
# Backend runs on http://localhost:3001
```

#### Start Frontend (React + Vite)
```bash
# In project root
npm install
npm run dev
# Frontend runs on http://localhost:3000
# Automatically uses .env.local → connects to localhost:3001
```

**Test credentials:**
- Email: `admin@kds.edu`
- Password: `admin123`

---

### 2️⃣ Build for Production

```bash
# Build frontend for Cloudflare (uses .env.production)
npm run build

# Build frontend for local testing (uses .env.development)
npm run build:local
```

---

### 3️⃣ Deploy to Cloudflare

#### Option A: One Command Deploy
```bash
npm run deploy
```

#### Option B: Step by Step

**Deploy Frontend (Pages)**
```bash
npm run build
npx wrangler pages deploy dist --project-name=kds-school-management
```

**Deploy Backend (Workers)**
```bash
cd backend
npx wrangler deploy
```

---

## 🔄 Standard Development Cycle

### Daily Development Flow:

1. **Work Locally**
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run start:dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

2. **Make Changes**
   - Edit code in your IDE
   - Test on http://localhost:3000
   - Backend auto-reloads on changes

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

4. **Deploy to Production**
   ```bash
   npm run deploy
   ```

---

## 📊 Environment Variables Explanation

### `VITE_API_URL`
- **Development**: `http://localhost:3001/api/v1` (local NestJS)
- **Production**: `https://kds-backend-api.perissosdigitals.workers.dev/api/v1` (Cloudflare Workers)

### How It Works:
```typescript
// services/httpClient.ts
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://...workers.dev/api/v1',
  // ↑ Vite automatically loads the correct .env file based on --mode
});
```

---

## 🎯 Common Commands Reference

| Command | Description | Environment |
|---------|-------------|-------------|
| `npm run dev` | Start dev server | Development (localhost:3001) |
| `npm run build` | Build for production | Production (Cloudflare) |
| `npm run build:local` | Build for local testing | Development (localhost:3001) |
| `npm run preview` | Preview production build | Uses built assets |
| `npm run deploy` | Build + deploy to Cloudflare | Production |

---

## 🔐 Backend Setup (Local)

### PostgreSQL Database
```bash
cd backend

# Start PostgreSQL (if using Docker)
docker-compose up -d

# Or start local PostgreSQL service
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Environment Variables (backend/.env)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=kds_school_db
JWT_SECRET=your-secret-key
```

---

## 🌐 Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://bde2ae9a.kds-school-management.pages.dev |
| **Backend API** | https://kds-backend-api.perissosdigitals.workers.dev |
| **GitHub Repo** | https://github.com/Perissosdigitals/kds-school-management-system |
| **D1 Database** | kds-school-db (ID: d293f4d0-fb4d-4f99-a45c-783fcd374a6e) |

---

## 🧪 Testing Environments

### Local Testing
```bash
# Test backend directly
curl http://localhost:3001/api/v1/health

# Test frontend with local backend
npm run dev
# Open http://localhost:3000
```

### Production Testing
```bash
# Test backend directly
curl https://kds-backend-api.perissosdigitals.workers.dev/api/v1/health

# Test frontend
# Open https://bde2ae9a.kds-school-management.pages.dev
```

---

## 🔧 Troubleshooting

### Issue: Frontend shows "Session expirée"
**Solution:** Check backend is running
```bash
# For local dev:
curl http://localhost:3001/api/v1/health

# For production:
curl https://kds-backend-api.perissosdigitals.workers.dev/api/v1/health
```

### Issue: Wrong API URL after build
**Solution:** Verify environment file
```bash
# Check which env file is being used
cat .env.local  # For dev
cat .env.production  # For production build

# Rebuild with correct mode
npm run build  # For production
npm run build:local  # For development
```

### Issue: Database connection failed (local)
**Solution:** Ensure PostgreSQL is running
```bash
# macOS
brew services list
brew services start postgresql

# Or use Docker
cd backend && docker-compose up -d
```

---

## 📝 Best Practices

### ✅ DO:
- Always use `npm run dev` for local development
- Test locally before deploying to production
- Commit and push changes to GitHub before deploying
- Use environment-specific builds (`npm run build` for prod)

### ❌ DON'T:
- Don't hardcode URLs in components
- Don't commit `.env.local` to git (it's in .gitignore)
- Don't deploy without testing locally first
- Don't mix local and production database data

---

## 🎓 Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Setup backend database (PostgreSQL locally)
- [ ] Create `.env.local` with local API URL
- [ ] Start backend: `cd backend && npm run start:dev`
- [ ] Start frontend: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Login with `admin@kds.edu` / `admin123`
- [ ] Make changes and test
- [ ] Commit to GitHub
- [ ] Deploy to production: `npm run deploy`

---

## 🌟 Summary

**Local Development:**
```bash
cd backend && npm run start:dev  # Terminal 1
npm run dev                       # Terminal 2
# Work on http://localhost:3000
```

**Deploy to Production:**
```bash
git add . && git commit -m "Your changes" && git push
npm run deploy
# Live on https://bde2ae9a.kds-school-management.pages.dev
```

**That's it! Shalom! 🎉**
