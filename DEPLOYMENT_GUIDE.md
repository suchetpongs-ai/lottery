# 🚀 คู่มือการ Deploy ระบบสลากดิจิทัล

## 1. การจัดการไฟล์อัพโหลด (File Upload)

### ตัวเลือกที่ 1: Cloudinary (แนะนำ - Free tier 25GB)

#### ติดตั้ง
```bash
cd apps/api
npm install cloudinary multer @types/multer
```

#### ตั้งค่า Cloudinary Service
สร้างไฟล์ `apps/api/src/common/cloudinary.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadImage(file: Express.Multer.File, folder: string = 'lottery'): Promise<string> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                }
            ).end(file.buffer);
        });
    }

    async deleteImage(publicId: string): Promise<void> {
        await cloudinary.uploader.destroy(publicId);
    }
}
```

#### อัปเดต KYC Service
แก้ไข `apps/api/src/kyc/kyc.service.ts`:

```typescript
import { CloudinaryService } from '../common/cloudinary.service';

export class KYCService {
    constructor(
        private prisma: PrismaService,
        private smsService: SMSService,
        private configService: ConfigService,
        private cloudinaryService: CloudinaryService, // เพิ่ม
    ) { }

    async uploadKYC(userId: number, files: { idCard?: Express.Multer.File, selfie?: Express.Multer.File }): Promise<void> {
        let idCardUrl: string = '';
        let selfieUrl: string = '';

        // อัปโหลดรูปบัตรประชาชน
        if (files.idCard) {
            idCardUrl = await this.cloudinaryService.uploadImage(files.idCard, 'kyc/id-cards');
        }

        // อัปโหลดรูปถ่าย
        if (files.selfie) {
            selfieUrl = await this.cloudinaryService.uploadImage(files.selfie, 'kyc/selfies');
        }

        // บันทึก URLs ลง database (ต้องเพิ่ม columns: idCardImageUrl, selfieImageUrl ใน User model)
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: 'Pending',
                // idCardImageUrl: idCardUrl,
                // selfieImageUrl: selfieUrl,
            },
        });
    }
}
```

#### เพิ่มใน .env
```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### สมัคร Cloudinary
1. ไป https://cloudinary.com/users/register/free
2. สมัครฟรี (25GB, 25K transformations/month)
3. คัดลอก credentials จาก Dashboard

---

## 2. Deploy ขึ้น Server

### ตัวเลือกที่ 1: Railway.app (ฟรี, ง่ายที่สุด) ⭐

#### ขั้นตอน:
1. **เตรียมโค้ด**
```bash
# สร้าง railway.json
```

2. **ไป** https://railway.app
3. **เลือก** "Deploy from GitHub repo"
4. **Connect GitHub** และเลือก repository
5. **ตั้งค่า Environment Variables**:
   ```
   DATABASE_URL=postgresql://...
   TWEASY_API_KEY=...
   TWEASY_SECRET_KEY=...
   CLOUDINARY_CLOUD_NAME=...
   (และอื่นๆ จาก .env)
   ```
6. **Deploy** - จะ auto-deploy ทุกครั้งที่ push

**Free Tier**: $5 credit/month (~500 hours)

---

### ตัวเลือกที่ 2: Vercel (Frontend) + Railway (Backend)

#### Frontend (Vercel):
```bash
cd apps/web
vercel
```

#### Backend (Railway):
- Deploy บน Railway ตามขั้นตอนด้านบน

---

### ตัวเลือกที่ 3: VPS (DigitalOcean, Vultr, AWS EC2)

#### ขั้นตอน:

**1. เช่า VPS**
- DigitalOcean Droplet ($4-5/month)
- Vultr ($3.50/month)

**2. ติดตั้ง Dependencies**
```bash
# SSH เข้า server
ssh root@your-server-ip

# ติดตั้ง Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง PM2 (Process Manager)
npm install -g pm2

# ติดตั้ง Nginx
sudo apt install nginx
```

**3. Clone โปรเจค**
```bash
git clone https://github.com/your-repo/lottery.git
cd lottery
npm install
```

**4. Build**
```bash
# Backend
cd apps/api
npm run build

# Frontend
cd ../web
npm run build
```

**5. ตั้งค่า PM2**
```bash
# Backend
cd apps/api
pm2 start dist/main.js --name lottery-api

# Frontend
cd apps/web
pm2 start npm --name lottery-web -- start

# บันทึกการตั้งค่า
pm2 save
pm2 startup
```

**6. ตั้งค่า Nginx**
```nginx
# /etc/nginx/sites-available/lottery
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# เปิดใช้งาน
sudo ln -s /etc/nginx/sites-available/lottery /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### ตัวเลือกที่ 4: Docker (Advanced)

**1. สร้าง Dockerfile**

`apps/api/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

`apps/web/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

**2. docker-compose.yml**
```yaml
version: '3.8'
services:
  api:
    build: ./apps/api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://...
      - TWEASY_API_KEY=...
    restart: unless-stopped

  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on:
      - api
    restart: unless-stopped
```

**3. Deploy**
```bash
docker-compose up -d
```

---

## 3. Database Production

### ตัวเลือก:

**1. Neon.tech (PostgreSQL - Free tier ดี)** ⭐
- 512MB storage ฟรี
- https://neon.tech

**2. PlanetScale (MySQL - Free tier)**
- 5GB storage ฟรี
- https://planetscale.com

**3. Supabase (PostgreSQL + Features)**
- 500MB storage ฟรี
- https://supabase.com

### Migration จาก SQLite ไป PostgreSQL:

**1. อัปเดต schema.prisma**
```prisma
datasource db {
  provider = "postgresql"  // เปลี่ยนจาก sqlite
  url      = env("DATABASE_URL")
}
```

**2. Update .env**
```bash
DATABASE_URL="postgresql://user:password@host:5432/lottery_db?schema=public"
```

**3. Run migration**
```bash
npx prisma migrate deploy
npx prisma generate
```

---

## 4. Checklist ก่อน Deploy

- [ ] เปลี่ยน `JWT_SECRET` เป็นค่าจริง (random string)
- [ ] ใส่ Tweasy credentials จริง
- [ ] ใส่ Cloudinary credentials (ถ้าใช้)
- [ ] เปลี่ยน `NODE_ENV=production`
- [ ] ตั้งค่า CORS ให้ถูกต้อง
- [ ] เปิด HTTPS (SSL Certificate)
- [ ] ตั้งค่า Database backup
- [ ] ทดสอบ Webhook URLs
- [ ] ตั้งค่า monitoring (optional: Sentry, LogRocket)

---

## 5. คำแนะนำ

### สำหรับเริ่มต้น (งบน้อย):
1. **Frontend**: Vercel (ฟรี)
2. **Backend**: Railway.app ($5/month)
3. **Database**: Neon.tech (ฟรี)
4. **File Storage**: Cloudinary (ฟรี 25GB)

**ต้นทุนรวม**: ~$5/month

### สำหรับ Production จริง:
1. **VPS**: DigitalOcean Droplet ($20/month)
2. **Database**: Managed PostgreSQL ($15/month)
3. **CDN**: Cloudflare (ฟรี)
4. **Storage**: Cloudinary ($89/month สำหรับ 128GB)

**ต้นทุนรวม**: ~$120-150/month

---

## 6. Monitoring & Logs

### ติดตั้ง PM2 Logs (VPS):
```bash
pm2 logs lottery-api
pm2 logs lottery-web
pm2 monit
```

### ใช้ Sentry (Error Tracking):
```bash
npm install @sentry/node @sentry/nextjs
```

---

## ต้องการความช่วยเหลือเพิ่มเติม?

ให้ผมรู้ว่าคุณเลือกใช้วิธีไหน แล้วผมจะช่วย setup รายละเอียดให้ครับ!
