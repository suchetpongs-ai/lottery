# 🚀 Quick Start: Push to GitHub - ทำตามขั้นตอนนี้

## ⚡ Part 1: สร้าง GitHub Repository (ทำครั้งเดียว)

### Option A: สร้าง Repo ใหม่
1. ไปที่: https://github.com/new
2. **Repository name**: `lottery` (หรือชื่ออื่นที่คุณต้องการ)
3. **Public/Private**: เลือกตามต้องการ (แนะนำ Private ถ้ามี credentials)
4. **ไม่ต้องติ๊ก** README, .gitignore, license (เรามีอยู่แล้ว)
5. คลิก **Create repository**
6. **Copy URL** ที่ได้ เช่น:
   - `https://github.com/USERNAME/lottery.git`

---

## ⚡ Part 2: เชื่อม Git กับ GitHub

เปิด Terminal/PowerShell ใน `c:\Antigravity\Lottery` แล้วรัน:

```bash
# ลบ remote เก่า (ที่เป็น placeholder)
git remote remove origin

# เพิ่ม remote ใหม่ (แทนที่ URL ด้วย repo ของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/lottery.git

# ตรวจสอบ
git remote -v
```

---

## ⚡ Part 3: Push Code ไป GitHub

```bash
# สร้าง branch main (ถ้ายังไม่มี)
git branch -M main

# Push ครั้งแรก
git push -u origin main
```

**ถ้าขึ้น Authentication:**
- **Username**: GitHub username ของคุณ
- **Password**: ใช้ **Personal Access Token** (ไม่ใช่ password ธรรมดา)

### วิธีสร้าง Personal Access Token:
1. ไปที่: https://github.com/settings/tokens
2. คลิก **Generate new token** → **Generate new token (classic)**
3. ให้ชื่อ: `Lottery Deploy`
4. **Expiration**: 90 days (หรือตามต้องการ)
5. **Select scopes**: ✅ `repo` (ทั้งหมด)
6. คลิก **Generate token**
7. **Copy token** ทันที (จะเห็นแค่ครั้งเดียว!)
8. ใช้ token นี้แทน password ตอน git push

---

## ⚡ Part 4: ตรวจสอบว่า Push สำเร็จ

```bash
# ดูสถานะ
git status

# ดู commits
git log --oneline
```

ไปเช็คที่ `https://github.com/YOUR_USERNAME/lottery` ต้องเห็น code!

---

## ⚡ Part 5: Deploy บน VPS

### Step 1: SSH เข้า VPS
```bash
ssh root@76.13.18.170
# Password: (ดูใน .server-info.txt)
```

### Step 2: Clone Repository (ครั้งแรก)

```bash
# ลบ folder เก่า (ระวัง!)
cd /var/www
rm -rf lottery

# Clone repo ของคุณ (เปลี่ยน URL)
git clone https://github.com/YOUR_USERNAME/lottery.git lottery

cd lottery
```

**ถ้าเป็น Private Repo:**
```bash
# ต้อง authenticate ด้วย Personal Access Token เหมือนกัน
# Username: GitHub username
# Password: Personal Access Token
```

### Step 3: Setup Environment

```bash
# สร้าง .env ใน backend
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
```

### Step 4: Install Dependencies

```bash
cd /var/www/lottery

# Root
npm install

# Backend
cd apps/api
npm install

# Frontend
cd ../web
npm install
```

### Step 5: Build & Run

```bash
# Clean
cd /var/www/lottery
rm -rf apps/api/dist apps/web/.next

# Build Backend
cd apps/api
npm run build
ls -la dist/main.js  # ต้องเห็นไฟล์นี้

# Build Frontend
cd ../web
npm run build

# Stop old services
pm2 delete all

# Start Backend
cd /var/www/lottery/apps/api
pm2 start dist/main.js --name lottery-api

# Start Frontend
cd /var/www/lottery/apps/web
pm2 start npm --name lottery-web -- start

# Save
pm2 save
pm2 list

echo "✅ Deploy สำเร็จ!"
```

---

## 🔄 สำหรับการ Update ครั้งต่อไป

### บน Local:
```bash
git add .
git commit -m "Update message"
git push origin main
```

### บน VPS:
```bash
cd /var/www/lottery
git pull origin main
cd apps/api && npm run build
cd ../web && npm run build
pm2 restart all
```

---

## ✅ Verification

```bash
# ดูสถานะ PM2
pm2 list

# ควรเห็น:
# lottery-api  - online
# lottery-web  - online

# ทดสอบเว็บ
curl http://76.13.18.170
```

เปิดเบราว์เซอร์: `http://76.13.18.170` ✅

---

## 🆘 Troubleshooting

### ถ้า git push ไม่ได้:
```bash
# ลอง force push (ระวัง!)
git push -f origin main
```

### ถ้า VPS git pull error:
```bash
cd /var/www/lottery
git fetch origin
git reset --hard origin/main
```

### ถ้า build error:
```bash
# ดู logs
pm2 logs lottery-api --lines 50
pm2 logs lottery-web --lines 50
```

---

**Status**: Ready to Push 🚀  
**Next**: ทำตาม Part 1-5 ตามลำดับ
