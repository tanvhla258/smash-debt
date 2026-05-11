-- Breakfast Menu Feature Migration
-- Create tables for breakfast items and orders

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create breakfast_items table
CREATE TABLE IF NOT EXISTS breakfast_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  note_options TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create breakfast_orders table
CREATE TABLE IF NOT EXISTS breakfast_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create breakfast_order_items table
CREATE TABLE IF NOT EXISTS breakfast_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES breakfast_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES breakfast_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  custom_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_breakfast_items_is_active ON breakfast_items(is_active);
CREATE INDEX IF NOT EXISTS idx_breakfast_orders_status ON breakfast_orders(status);
CREATE INDEX IF NOT EXISTS idx_breakfast_orders_created_at ON breakfast_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_breakfast_order_items_order_id ON breakfast_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_breakfast_order_items_item_id ON breakfast_order_items(item_id);

-- Enable Row Level Security
ALTER TABLE breakfast_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakfast_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakfast_order_items ENABLE ROW LEVEL SECURITY;

-- Development RLS policies (public access - tighten for production)
-- Breakfast Items
CREATE POLICY "Public read access to breakfast items"
  ON breakfast_items FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON breakfast_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users"
  ON breakfast_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow delete for authenticated users"
  ON breakfast_items FOR DELETE
  TO authenticated
  USING (true);

-- Breakfast Orders
CREATE POLICY "Allow insert for all users (public orders)"
  ON breakfast_orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow read for authenticated users"
  ON breakfast_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow update for authenticated users"
  ON breakfast_orders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow delete for authenticated users"
  ON breakfast_orders FOR DELETE
  TO authenticated
  USING (true);

-- Breakfast Order Items
CREATE POLICY "Public read access to order items"
  ON breakfast_order_items FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for all users"
  ON breakfast_order_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users"
  ON breakfast_order_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow delete for authenticated users"
  ON breakfast_order_items FOR DELETE
  TO authenticated
  USING (true);

-- Add helpful comments
COMMENT ON TABLE breakfast_items IS 'Menu items available for breakfast ordering';
COMMENT ON TABLE breakfast_orders IS 'Customer orders for breakfast items';
COMMENT ON TABLE breakfast_order_items IS 'Individual items within a breakfast order';
COMMENT ON COLUMN breakfast_items.note_options IS 'Prebuilt note options like ["no onion", "no spicy"]';
