# 🎯 VPS Deployment Instructions

## ✅ Part 1: Code อยู่บน GitHub แล้ว!

Repository: **https://github.com/suchetpongs-ai/lottery**

---

## 🖥️ Part 2: Deploy บน VPS

### Step 1: เข้า VPS ผ่าน SSH

```bash
ssh root@76.13.18.170
# Password: (ดูใน .server-info.txt)
```

---

### Step 2: รัน Deployment Script

#### Option A: รันทีละคำสั่ง (แนะนำสำหรับครั้งแรก)

```bash
# ========================================
# 1. Clone Repository
# ========================================
cd /var/www
rm -rf lottery
git clone https://github.com/suchetpongs-ai/lottery.git lottery
cd lottery

# ========================================
# 2. Setup Environment
# ========================================
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

# ========================================
# 3. Install Dependencies
# ========================================
cd /var/www/lottery
npm install

cd apps/api
npm install

cd ../web
npm install

# ========================================
# 4. Build Applications
# ========================================
cd /var/www/lottery
rm -rf apps/api/dist apps/web/.next

# Backend
cd apps/api
npm run build
ls -la dist/main.js  # ตรวจสอบว่า build สำเร็จ

# Frontend
cd ../web
npm run build

# ========================================
# 5. Start PM2 Services
# ========================================
pm2 delete all

cd /var/www/lottery/apps/api
pm2 start dist/main.js --name lottery-api

cd /var/www/lottery/apps/web
pm2 start npm --name lottery-web -- start

pm2 save
pm2 list

echo "✅ Deploy สำเร็จ!"
```

#### Option B: ใช้ Script (รวดเร็ว)

```bash
# Download deployment script
cd ~
wget https://raw.githubusercontent.com/suchetpongs-ai/lottery/main/vps-deploy.sh
chmod +x vps-deploy.sh

# Run deployment
./vps-deploy.sh
```

---

## 🔍 Verification

### ตรวจสอบ Services

```bash
pm2 list
# ต้องเห็น lottery-api และ lottery-web เป็น "online"

pm2 logs lottery-api --lines 20 --nostream
pm2 logs lottery-web --lines 20 --nostream
```

### ทดสอบเว็บ

```bash
curl http://76.13.18.170
curl http://76.13.18.170/api
```

**เปิดเบราว์เซอร์:** `http://76.13.18.170` ✅

---

## 🔄 สำหรับ Update ครั้งถัดไป

เมื่อมีการ push code ใหม่ไป GitHub:

```bash
cd /var/www/lottery
git pull origin main
cd apps/api && npm run build
cd ../web && npm run build
pm2 restart all
```

---

## 🆘 Troubleshooting

### ถ้า Git Clone ไม่ได้:
```bash
# ถ้า repo เป็น private ต้อง authenticate
git clone https://YOUR_TOKEN@github.com/suchetpongs-ai/lottery.git lottery
```

### ถ้า Build Error:
```bash
cd /var/www/lottery/apps/api
npm run build 2>&1 | tee build-api.log
cat build-api.log

cd /var/www/lottery/apps/web
npm run build 2>&1 | tee build-web.log
cat build-web.log
```

### ถ้า PM2 Error:
```bash
pm2 logs --lines 100
pm2 describe lottery-api
pm2 describe lottery-web
pm2 restart all
```

### ถ้ายังเจอ 502 Bad Gateway:
```bash
sudo systemctl restart nginx
pm2 restart all
pm2 logs
```

---

## ✅ Success Checklist

- [ ] Git clone สำเร็จ
- [ ] Dependencies ติดตั้งสำเร็จ
- [ ] Backend build สำเร็จ (มี dist/main.js)
- [ ] Frontend build สำเร็จ (มี .next)
- [ ] PM2 services online ทั้ง 2
- [ ] เว็บเปิดได้ที่ http://76.13.18.170
- [ ] Browse ทำงาน
- [ ] Cart ทำงาน
- [ ] Checkout ทำงาน

---

## 📊 Expected Output

```bash
pm2 list
┌────┬────────────────┬─────────┬─────────┬──────────┐
│ id │ name           │ mode    │ pid     │ status   │
├────┼────────────────┼─────────┼─────────┼──────────┤
│ 0  │ lottery-api    │ fork    │ 12345   │ online   │
│ 1  │ lottery-web    │ fork    │ 12346   │ online   │
└────┴────────────────┴─────────┴─────────┴──────────┘
```

---

**Repository:** https://github.com/suchetpongs-ai/lottery  
**Status:** Ready for VPS Deployment 🚀  
**Date:** 2026-01-14
