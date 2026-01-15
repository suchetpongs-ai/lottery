#!/bin/bash

# Lottery Platform - Fresh Deployment Script
# Run this on the VPS to deploy from GitHub

echo "=== Starting Fresh Deployment ==="

# 1. Stop all PM2 processes
echo "Stopping PM2 services..."
pm2 stop all
pm2 delete all

# 2. Backup old deployment
echo "Backing up old deployment..."
cd /var/www
if [ -d "lottery" ]; then
    mv lottery lottery_backup_$(date +%Y%m%d_%H%M%S)
fi

# 3. Clone from GitHub
echo "Cloning from GitHub..."
git clone https://github.com/suchetpongs-ai/lottery.git
cd lottery

# 4. Create .env for API
echo "Creating API .env..."
cat > apps/api/.env << 'EOF'
DATABASE_URL="postgresql://lottery_user:L0ttery@2024!Strong@localhost:5432/lottery_db?schema=public"
NODE_ENV="production"
JWT_SECRET="abcdef1234567890abcdef1234567890abcdef1234567890"
PORT=3001
TWEASY_API_URL="https://api.tweasy.com"
TWEASY_API_KEY="your_api_key_here"
TWEASY_SECRET_KEY="your_secret_key_here"
FRONTEND_URL="http://76.13.18.170"
API_URL="http://76.13.18.170/api"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
EOF

# 5. Create .env for Web
echo "Creating Web .env..."
echo "NEXT_PUBLIC_API_URL=/api" > apps/web/.env

# 6. Install dependencies
echo "Installing dependencies (this may take a few minutes)..."
npm install

# 7. Build API
echo "Building API..."
cd apps/api
npx prisma generate
npx prisma db push
npm run build

# 8. Build Web
echo "Building Web..."
cd ../web
npm run build

# 9. Start services with PM2
echo "Starting services..."
cd /var/www/lottery
pm2 start apps/api/dist/src/main.js --name lottery-api
pm2 start apps/web/.next/standalone/server.js --name lottery-web
pm2 save

# 10. Verify
echo ""
echo "=== Deployment Complete ==="
echo "Checking services..."
pm2 list
echo ""
echo "Testing API..."
curl -I http://localhost:3001/api
echo ""
echo "Testing Web..."
curl -I http://localhost:3000
echo ""
echo "✅ Done! Visit http://76.13.18.170"
