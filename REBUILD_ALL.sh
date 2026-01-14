# ========================================
# 🔧 FIX: Build Applications Properly
# ========================================
# ปัญหา: ไม่มี build files (dist/ และ .next/)
# แก้ไข: Build ทั้ง backend และ frontend ให้ถูกต้อง
# ========================================

# STEP 1: หยุด PM2 services ทั้งหมด
pm2 delete all

# STEP 2: ไปที่ root directory
cd /var/www/lottery

# STEP 3: ตรวจสอบว่าอยู่ที่ถูกต้อง
pwd
# ต้องแสดง: /var/www/lottery

ls -la
# ต้องเห็น apps/ และ package.json

# STEP 4: Clean ทุกอย่าง
echo "🧹 Cleaning old builds..."
rm -rf apps/api/dist
rm -rf apps/web/.next
rm -rf apps/web/node_modules/.cache
rm -rf node_modules

# STEP 5: Install Dependencies (ทั้งหมดใหม่)
echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd apps/api
npm install

echo "📦 Installing frontend dependencies..."
cd ../web
npm install

# STEP 6: Build Backend
echo "🔨 Building backend..."
cd /var/www/lottery/apps/api
npm run build

# ตรวจสอบว่า build สำเร็จ
if [ -f "dist/main.js" ]; then
    echo "✅ Backend build SUCCESS!"
    ls -lh dist/main.js
else
    echo "❌ Backend build FAILED!"
    echo "Check errors above"
    exit 1
fi

# STEP 7: Build Frontend
echo "🔨 Building frontend..."
cd /var/www/lottery/apps/web
npm run build

# ตรวจสอบว่า build สำเร็จ
if [ -d ".next" ]; then
    echo "✅ Frontend build SUCCESS!"
    ls -la .next
else
    echo "❌ Frontend build FAILED!"
    echo "Check errors above"
    exit 1
fi

# STEP 8: Start Services
echo "🚀 Starting services..."

# Start Backend
cd /var/www/lottery/apps/api
pm2 start dist/main.js --name lottery-api

# Start Frontend
cd /var/www/lottery/apps/web
pm2 start npm --name lottery-web -- start

# Save PM2
pm2 save

# STEP 9: Check Status
echo ""
echo "========================================="
echo "✅ Checking Services Status"
echo "========================================="
pm2 list

echo ""
echo "========================================="
echo "📊 Service Details"
echo "========================================="
pm2 describe lottery-api
pm2 describe lottery-web

echo ""
echo "========================================="
echo "🌐 Test Website"
echo "========================================="
curl -I http://localhost:3000

echo ""
echo "✅ Done! Open: http://76.13.18.170"
