# ========================================
# 🚀 FINAL DEPLOYMENT - ครั้งสุดท้าย
# ========================================
# เริ่มใหม่ทั้งหมดตั้งแต่ต้น
# Copy-paste ทั้งหมดเข้า VPS ได้เลย
# ========================================

# STEP 1: ลบ directory เก่า (ถ้ามี)
echo "🧹 Cleaning old installation..."
cd /var/www
rm -rf lottery

# STEP 2: Clone Repository
echo "📥 Cloning from GitHub..."
git clone https://github.com/suchetpongs-ai/lottery.git lottery

# ตรวจสอบว่า clone สำเร็จ
if [ ! -d "/var/www/lottery" ]; then
    echo "❌ Git clone FAILED!"
    exit 1
fi

echo "✅ Git clone SUCCESS!"
cd /var/www/lottery
ls -la

# STEP 3: Setup Environment Variables
echo "⚙️ Setting up environment..."
cd /var/www/lottery/apps/api

cat > .env << 'EOF'
DATABASE_URL="postgresql://lottery_user:L0ttery@2024!Strong@localhost:5432/lottery_db?schema=public"
NODE_ENV="production"
JWT_SECRET="abcdef1234567890abcdef1234567890abcdef1234567890"
PORT=3001
TWEASY_API_URL="https://api.tweasy.com"
TWEASY_API_KEY="your_api_key_here"
TWEASY_SECRET_KEY="your_secret_key_here"
FRONTEND_URL="http://76.13.18.170"
API_URL="http://76.13.18.170/api"
EOF

echo "✅ Environment configured!"

# STEP 4: Install Dependencies
echo "📦 Installing dependencies..."
cd /var/www/lottery

npm install
cd apps/api && npm install
cd ../web && npm install

echo "✅ Dependencies installed!"

# STEP 5: Build Backend
echo "🔨 Building backend..."
cd /var/www/lottery/apps/api
npm run build

# ตรวจสอบ
if [ ! -f "dist/main.js" ]; then
    echo "❌ Backend build FAILED!"
    exit 1
fi

echo "✅ Backend build SUCCESS!"
ls -lh dist/main.js

# STEP 6: Build Frontend
echo "🔨 Building frontend..."
cd /var/www/lottery/apps/web
npm run build

# ตรวจสอบ
if [ ! -d ".next" ]; then
    echo "❌ Frontend build FAILED!"
    exit 1
fi

echo "✅ Frontend build SUCCESS!"
ls -la .next

# STEP 7: Stop Old Services
echo "🛑 Stopping old services..."
pm2 delete all 2>/dev/null || true

# STEP 8: Start Backend
echo "🚀 Starting backend..."
cd /var/www/lottery/apps/api
pm2 start dist/main.js --name lottery-api

# STEP 9: Start Frontend
echo "🚀 Starting frontend..."
cd /var/www/lottery/apps/web
pm2 start npm --name lottery-web -- start

# STEP 10: Save PM2 Config
pm2 save
pm2 startup

# STEP 11: Check Status
echo ""
echo "========================================="
echo "✅ ✅ ✅ DEPLOYMENT COMPLETE! ✅ ✅ ✅"
echo "========================================="
echo ""

pm2 list

echo ""
echo "🌐 Website: http://76.13.18.170"
echo ""
echo "📊 Check logs:"
echo "   pm2 logs lottery-api --lines 20"
echo "   pm2 logs lottery-web --lines 20"
echo ""
echo "========================================="
