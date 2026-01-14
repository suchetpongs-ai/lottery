# Deployment Guide for Lottery Platform

This guide covers two recommended ways to deploy your application:
1.  **Docker Compose (Recommended)**: Best for Cost & Control (VPS).
2.  **Cloud PaaS**: Easiest to setup (Vercel + Railway).

## Preparation (Important!)

Since you are currently using **SQLite** (`apps/api/prisma/schema.prisma`), you have a file-based database (`dev.db`).
-   **For Docker/VPS**: You can keep using SQLite, but you MUST use a volume to persist data.
-   **For Cloud PaaS (Vercel/Railway)**: You **MUST** switch to **PostgreSQL**. SQLite files will disappear every time you deploy.

---

## Option 1: Docker Compose (VPS - DigitalOcean, AWS, Linode)

This is the most "complete" way to host everything yourself.

### 1. Create Dockerfiles
I have created the following files for you:
-   `apps/web/Dockerfile`
-   `apps/api/Dockerfile`
-   `docker-compose.yml` (at project root)

### 2. Set up your VPS
1.  Rent a VPS (Ubuntu 22.04 LTS recommended). 2GB RAM minimum.
2.  Install Docker & Docker Compose on the VPS.
3.  Clone your repository to the VPS.

### 3. Environment Variables
Create a `.env` file on your VPS in the root directory:
```bash
# App
PORT=3001
JWT_SECRET=your_super_secret_jwt_key

# Database (If using SQLite)
DATABASE_URL="file:./dev.db"
```

### 4. Run!
```bash
docker-compose up -d --build
```
Your app will be running on:
-   Web: `http://<your-vps-ip>:3000`
-   API: `http://<your-vps-ip>:3001`

*(Optional) Set up Nginx content to handle domain names and SSL.*

---

## Option 2: Cloud PaaS (Vercel + Railway)

Best if you don't want to manage a server.

### 1. Database (PostgreSQL)
1.  Create a project on **Railway.app** or **Supabase**.
2.  Get the `DATABASE_URL` (postgres://...).
3.  Update your `schema.prisma`:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
4.  Run `npx prisma migrate dev` locally to generate migration files.

### 2. Backend (API) - Deploy to Railway
1.  Connect your GitHub repo to Railway.
2.  Set Root Directory to `apps/api`.
3.  Set Build Command: `cd ../.. && npx turbo run build --filter=api` (or similar).
4.  Set Start Command: `node dist/main`.
5.  Add variables: `DATABASE_URL`, `JWT_SECRET`.

### 3. Frontend (Web) - Deploy to Vercel
1.  Import your GitHub repo to Vercel.
2.  Select `Next.js` framework.
3.  Set Root Directory to `apps/web`.
4.  Environment Variables:
    -   `NEXT_PUBLIC_API_URL`: URL of your backend from step 2.
