-- Seed breakfast items with variants
-- All items use the variants system for future extensibility
-- Single-price items get a "thường" variant

-- Insert breakfast items (price = 0, actual pricing is on variants)
INSERT INTO breakfast_items (name, price, image_url, note_options, is_active)
VALUES
  ('Súp cua', 0, NULL, '{}', true),
  ('Gỏi cuốn Tây Sơn', 0, NULL, '{}', true),
  ('Xôi chú Ba', 0, NULL, '{}', true),
  ('Xôi dượng Sáu', 0, NULL, '{}', true),
  ('Tacos', 0, NULL, '{}', true),
  ('Bún thịt nướng', 0, NULL, '{}', true),
  ('Cháo lòng', 0, NULL, '{}', true),
  ('Phở trộn dượng Sáu', 0, NULL, '{}', true),
  ('Bánh cuốn nóng', 0, NULL, '{}', true);

-- Insert variants referencing items by name
-- Súp cua: nhỏ 15k, lớn 20k
INSERT INTO breakfast_item_variants (item_id, name, price, is_default)
SELECT id, 'nhỏ', 15000, true FROM breakfast_items WHERE name = 'Súp cua'
UNION ALL
SELECT id, 'lớn', 20000, false FROM breakfast_items WHERE name = 'Súp cua';

-- Gỏi cuốn Tây Sơn: thường 15k
INSERT INTO breakfast_item_variants (item_id, name, price, is_default)
SELECT id, 'thường', 15000, true FROM breakfast_items WHERE name = 'Gỏi cuốn Tây Sơn';

-- Xôi chú Ba: thường 15k
INSERT INTO breakfast_item_variants (item_id, name, price, is_default)
SELECT id, 'thường', 15000, true FROM breakfast_items WHERE name = 'Xôi chú Ba';

-- Xôi dượng Sáu: thường 20k
INSERT INTO breakfast_item_variants (item_id, name, price, is_default)
SELECT id, 'thường', 20000, true FROM breakfast_items WHERE name = 'Xôi dượng Sáu';

-- Tacos: thường 30k
INSERT INTO breakfast_item_variants (item_id, name, price, is_default)
SELECT id, 'thường', 30000, true FROM breakfast_items WHERE name = 'Tacos';

-- Bún thịt nướng: thường 25k
INSERT INTO breakfast_item_variants (item_id, name, price, is_default)
SELECT id, 'thường', 25000, true FROM breakfast_items WHERE name = 'Bún thịt nướng';

-- Cháo lòng: thường 20k
INSERT INTO breakfast_item_variants (item_id, name, price, is_default)
SELECT id, 'thường', 20000, true FROM breakfast_items WHERE name = 'Cháo lòng';

-- Phở trộn dượng Sáu: thường 25k
INSERT INTO breakfast_item_variants (item_id, name, price, is_default)
SELECT id, 'thường', 25000, true FROM breakfast_items WHERE name = 'Phở trộn dượng Sáu';

-- Bánh cuốn nóng: thường 20k, trứng 25k
INSERT INTO breakfast_item_variants (item_id, name, price, is_default)
SELECT id, 'thường', 20000, true FROM breakfast_items WHERE name = 'Bánh cuốn nóng'
UNION ALL
SELECT id, 'trứng', 25000, false FROM breakfast_items WHERE name = 'Bánh cuốn nóng';
