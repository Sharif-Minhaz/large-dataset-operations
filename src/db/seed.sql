-- ============================================
-- Seed data — 5 products with related records
-- Run: mysql -u root -p products_db < src/db/seed.sql
-- ============================================

USE products_db;

-- ----------------------------
-- Categories
-- ----------------------------
INSERT INTO category (id, name, image_url) VALUES
  (1, 'Electronics',    'https://img.example.com/cat/electronics.jpg'),
  (2, 'Clothing',       'https://img.example.com/cat/clothing.jpg'),
  (3, 'Home & Kitchen', 'https://img.example.com/cat/home.jpg');

-- ----------------------------
-- Brands
-- ----------------------------
INSERT INTO brand (id, name, image_url) VALUES
  (1, 'Sony',    'https://img.example.com/brand/sony.jpg'),
  (2, 'Nike',    'https://img.example.com/brand/nike.jpg'),
  (3, 'Samsung', 'https://img.example.com/brand/samsung.jpg'),
  (4, 'IKEA',    'https://img.example.com/brand/ikea.jpg');

-- ----------------------------
-- Products
-- ----------------------------
INSERT INTO products (id, name, description, category_id, brand_id, purchase_price, sales_price, created) VALUES
  (1, 'Sony WH-1000XM5',       'Wireless noise-cancelling headphones with 30hr battery life',       1, 1, 250.00, 349.99, '2025-11-10 08:30:00'),
  (2, 'Nike Air Max 270',       'Lightweight running shoes with Max Air unit for all-day comfort',   2, 2, 85.00,  149.99, '2025-12-01 10:00:00'),
  (3, 'Samsung Galaxy S24',     '6.2 inch AMOLED display, 128GB storage, 50MP camera',              1, 3, 520.00, 799.99, '2026-01-15 09:00:00'),
  (4, 'IKEA KALLAX Shelf',      'Modular 4x4 shelf unit, white finish, fits standard storage boxes', 3, 4, 45.00,  79.99,  '2026-02-20 14:00:00'),
  (5, 'Sony WF-1000XM5',       'True wireless earbuds with adaptive noise cancelling',               1, 1, 180.00, 279.99, '2026-03-05 11:30:00');

-- ----------------------------
-- Images (multiple per product)
-- ----------------------------
INSERT INTO images (url, product_id) VALUES
  ('https://img.example.com/products/xm5-front.jpg',    1),
  ('https://img.example.com/products/xm5-side.jpg',     1),
  ('https://img.example.com/products/xm5-case.jpg',     1),
  ('https://img.example.com/products/airmax-white.jpg',  2),
  ('https://img.example.com/products/airmax-black.jpg',  2),
  ('https://img.example.com/products/s24-front.jpg',     3),
  ('https://img.example.com/products/s24-back.jpg',      3),
  ('https://img.example.com/products/s24-box.jpg',       3),
  ('https://img.example.com/products/kallax-front.jpg',  4),
  ('https://img.example.com/products/wf-xm5-buds.jpg',  5),
  ('https://img.example.com/products/wf-xm5-case.jpg',  5);

-- ----------------------------
-- Stock (multiple batches per product)
-- ----------------------------
INSERT INTO stock (batch_id, quantity, name, product_id) VALUES
  ('BATCH-2025-001', 120, 'Initial stock',        1),
  ('BATCH-2025-002',  45, 'Restock Jan',           1),
  ('BATCH-2025-003', 200, 'Launch batch',          2),
  ('BATCH-2025-004',  80, 'Feb restock',           2),
  ('BATCH-2026-001', 300, 'Launch shipment',       3),
  ('BATCH-2026-002',  50, 'Warehouse transfer',    4),
  ('BATCH-2026-003',  25, 'Showroom allocation',   4),
  ('BATCH-2026-004', 150, 'Pre-order batch',       5),
  ('BATCH-2026-005',  60, 'Retail restock',        5);
