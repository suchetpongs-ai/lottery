#!/bin/bash
# Fresh Start - Clean Install Script for Lottery Platform
set -e

echo "========================================="
echo "🧹 FRESH START - CLEAN INSTALLATION"
echo "========================================="

# 1. Stop all PM2 processes
echo "📛 Stopping PM2 processes..."
pm2 delete all || true
pm2 kill

# 2. Remove old installation
echo "🗑️  Removing old installation..."
rm -rf /var/www/lottery
rm -rf /var/www/lottery_old

# 3. Drop and recreate PostgreSQL database
echo "🗄️  Resetting PostgreSQL database..."
sudo -u postgres psql << 'SQLEOF'
DROP DATABASE IF EXISTS lottery_db;
DROP USER IF EXISTS lottery_user;
CREATE DATABASE lottery_db;
CREATE USER lottery_user WITH ENCRYPTED PASSWORD 'lottery_pass_2024';
GRANT ALL PRIVILEGES ON DATABASE lottery_db TO lottery_user;
\c lottery_db
GRANT ALL ON SCHEMA public TO lottery_user;
SQLEOF

# 4. Ensure PostgreSQL uses md5 authentication
echo "🔐 Configuring PostgreSQL authentication..."
sudo bash -c 'cat > /tmp/pg_hba_new.conf << "EOF"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
EOF'
sudo cp /tmp/pg_hba_new.conf /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql
sleep 2

# 5. Test PostgreSQL connection
echo "🧪 Testing PostgreSQL connection..."
PGPASSWORD=lottery_pass_2024 psql -U lottery_user -h localhost -d lottery_db -c "SELECT 1;" || {
    echo "❌ PostgreSQL connection failed!"
    exit 1
}
echo "✅ PostgreSQL connection successful!"

# 6. Clone repository
echo "📦 Cloning repository..."
cd /var/www
git clone https://github.com/suchetpongs-ai/lottery.git
cd lottery

# 7. Create API .env file
echo "📝 Creating API .env file..."
cat > apps/api/.env << 'EOF'
DATABASE_URL="postgresql://lottery_user:lottery_pass_2024@localhost:5432/lottery_db"
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
PORT=3001
TWEASY_API_URL=https://api.tweasy.com
TWEASY_API_KEY=your_api_key_here
TWEASY_SECRET_KEY=your_secret_key_here
FRONTEND_URL=http://76.13.18.170
API_URL=http://76.13.18.170/api
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF

# 8. Create Web .env file
echo "📝 Creating Web .env file..."
cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=/api
EOF

# 9. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 10. Generate Prisma Client
echo "🔨 Generating Prisma Client..."
export DATABASE_URL="postgresql://lottery_user:lottery_pass_2024@localhost:5432/lottery_db"
cd apps/api

# Force PostgreSQL for Production
echo "🔄 Switching Database provider to PostgreSQL..."
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

npx prisma generate

# 11. Push database schema
echo "📊 Pushing database schema..."
npx prisma db push --accept-data-loss

# 12. Build API
echo "🏗️  Building API..."
npm run build

# 13. Build Web
echo "🏗️  Building Web..."
cd /var/www/lottery/apps/web
npm run build

# 14. Start services with PM2
echo "🚀 Starting services..."
cd /var/www/lottery/apps/api
pm2 start dist/src/main.js --name lottery-api
cd /var/www/lottery/apps/web
pm2 start npm --name lottery-web -- start
pm2 save

# 15. Wait and verify
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "========================================="
echo "✅ INSTALLATION COMPLETE!"
echo "========================================="
echo ""
pm2 list
echo ""
echo "🧪 Testing API..."
curl http://localhost:3001/api || echo "⚠️  API not responding yet"
echo ""
echo ""
echo "📋 API Logs:"
pm2 logs lottery-api --lines 15 --nostream
echo ""
echo "========================================="
echo "🎉 Deployment should be ready!"
echo "Visit: http://76.13.18.170"
echo "========================================="
