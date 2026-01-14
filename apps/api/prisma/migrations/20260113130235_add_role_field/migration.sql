-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "kyc_status" TEXT NOT NULL DEFAULT 'Unverified',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" DATETIME,
    "bannedReason" TEXT
);
INSERT INTO "new_users" ("bannedAt", "bannedReason", "created_at", "id", "isBanned", "kyc_status", "password_hash", "phone_number", "username") SELECT "bannedAt", "bannedReason", "created_at", "id", "isBanned", "kyc_status", "password_hash", "phone_number", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
