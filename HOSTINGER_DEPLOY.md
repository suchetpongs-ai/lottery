# 🎯 คู่มือ Deploy บน Hostinger VPS

## ข้อมูลที่ได้จาก Hostinger
```
IP Address: YOUR_VPS_IP (เช่น 123.45.67.89)
Username: root
Password: YOUR_PASSWORD
```

---

## 📋 ขั้นตอนที่ 1: เชื่อมต่อ VPS

### Windows (ใช้ PowerShell หรือ PuTTY):
```powershell
ssh root@YOUR_VPS_IP
# กรอก password
```

### macOS/Linux:
```bash
ssh root@YOUR_VPS_IP
# กรอก password
```

---

## 🔧 ขั้นตอนที่ 2: Setup Server (ทำครั้งเดียว)

### 1. Update ระบบ
```bash
apt update && apt upgrade -y
```

### 2. ติดตั้ง Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # ตรวจสอบว่าติดตั้งสำเร็จ
```

### 3. ติดตั้ง PM2 (Process Manager)
```bash
npm install -g pm2
```

### 4. ติดตั้ง PostgreSQL
```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### 5. สร้าง Database
```bash
sudo -u postgres psql

# ใน PostgreSQL prompt:
CREATE DATABASE lottery_db;
CREATE USER lottery_user WITH ENCRYPTED PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE lottery_db TO lottery_user;
\q
```

### 6. ติดตั้ง Nginx (Web Server)
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 7. ติดตั้ง Git
```bash
apt install -y git
```

---

## 📦 ขั้นตอนที่ 3: อัพโหลดโค้ด

### ตัวเลือก A: ใช้ Git (แนะนำ)

```bash
# สร้างโฟลเดอร์
cd /var/www
mkdir lottery
cd lottery

# Clone repository (ถ้ามี GitHub)
git clone https://github.com/YOUR_USERNAME/lottery.git .

# หรือ push โค้ดจากเครื่องของคุณไปยัง GitHub ก่อน
```

### ตัวเลือก B: ใช้ FileZilla/WinSCP

1. **Download FileZilla**: https://filezilla-project.org
2. **เชื่อมต่อ SFTP**:
   - Host: `sftp://YOUR_VPS_IP`
   - Username: `root`
   - Password: `YOUR_PASSWORD`
   - Port: `22`
3. **อัพโหลด** โฟลเดอร์ทั้งหมดไปที่ `/var/www/lottery`

---

## ⚙️ ขั้นตอนที่ 4: Setup โปรเจค

```bash
cd /var/www/lottery

# ติดตั้ง dependencies
npm install

# สร้าง .env สำหรับ production
nano apps/api/.env
```

### เนื้อหาไฟล์ .env (Production):
```bash
# Database
DATABASE_URL="postgresql://lottery_user:your_strong_password_here@localhost:5432/lottery_db?schema=public"

# Application
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING_MIN_32_CHARS

# Tweasy Payment
TWEASY_API_URL=https://api.tweasy.com/v1
TWEASY_API_KEY=your_real_tweasy_api_key
TWEASY_SECRET_KEY=your_real_tweasy_secret_key

# URLs
FRONTEND_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api

# Cloudinary (ถ้าใช้)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**บันทึกไฟล์**: กด `Ctrl+X`, `Y`, `Enter`

---

## 🔨 ขั้นตอนที่ 5: Build โปรเจค

### Backend (API)
```bash
cd /var/www/lottery/apps/api

# Migrate database
npx prisma migrate deploy
npx prisma generate

# Build
npm run build
```

### Frontend (Web)
```bash
cd /var/www/lottery/apps/web

# Build
npm run build
```

---

## 🚀 ขั้นตอนที่ 6: Run ด้วย PM2

### เริ่ม Backend
```bash
cd /var/www/lottery/apps/api
pm2 start dist/main.js --name lottery-api
```

### เริ่ม Frontend
```bash
cd /var/www/lottery/apps/web
pm2 start npm --name lottery-web -- start
```

### บันทึกการตั้งค่า PM2
```bash
pm2 save
pm2 startup
# คัดลอกคำสั่งที่แสดงแล้ว run มัน
```

### ตรวจสอบสถานะ
```bash
pm2 list
pm2 logs lottery-api
pm2 logs lottery-web
```

---

## 🌐 ขั้นตอนที่ 7: ตั้งค่า Nginx (Reverse Proxy)

### สร้างไฟล์ config
```bash
nano /etc/nginx/sites-available/lottery
```

### เนื้อหา Nginx Config:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        rewrite ^/api(.*)$ $1 break;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Payment webhooks
    location /payment/ {
        proxy_pass http://localhost:3001/payment/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**บันทึก**: `Ctrl+X`, `Y`, `Enter`

### เปิดใช้งาน config
```bash
ln -s /etc/nginx/sites-available/lottery /etc/nginx/sites-enabled/
nginx -t  # ตรวจสอบ syntax
systemctl restart nginx
```

---

## 🔒 ขั้นตอนที่ 8: ติดตั้ง SSL (HTTPS)

### ใช้ Let's Encrypt (ฟรี)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# ตอบคำถาม:
# - Email: your@email.com
# - Agree: Y
# - Redirect HTTP to HTTPS: 2 (Yes)
```

### Auto-renew SSL
```bash
certbot renew --dry-run
```

---

## 🎯 ขั้นตอนที่ 9: ตั้งค่า Domain

### ใน Hostinger Dashboard:
1. ไป **Domains** → เลือก domain ของคุณ
2. คลิก **DNS / Name Servers**
3. เพิ่ม A Record:
   ```
   Type: A
   Name: @
   Points to: YOUR_VPS_IP
   TTL: 14400
   ```
4. เพิ่ม A Record สำหรับ www:
   ```
   Type: A
   Name: www
   Points to: YOUR_VPS_IP
   TTL: 14400
   ```
5. **Save Changes**

รอ 5-30 นาทีให้ DNS propagate

---

## ✅ ขั้นตอนที่ 10: ทดสอบ

### เข้าเว็บ
```
https://yourdomain.com
```

### ทดสอบ API
```
https://yourdomain.com/api/health
```

### ดู Logs
```bash
pm2 logs lottery-api --lines 50
pm2 logs lottery-web --lines 50
```

---

## 🔄 การอัพเดทโค้ด (ทำทุกครั้งที่มีการแก้ไข)

```bash
# SSH เข้า VPS
ssh root@YOUR_VPS_IP

# Pull code ใหม่
cd /var/www/lottery
git pull

# Update dependencies
npm install

# Rebuild
cd apps/api
npm run build

cd ../web
npm run build

# Restart services
pm2 restart lottery-api
pm2 restart lottery-web
```

---

## 🛡️ Security Best Practices

### 1. สร้าง user ใหม่ (ไม่ใช้ root)
```bash
adduser lottery
usermod -aG sudo lottery
su - lottery
```

### 2. ตั้งค่า Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 3. Disable root SSH login
```bash
nano /etc/ssh/sshd_config
# เปลี่ยน: PermitRootLogin no
systemctl restart sshd
```

---

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit
```

### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Database Backup (ทำทุกวัน)
```bash
# สร้าง backup script
nano /root/backup-db.sh
```

### เนื้อหา backup-db.sh:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

pg_dump -U lottery_user lottery_db > $BACKUP_DIR/lottery_$DATE.sql
find $BACKUP_DIR -name "lottery_*.sql" -mtime +7 -delete
```

```bash
chmod +x /root/backup-db.sh

# เพิ่มใน crontab (backup ทุกวัน 2AM)
crontab -e
# เพิ่มบรรทัด:
0 2 * * * /root/backup-db.sh
```

---

## 🎉 เสร็จสิ้น!

ระบบของคุณพร้อมใช้งานแล้วที่ `https://yourdomain.com`

### ต้นทุนรวม:
- Hostinger VPS KVM 2: ~฿600/เดือน
- Domain (.com): ~฿400/ปี
- SSL Certificate: ฟรี (Let's Encrypt)
- **รวม: ~฿633/เดือน**

---

## 🆘 แก้ปัญหาที่พบบ่อย

### ปัญหา: สีไม่แสดงผล
```bash
npm install -g serve
pm2 delete lottery-web
pm2 start "npm run start" --name lottery-web
```

### ปัญหา: Database connection error
```bash
# ตรวจสอบ PostgreSQL
systemctl status postgresql
sudo -u postgres psql -c "SELECT 1"
```

### ปัญหา: Port already in use
```bash
pm2 delete all
pm2 start ecosystem.config.js
```

---

**หากต้องการความช่วยเหลือเพิ่มเติม ติดต่อผมได้เลยครับ!**
