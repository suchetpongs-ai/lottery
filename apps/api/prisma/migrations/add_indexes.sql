-- ============================================
-- PostgreSQL Migration from SQLite
-- ============================================
-- Run this after changing datasource to postgresql in schema.prisma

-- 1. Enable UUID extension (if using UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(number);
CREATE INDEX IF NOT EXISTS idx_tickets_round_id ON tickets(round_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_expire_at ON orders(expire_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_ticket_id ON order_items(ticket_id);

-- 3. Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tickets_round_status ON tickets(round_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- 4. Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 5. Check row counts
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'rounds', COUNT(*) FROM rounds
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;
