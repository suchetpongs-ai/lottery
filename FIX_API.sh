#!/bin/bash

# Fix API Routes - Add global /api prefix

echo "=== Fixing API to add /api prefix ==="

cd /var/www/lottery/apps/api/src

# Backup original
cp main.ts main.ts.backup

# Add setGlobalPrefix after app creation
sed -i "/const app = await NestFactory.create/a\  \n  // Add global API prefix\n  app.setGlobalPrefix('api');" main.ts

echo "Updated main.ts - rebuilding..."
cd /var/www/lottery/apps/api
npm run build

echo "Restarting API..."
pm2 restart lottery-api

sleep 3

echo "Testing..."
curl -I http://localhost:3001/api

echo ""
echo "✅ Done! API should now respond on /api"
