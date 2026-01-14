#!/bin/bash
# 🚀 Script Setup Server อัตโนมัติสำหรับ Hostinger VPS
# คัดลอกสคริปต์นี้ไปรันบน VPS

set -e  # หยุดถ้าเจอ error

echo "🚀 เริ่มต้น Setup Server..."

# 1. Update ระบบ
echo "📦 Update ระบบ..."
apt update && apt upgrade -y

# 2. ติดตั้ง Node.js 20
echo "📦 ติดตั้ง Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "✅ Node.js version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# 3. ติดตั้ง PM2
echo "📦 ติดตั้ง PM2..."
npm install -g pm2

# 4. ติดตั้ง PostgreSQL
echo "📦 ติดตั้ง PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
echo "✅ PostgreSQL ติดตั้งเสร็จ"

# 5. สร้าง Database
echo "📦 สร้าง Database..."
sudo -u postgres psql -c "CREATE DATABASE lottery_db;" 2>/dev/null || echo "Database อาจมีอยู่แล้ว"
sudo -u postgres psql -c "CREATE USER lottery_user WITH ENCRYPTED PASSWORD 'L0ttery@2024!Strong';" 2>/dev/null || echo "User อาจมีอยู่แล้ว"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lottery_db TO lottery_user;"
sudo -u postgres psql -c "ALTER DATABASE lottery_db OWNER TO lottery_user;"
echo "✅ Database lottery_db พร้อมใช้งาน"

# 6. ติดตั้ง Nginx
echo "📦 ติดตั้ง Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo "✅ Nginx ติดตั้งเสร็จ"

# 7. ติดตั้ง Git
echo "📦 ติดตั้ง Git..."
apt install -y git
echo "✅ Git version: $(git --version)"

# 8. ติดตั้ง Certbot (สำหรับ SSL)
echo "📦 ติดตั้ง Certbot..."
apt install -y certbot python3-certbot-nginx

# 9. สร้างโฟลเดอร์สำหรับโปรเจค
echo "📁 สร้างโฟลเดอร์..."
mkdir -p /var/www/lottery
chown -R root:root /var/www/lottery

# 10. ติดตั้ง tools เสริม
echo "📦 ติดตั้ง tools เสริม..."
apt install -y curl wget unzip htop

# 11. ตั้งค่า Firewall
echo "🔒 ตั้งค่า Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "✅ ========================================="
echo "✅ Setup Server เสร็จสมบูรณ์!"
echo "✅ ========================================="
echo ""
echo "📋 ข้อมูลสำคัญ:"
echo "   - Database: lottery_db"
echo "   - DB User: lottery_user"
echo "   - DB Password: L0ttery@2024!Strong"
echo "   - Project Folder: /var/www/lottery"
echo ""
echo "🎯 ขั้นตอนถัดไป:"
echo "   1. อัพโหลดโค้ดไปที่ /var/www/lottery"
echo "   2. สร้างไฟล์ .env"
echo "   3. Build โปรเจค"
echo "   4. Run ด้วย PM2"
echo ""
