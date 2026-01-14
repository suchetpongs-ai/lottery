#!/bin/bash

# ============================================
# Production Deployment Script
# ============================================

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. Pre-deployment checks
# ============================================
echo -e "${YELLOW}📋 Running pre-deployment checks...${NC}"

# Check if on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo -e "${RED}❌ Error: Not on main branch. Current branch: $BRANCH${NC}"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Error: Working directory not clean. Commit or stash changes.${NC}"
    exit 1
fi

# Check environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "FRONTEND_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Error: $var is not set${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# ============================================
# 2. Database backup
# ============================================
echo -e "${YELLOW}💾 Creating database backup...${NC}"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump $DATABASE_URL > $BACKUP_FILE
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"

# ============================================
# 3. Run database migrations
# ============================================
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
cd apps/api
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations completed${NC}"

# ============================================
# 4. Build applications
# ============================================
echo -e "${YELLOW}🔨 Building applications...${NC}"

# Build backend
echo "Building backend..."
npm run build
echo -e "${GREEN}✅ Backend built${NC}"

# Build frontend
cd ../web
echo "Building frontend..."
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"

# ============================================
# 5. Run tests
# ============================================
echo -e "${YELLOW}🧪 Running tests...${NC}"
cd ../../apps/api
npm run test
echo -e "${GREEN}✅ Tests passed${NC}"

# ============================================
# 6. Deploy to hosting
# ============================================
echo -e "${YELLOW}🚢 Deploying to production...${NC}"

# Backend (Railway)
echo "Deploying backend..."
# Railway will auto-deploy from git push

# Frontend (Vercel)
echo "Deploying frontend..."
cd ../web
npx vercel --prod

echo -e "${GREEN}✅ Deployment completed${NC}"

# ============================================
# 7. Post-deployment verification
# ============================================
echo -e "${YELLOW}🔍 Running post-deployment checks...${NC}"

# Health check
sleep 10  # Wait for services to start
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ $HEALTH_STATUS -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend health check passed${NC}"
else
    echo -e "${RED}❌ Frontend health check failed (Status: $HEALTH_STATUS)${NC}"
    exit 1
fi

# ============================================
# 8. Tag release
# ============================================
echo -e "${YELLOW}🏷️  Tagging release...${NC}"
VERSION=$(date +%Y.%m.%d.%H%M)
git tag -a "v$VERSION" -m "Production release $VERSION"
git push origin "v$VERSION"
echo -e "${GREEN}✅ Tagged as v$VERSION${NC}"

# ============================================
# Done!
# ============================================
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "  - Version: v$VERSION"
echo "  - Backup: $BACKUP_FILE"
echo "  - Frontend: $FRONTEND_URL"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Monitor error logs (Sentry)"
echo "  2. Check API metrics (Railway)"
echo "  3. Verify cron jobs are running"
echo "  4. Test critical user flows"
