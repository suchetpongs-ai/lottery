#!/bin/bash
# DOMAIN_DEPLOY.sh - Deploy Lottery Platform to hauythai.com with SSL
set -e

DOMAIN="hauythai.com"
EMAIL="admin@hauythai.com" # Change this if needed
VPS_IP="76.13.18.170"

echo "========================================="
echo "🚀 DEPLOYING TO $DOMAIN"
echo "========================================="

# 1. Update System & Install Requirements
echo "📦 Updating system and installing dependencies..."
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 2. Stop existing PM2 processes to free up resources/ports
echo "🛑 Stopping existing services..."
pm2 delete all || true

# 3. Standard Deployment Steps (Clone/Pull, Install, Build)
# We reuse the logic from VPS_DEPLOY.sh effectively here
echo "🔄 Preparing application..."

# Ensure we are in the right directory
if [ -d "/var/www/lottery" ]; then
    cd /var/www/lottery
    echo "⬇️  Pulling latest code..."
    git pull origin main
else
    echo "⚠️  /var/www/lottery not found. Resizing to standard install..."
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/suchetpongs-ai/lottery.git
    cd lottery
fi

# 4. Configure Environment Variables for Domain
echo "📝 Configuring Environment Variables..."

# API .env - Update URLs to HTTPS domain
cat > apps/api/.env << EOF
DATABASE_URL="postgresql://lottery_user:lottery_pass_2024@localhost:5432/lottery_db"
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
PORT=3001
TWEASY_API_URL=https://api.tweasy.com
TWEASY_API_KEY=your_api_key_here
TWEASY_SECRET_KEY=your_secret_key_here
FRONTEND_URL=https://$DOMAIN
API_URL=https://$DOMAIN/api
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF

# Web .env.local - Update API URL
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=/api
EOF

# 5. Install Dependencies & Build
echo "📦 Installing Dependencies & Building..."
rm -rf node_modules
rm -rf apps/api/node_modules
rm -rf apps/web/node_modules
npm install

# Generate Prisma
export DATABASE_URL="postgresql://lottery_user:lottery_pass_2024@localhost:5432/lottery_db"
cd apps/api
# Ensure PostgreSQL provider is set (idempotent check)
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma
npx prisma generate
npx prisma db push --accept-data-loss
cd ../..

# Build
echo "🏗️  Building API..."
npm run build -w apps/api

echo "🏗️  Building Web..."
npm run build -w apps/web

# 6. Start Services via PM2
echo "🚀 Starting PM2 services..."
cd apps/api
pm2 start dist/src/main.js --name lottery-api
cd ../web
pm2 start npm --name lottery-web -- start
pm2 save
cd ../..

# 7. Configure Nginx
echo "🌐 Configuring Nginx Reverse Proxy..."
TARGET_CONF="/etc/nginx/sites-available/$DOMAIN"

sudo bash -c "cat > $TARGET_CONF << 'EOF'
server {
    server_name $DOMAIN www.$DOMAIN;

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF"

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 8. Setup SSL with Certbot
echo "🔒 Setting up SSL with Let's Encrypt..."
echo "NOTE: This requires your DNS to be already pointing to $VPS_IP"

# We use --non-interactive and --agree-tos to automate it, but it might fail if DNS isn't ready.
# We also redirect http to https automatically.
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect || {
    echo "⚠️  SSL Setup failed! Check your DNS settings."
    echo "You can try running 'sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN' manually later."
}

echo ""
echo "========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================================="
echo "🌍 Website: https://$DOMAIN"
echo "🔌 API: https://$DOMAIN/api"
