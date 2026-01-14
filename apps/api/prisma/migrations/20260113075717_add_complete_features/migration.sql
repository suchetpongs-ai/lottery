/*
  Warnings:

  - You are about to drop the `rounds` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "rounds";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Round" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "drawDate" DATETIME NOT NULL,
    "openSellingAt" DATETIME NOT NULL,
    "closeSellingAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "winningNumbers" JSONB,
    "resultsAnnouncedAt" DATETIME
);

-- CreateTable
CREATE TABLE "claims" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "ticket_id" BIGINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "claimed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" DATETIME,
    "processed_by" INTEGER,
    "rejection_reason" TEXT,
    CONSTRAINT "claims_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "numbers" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "round_id" INTEGER,
    "total_amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" DATETIME,
    CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "Round" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("created_at", "expire_at", "id", "status", "total_amount", "user_id") SELECT "created_at", "expire_at", "id", "status", "total_amount", "user_id" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE TABLE "new_tickets" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "round_id" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "set_size" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prize_amount" DECIMAL NOT NULL DEFAULT 0,
    "prize_tier" TEXT,
    "prize_checked_at" DATETIME,
    CONSTRAINT "tickets_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "Round" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tickets" ("created_at", "id", "image_url", "number", "price", "round_id", "set_size", "status") SELECT "created_at", "id", "image_url", "number", "price", "round_id", "set_size", "status" FROM "tickets";
DROP TABLE "tickets";
ALTER TABLE "new_tickets" RENAME TO "tickets";
CREATE INDEX "tickets_number_idx" ON "tickets"("number");
CREATE INDEX "tickets_round_id_status_idx" ON "tickets"("round_id", "status");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "kyc_status" TEXT NOT NULL DEFAULT 'Unverified',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" DATETIME,
    "bannedReason" TEXT
);
INSERT INTO "new_users" ("created_at", "id", "kyc_status", "password_hash", "phone_number", "username") SELECT "created_at", "id", "kyc_status", "password_hash", "phone_number", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_user_id_key" ON "wishlists"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
