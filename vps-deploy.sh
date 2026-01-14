#!/bin/bash
# ========================================
# VPS Deployment Script via GitHub
# Repository: https://github.com/suchetpongs-ai/lottery
# ========================================

echo "🚀 Starting deployment from GitHub..."

# ========================================
# STEP 1: Clone Repository
# ========================================
echo "📥 Cloning repository..."
cd /var/www
rm -rf lottery  # Remove old folder if exists
git clone https://github.com/suchetpongs-ai/lottery.git lottery
cd lottery

# ========================================
# STEP 2: Setup Environment Variables
# ========================================
echo "⚙️ Setting up environment variables..."
cd /var/www/lottery/apps/api
cat > .env << 'EOF'
DATABASE_URL="postgresql://lottery_user:L0ttery@2024!Strong@localhost:5432/lottery_db?schema=public"
NODE_ENV="production"
JWT_SECRET="abcdef1234567890abcdef1234567890abcdef1234567890"
PORT=3001

# Tweasy Payment Gateway
TWEASY_API_URL="https://api.tweasy.com"
TWEASY_API_KEY="your_api_key_here"
TWEASY_SECRET_KEY="your_secret_key_here"

# Frontend and API URLs
FRONTEND_URL="http://76.13.18.170"
API_URL="http://76.13.18.170/api"

# Cloudinary (for KYC images)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
EOF

echo "✅ Environment variables created"

# ========================================
# STEP 3: Install Dependencies
# ========================================
echo "📦 Installing dependencies..."
cd /var/www/lottery

# Root
npm install

# Backend
cd apps/api
npm install

# Frontend
cd ../web
npm install

echo "✅ Dependencies installed"

# ========================================
# STEP 4: Build Applications
# ========================================
echo "🔨 Building applications..."

# Clean old builds
cd /var/www/lottery
rm -rf apps/api/dist apps/web/.next apps/web/node_modules/.cache

# Build Backend
echo "Building backend..."
cd apps/api
npm run build

# Verify backend build
if [ ! -f "dist/main.js" ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
echo "✅ Backend built successfully"

# Build Frontend
echo "Building frontend..."
cd ../web
npm run build

echo "✅ Frontend built successfully"

# ========================================
# STEP 5: Setup PM2 Services
# ========================================
echo "🔧 Setting up PM2 services..."

# Stop all existing services
pm2 delete all 2>/dev/null || true

# Start Backend
cd /var/www/lottery/apps/api
pm2 start dist/main.js --name lottery-api

# Start Frontend
cd /var/www/lottery/apps/web
pm2 start npm --name lottery-web -- start

# Save PM2 configuration
pm2 save

# Enable PM2 startup (run on boot)
pm2 startup | grep -E '^sudo' | bash

echo "✅ PM2 services configured"

# ========================================
# STEP 6: Verify Deployment
# ========================================
echo "🔍 Verifying deployment..."
pm2 list

echo ""
echo "========================================="
echo "✅ ✅ ✅ Deployment Complete! ✅ ✅ ✅"
echo "========================================="
echo ""
echo "🌐 Website: http://76.13.18.170"
echo ""
echo "📊 Check services:"
echo "   pm2 list"
echo "   pm2 logs lottery-api"
echo "   pm2 logs lottery-web"
echo ""
echo "🔄 To update later:"
echo "   cd /var/www/lottery"
echo "   git pull origin main"
echo "   cd apps/api && npm run build"
echo "   cd ../web && npm run build"
echo "   pm2 restart all"
echo ""
echo "========================================="
