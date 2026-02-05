# Agent Skill & Development Guidelines (Lottery Core)

เอกสารนี้รวบรวมกฎ, มาตรฐาน, และแนวทางปฏิบัติสำหรับการพัฒนา (Redesign) ระบบ Lottery Platform เพื่อให้การทำงานเป็นไปในทิศทางเดียวกันและมีคุณภาพสูงสุด

---

## 1. Tech Stack Standards

### Backend (API)
- **Framework:** NestJS 11.x
- **Language:** TypeScript 5.7+ (Strict Mode)
- **Database:** PostgreSQL 16+
- **ORM:** Prisma 5.22+ (TypedSQL enabled if possible)
- **Validation:** class-validator + class-transformer
- **Queue:** BullMQ + Redis
- **Documentation:** Swagger / OpenAPI
- **Architecture:** Modular Monolith

### Frontend (User & Admin)
- **Framework:** Next.js 16.x (App Router)
- **Styling:** TailwindCSS v3.4+ (Mobile-first)
- **Components:** Components based architecture (Atomic Design inspired)
- **State Mgmt:** 
  - Global/Client: Zustand
  - Server/Async: React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **i18n:** next-intl

### Infrastructure
- **Package Manager:** npm (via Turborepo)
- **Deployment:** PM2 / Docker
- **Environment:** Strict environment variable typing

---

## 2. Naming Conventions

### General
- **Files/Folders:** `kebab-case` (e.g., `user-profile`, `auth.service.ts`)
- **Classes/Components:** `PascalCase` (e.g., `AuthService`, `TicketCard`)
- **Variables/Functions:** `camelCase` (e.g., `isLoggedIn`, `getUserProfile`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)

### Database (PostgreSQL)
- **Table Names:** `snake_case` (Plural) (Define in `@map` only)
  - Prisma Model: `User` -> Table: `users`
  - Prisma Model: `OrderItem` -> Table: `order_items`
- **Columns:** `snake_case` in DB, `camelCase` in Prisma code
  - `@map("phone_number") phoneNumber String`
- **Foreign Keys:** `table_name_id`
  - `@map("user_id") userId Int`

---

## 3. Architecture Patterns

### Backend Pattern (NestJS)
1.  **Modules:** จัดกลุ่มตาม Domain (e.g., `OrderModule`, `LotteryModule`) ไม่ใช่ Technical layer
2.  **Controller:** รับ Request, Validate DTO, เรียก Service, ส่ง Response (ห้ามมี Business Logic)
3.  **Service:** Business Logic ทั้งหมดอยู่ที่นี่
4.  **DTO (Data Transfer Object):** ต้องมีสำหรับทุก Input/Output และใช้ `class-validator`
5.  **Repository/Prisma:** ห้ามเรียก PrismaService ใน Controller โดยตรง ต้องผ่าน Service เท่านั้น

**Directory Structure:**
```
src/
  modules/
    auth/
      dto/           # input/output definitions
      guards/        # auth guards
      auth.controller.ts
      auth.service.ts
      auth.module.ts
  common/            # Shared utilities
    decorators/
    filters/
    interceptors/
```

### Frontend Pattern (Next.js)
1.  **Atomic Design (Simplified):**
    - `components/atoms/`: ชิ้นส่วนย่อยสุด (Button, Input, Icon)
    - `components/molecules/`: การผสม atoms (SearchBar, FormField)
    - `components/organisms/`: Components ใหญที่มี Logic (Header, TicketList)
    - `components/templates/`: Layout โครงสร้างหน้า
2.  **Server vs Client Components:**
    - ใช้ Server Components (`async function`) เป็นค่าเริ่มต้นเพื่อ fetch data
    - ใช้ Client Components (`"use client"`) เฉพาะเมื่อต้องการ interaction (useState, useEffect, onClick)
3.  **Custom Hooks:**
    - แยก Logic ออกจาก UI ด้วย Custom Hooks (`useTicketSearch`, `useCart`)

**Directory Structure:**
```
app/
  [locale]/
    (shop)/        # Route group for customer layout
    (admin)/       # Route group for admin layout
components/
  ui/              # Shadcn/Base components
  admin/           # Admin specific components
  lottery/         # Lottery domain components
lib/
  api/             # API clients & hooks
  stores/          # Zustand stores
  utils/           # Helper functions
```

---

## 4. Coding Best Practices

### TypeScript
- ❌ **Avoid:** `any` (ใช้ `unknown` หรือ define interface เสมอ)
- ✅ **Use:** `interface` สำหรับ Object shapes, `type` สำหรับ Unions/Intersections
- ✅ **Use:** Enums สำหรับค่าคงที่ที่มีขอบเขตชัดเจน (Role, Status)

### Error Handling
- **Backend:** Throw `HttpException` (e.g., `BadRequestException`, `NotFoundException`) อย่าส่ง JSON error เอง
- **Frontend:** ใช้ Error Boundaries และ Toast notifications สำหรับแจ้งเตือน user

### Performance
- **Database:**
  - ใช้ Index (`@@index`) ในฟิลด์ที่ใช้ search/filter บ่อย
  - ระวัง **N+1 Query** (ใช้ `include` เท่าที่จำเป็น)
- **Frontend:**
  - ใช้ `next/image` เสมอ
  - Implement **Debounce** สำหรับช่องค้นหา
  - ใช้ `React.memo` หรือ `useMemo` เมื่อเจอการคำนวณหนักๆ

---

## 5. Security Checklist
- ✅ Validate Input ทุกจุด (Backend > Frontend)
- ✅ Authentication ห้ามหลุด (ตรวจสอบ `Guard` ทุก Endpoint)
- ✅ Authorization ตรวจสอบ `Role` และ `Owner` (ห้ามดู data คนอื่น)
- ✅ Sanitization ป้องกัน XSS/SQL Injection (Prisma จัดการให้ส่วนใหญ่ แต่ระวัง Raw SQL)
- ✅ Rate Limiting ป้องกัน Cloud Spams

---

## 6. Implementation Workflow
1.  **Plan:** วิเคราะห์ requirement -> ออกแบบ Schema/API Spec
2.  **Schema:** อัพเดท `schema.prisma` -> `npx prisma migrate dev`
3.  **Backend:** สร้าง Module/Service/Controller -> Test with Postman/Curl
4.  **Frontend:** สร้าง UI Component -> Connect API
5.  **Verify:** ทดสอบ Happy Path & Edge Cases

---

*Verified by Antigravity Agent*
*Last Updated: 2026-02-05*
