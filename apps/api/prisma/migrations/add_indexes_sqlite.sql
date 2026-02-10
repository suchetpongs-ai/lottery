-- SQLite Compatible Index Script

-- 1. Create indexes for performance (IF NOT EXISTS is supported in newer SQLite, but standard in many tools)
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(number);
CREATE INDEX IF NOT EXISTS idx_tickets_round_id ON tickets(round_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_expire_at ON orders(expire_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_ticket_id ON order_items(ticket_id);

-- 2. Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tickets_round_status ON tickets(round_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- 3. Verify tables (Optional check)
SELECT name FROM sqlite_master WHERE type='table';
