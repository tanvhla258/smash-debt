-- Create breakfast_item_variants table for multiple price variants per item
CREATE TABLE breakfast_item_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES breakfast_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,          -- e.g., "Regular", "Large", "Family"
  price DECIMAL(10, 2) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for queries
CREATE INDEX idx_breakfast_item_variants_item_id ON breakfast_item_variants(item_id);

-- Add variant_id column to breakfast_order_items
ALTER TABLE breakfast_order_items
ADD COLUMN variant_id UUID REFERENCES breakfast_item_variants(id) ON DELETE SET NULL;

-- Create index for order items variant lookup
CREATE INDEX idx_breakfast_order_items_variant_id ON breakfast_order_items(variant_id);
