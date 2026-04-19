-- Move CSV files (data/*) to MySQL allowed directory (/var/lib/mysql-files/)

-- ============================================
-- 🚀 HIGH-PERFORMANCE BULK SEED SCRIPT
-- For 20M+ rows (InnoDB optimized)
-- ============================================

-- --------------------------------------------
-- 0. SAFETY (disable constraints for speed)
-- --------------------------------------------
SET foreign_key_checks = 0;
SET unique_checks = 0;

-- --------------------------------------------
-- 1. LOAD SMALL TABLES FIRST
-- --------------------------------------------

LOAD DATA INFILE '/var/lib/mysql-files/category.csv'
INTO TABLE category
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, name);

LOAD DATA INFILE '/var/lib/mysql-files/brand.csv'
INTO TABLE brand
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, name);

-- --------------------------------------------
-- 2. DROP HEAVY INDEXES (IMPORTANT)
-- --------------------------------------------

-- Products indexes
ALTER TABLE products DROP INDEX idx_products_category;
ALTER TABLE products DROP INDEX idx_products_brand;
ALTER TABLE products DROP INDEX idx_products_created;
ALTER TABLE products DROP INDEX idx_products_deleted;
ALTER TABLE products DROP INDEX idx_products_active_id;

-- Fulltext index
ALTER TABLE products DROP INDEX ft_products_name_desc;

-- Child table indexes
ALTER TABLE stock DROP INDEX idx_stock_product;
ALTER TABLE images DROP INDEX idx_images_product;

-- --------------------------------------------
-- 3. LOAD LARGE TABLES
-- --------------------------------------------

-- PRODUCTS (main heavy load)
LOAD DATA INFILE '/var/lib/mysql-files/products.csv'
INTO TABLE products
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
(id, name, description, category_id, brand_id, created, purchase_price, sales_price, @deleted_at)
SET deleted_at = NULLIF(@deleted_at, '');

-- IMAGES
LOAD DATA INFILE '/var/lib/mysql-files/images.csv'
INTO TABLE images
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
(id, url, product_id);

-- STOCK
LOAD DATA INFILE '/var/lib/mysql-files/stock.csv'
INTO TABLE stock
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
(id, batch_id, quantity, name, product_id);

-- --------------------------------------------
-- 4. REBUILD INDEXES (FAST BULK BUILD)
-- --------------------------------------------

-- Products indexes
CREATE INDEX idx_products_category  ON products(category_id);
CREATE INDEX idx_products_brand     ON products(brand_id);
CREATE INDEX idx_products_created   ON products(created);
CREATE INDEX idx_products_deleted   ON products(deleted_at);
CREATE INDEX idx_products_active_id ON products(deleted_at, id);

-- Fulltext index (heavy, keep last)
ALTER TABLE products ADD FULLTEXT ft_products_name_desc (name, description);

-- Child indexes
CREATE INDEX idx_stock_product   ON stock(product_id);
CREATE INDEX idx_images_product  ON images(product_id);

-- --------------------------------------------
-- 5. RESTORE SETTINGS
-- --------------------------------------------
SET foreign_key_checks = 1;
SET unique_checks = 1;

-- ============================================
-- ✅ DONE
-- ============================================

-- SHOW PROCESSLIST;
-- SHOW GLOBAL STATUS LIKE 'Innodb_rows_inserted';