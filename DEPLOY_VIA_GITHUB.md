# 🚀 Deploy via GitHub - Complete Guide

## 📋 Overview
Deploy Lottery Platform ผ่าน GitHub แทนการอัพโหลด FTP - สะดวก รวดเร็ว และมี version control

---

## ✅ ไฟล์ที่แก้ไขทั้งหมด (7 ไฟล์)

```
1. apps/web/lib/api/hooks/useLottery.ts
2. apps/web/lib/api/hooks/useOrders.ts
3. apps/web/components/lottery/TicketCard.tsx
4. apps/web/app/[locale]/admin/tickets/upload/page.tsx
5. apps/web/app/[locale]/browse/page.tsx
6. apps/web/store/cartStore.ts
7. apps/web/app/[locale]/checkout/page.tsx
```

---

## 🔧 Part 1: Setup Git และ Push to GitHub

### Step 1: ตรวจสอบ .gitignore

```bash
# ตรวจสอบว่ามี .gitignore หรือยัง
cat .gitignore

# ถ้าไม่มี ให้สร้างใหม่ (ไฟล์นี้มีอยู่แล้วจาก previous session)
```

**ตรวจสอบว่า .gitignore มีบรรทัดเหล่านี้:**
```
node_modules/
.next/
dist/
.env
.env.local
.server-info.txt
*.log
```

---

### Step 2: Git Commit และ Push

```bash
# ใน c:\Antigravity\Lottery

# Check git status
git status

# Add ไฟล์ทั้งหมดที่แก้
git add apps/web/lib/api/hooks/useLottery.ts
git add apps/web/lib/api/hooks/useOrders.ts
git add apps/web/components/lottery/TicketCard.tsx
git add apps/web/app/[locale]/admin/tickets/upload/page.tsx
git add apps/web/app/[locale]/browse/page.tsx
git add apps/web/store/cartStore.ts
git add apps/web/app/[locale]/checkout/page.tsx

# Commit
git commit -m "Fix all TypeScript errors for production deployment"

# Push to GitHub (ใช้ branch ที่คุณต้องการ)
git push origin main
# หรือ
git push origin master
```

> **หมายเหตุ:** ถ้ายังไม่มี GitHub repo ให้สร้างก่อน:
> 1. ไปที่ https://github.com/new
> 2. สร้าง repository (public หรือ private)
> 3. Copy URL (เช่น `https://github.com/username/lottery.git`)
> 4. รัน: `git remote add origin https://github.com/username/lottery.git`
> 5. Push: `git push -u origin main`

---

## 🖥️ Part 2: Deploy บน VPS ผ่าน Git Pull

### Step 1: SSH เข้า VPS

```bash
ssh root@76.13.18.170
# ใส่ password จาก .server-info.txt
```

---

### Step 2: Clone หรือ Pull Repository

#### ถ้ายังไม่เคย Clone (ครั้งแรก):

```bash
# ลบ folder เก่า (ระวัง! จะลบทุกอย่าง)
rm -rf /var/www/lottery

# Clone repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/lottery.git lottery

# ถ้าเป็น private repo จะต้อง authenticate
# แนะนำใช้ Personal Access Token แทน password
```

#### ถ้ามี Repo อยู่แล้ว (Update):

```bash
cd /var/www/lottery

# Stash local changes (ถ้ามี)
git stash

# Pull latest code
git pull origin main
# หรือ
git pull origin master

# ถ้า pull ไม่ได้ลอง reset
git fetch origin
git reset --hard origin/main
```

---

### Step 3: Setup Environment Variables

```bash
cd /var/www/lottery/apps/api

# สร้าง .env file (ถ้ายังไม่มี)
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
```

---

### Step 4: Install Dependencies

```bash
# ใน /var/www/lottery

# Install root dependencies
npm install

# Install backend dependencies
cd apps/api
npm install

# Install frontend dependencies  
cd ../web
npm install
```

---

### Step 5: Build และ Run

```bash
# ========================================
# Clean Everything
# ========================================
cd /var/www/lottery
rm -rf apps/api/dist apps/web/.next apps/web/node_modules/.cache

# ========================================
# Build Backend
# ========================================
cd /var/www/lottery/apps/api
npm run build

# Verify
ls -la dist/main.js

# ========================================
# Build Frontend
# ========================================
cd /var/www/lottery/apps/web
npm run build

# ========================================
# Stop Old Services
# ========================================
pm2 delete all

# ========================================
# Start Backend
# ========================================
cd /var/www/lottery/apps/api
pm2 start dist/main.js --name lottery-api

# ========================================
# Start Frontend
# ========================================
cd /var/www/lottery/apps/web
pm2 start npm --name lottery-web -- start

# ========================================
# Save และ Check
# ========================================
pm2 save
pm2 list

echo "✅ Deploy ผ่าน GitHub สำเร็จ!"
```

---

## 🔄 สำหรับการ Update ครั้งต่อไป

เมื่อมีการแก้ไข code ใหม่:

### บน Local Machine:
```bash
git add .
git commit -m "Update: your message"
git push origin main
```

### บน VPS:
```bash
cd /var/www/lottery
git pull origin main

# Build Backend
cd apps/api
npm run build

# Build Frontend
cd ../web
npm run build

# Restart Services
pm2 restart all

echo "✅ อัพเดทเสร็จสมบูรณ์!"
```

---

## 🎯 ข้อดีของการใช้ GitHub

✅ **ไม่ต้องอัพโหลดทีละไฟล์** - แค่ `git push`  
✅ **Version Control** - ย้อนกลับได้ตลอดเวลา  
✅ **ง่ายต่อการ Update** - แค่ `git pull` บน VPS  
✅ **Track Changes** - รู้ว่าเปลี่ยนอะไรบ้าง  
✅ **Collaboration** - ทีมหลายคนทำงานร่วมกันได้  
✅ **Backup** - Code อยู่บน cloud

---

## 🔐 Security Note

**⚠️ สำคัญ!** อย่า commit ไฟล์เหล่านี้:
- `.env` (มี credentials)
- `.server-info.txt` (มี password)
- `node_modules/` (ไฟล์เยอะ)
- `.next/` (build output)
- `dist/` (build output)

ตรวจสอบว่า `.gitignore` มีไฟล์เหล่านี้แล้ว!

---

## 📝 Quick Reference Commands

### Local (Windows):
```bash
git status
git add .
git commit -m "message"
git push origin main
```

### VPS (Linux):
```bash
cd /var/www/lottery
git pull origin main
cd apps/api && npm run build
cd ../web && npm run build
pm2 restart all
```

---

## ✅ Verification Checklist

- [ ] Git push สำเร็จบน local
- [ ] Git pull สำเร็จบน VPS
- [ ] Backend build สำเร็จ (`dist/main.js` มี)
- [ ] Frontend build สำเร็จ (`.next` มี)
- [ ] PM2 แสดง status **online** ทั้ง 2
- [ ] เว็บ `http://76.13.18.170` เปิดได้
- [ ] Browse ได้
- [ ] Cart ทำงาน
- [ ] Checkout แสดงข้อมูลถูกต้อง

---

**สร้างเมื่อ:** 2026-01-14 20:25  
**Method:** GitHub Deployment  
**สถานะ:** Ready to Deploy 🚀
