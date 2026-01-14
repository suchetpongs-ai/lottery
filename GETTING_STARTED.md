# ระบบสลากกินแบ่งออนไลน์ - Getting Started

## 🚀 Quick Start

### 1. ติดตั้ง PostgreSQL และสร้าง Database

```bash
# ใน PostgreSQL, สร้าง database
createdb lottery_db

# หรือใช้ SQL
CREATE DATABASE lottery_db;
```

### 2. ตั้งค่า Environment Variables

แก้ไขไฟล์ `apps/api/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/lottery_db?schema=public"
JWT_SECRET=your-super-secret-key-change-in-production
PORT=3001
```

### 3. รัน Database Migration

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed ข้อมูลทดสอบ

```bash
cd apps/api
npx ts-node prisma/seed.ts
```

คุณจะได้:
- งวดสลาก 1 งวด
- สลาก 105 ใบ (รวมเลขยอดนิยม และเลขสุ่ม)
- ผู้ใช้ทดสอบ 2 คน:
  - `0812345678` / `password123`
  - `0887654321` / `password123`

### 5. รัน Backend (API)

```bash
cd apps/api
npm run start:dev
```

Backend จะรันที่: **http://localhost:3001**

### 6. ทดสอบ API

#### สมัครสมาชิก
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "phoneNumber": "0899999999",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0812345678",
    "password": "password123"
  }'
```

#### ค้นหาสลาก
```bash
curl http://localhost:3001/lottery/search?number=888888
```

#### Checkout (ต้องมี Token)
```bash
curl -X POST http://localhost:3001/order/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ticketIds": [1, 2]
  }'
```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - สมัครสมาชิก
- `POST /auth/login` - เข้าสู่ระบบ
- `GET /auth/profile` - ดูโปรไฟล์ (ต้อง login)

### Lottery
- `GET /lottery/search?number=XXX&searchType=exact` - ค้นหาสลาก
- `GET /lottery/ticket/:id` - ดูรายละเอียดสลาก
- `GET /lottery/round/current` - ดูงวดปัจจุบัน

### Order
- `POST /order/checkout` - สั่งซื้อสลาก (ต้อง login)
- `POST /order/:id/pay` - จำลองการชำระเงิน (ต้อง login)
- `GET /order/:id` - ดูรายละเอียด Order (ต้อง login)
- `GET /order` - ดู Orders ทั้งหมดของตัวเอง (ต้อง login)

## 🔥 สิ่งที่ทำได้แล้ว

- ✅ Prisma Schema ครบทั้งระบบ
- ✅ Authentication (JWT)
- ✅ ระบบค้นหาสลาก (exact, prefix, suffix)
- ✅ ระบบจองสลากพร้อม Pessimistic Locking (`FOR UPDATE`)
- ✅ ระบบหมดเวลาจอง (expire_at)
- ✅ Mock Payment Confirmation
- ✅ Database Seed Script

## 🧪 การทดสอบ Concurrency

เปิด 2 Terminal แล้วรันพร้อมกัน:

```bash
# Terminal 1
curl -X POST http://localhost:3001/order/checkout \
  -H "Authorization: Bearer TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"ticketIds": [1]}'

# Terminal 2 (รันพร้อมกัน)
curl -X POST http://localhost:3001/order/checkout \
  -H "Authorization: Bearer TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"ticketIds": [1]}'
```

ผลลัพธ์: คนหนึ่งจะได้สลาก อีกคนจะได้ Error "Ticket not available"

## 📝 หมายเหตุ

- Backend สมบูรณ์และพร้อมใช้งาน
- Frontend เป็น Next.js พร้อมโครงสร้างเบื้องต้น
- สามารถต่อยอดพัฒนา Frontend ได้ตามต้องการ
- สำหรับ Production ต้องเพิ่ม Payment Gateway จริง
