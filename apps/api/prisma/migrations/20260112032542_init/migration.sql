-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "kyc_status" TEXT NOT NULL DEFAULT 'Unverified',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "draw_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "open_selling_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "round_id" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "set_size" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tickets_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "total_amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" DATETIME,
    CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "order_id" BIGINT NOT NULL,
    "ticket_id" BIGINT NOT NULL,
    "price_at_purchase" DECIMAL NOT NULL,
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_items_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "order_id" BIGINT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "method" TEXT NOT NULL,
    "gateway_ref_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "paid_at" DATETIME,
    CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "tickets_number_idx" ON "tickets"("number");

-- CreateIndex
CREATE INDEX "tickets_round_id_status_idx" ON "tickets"("round_id", "status");
