-- ============================================
-- Schema for large-dataset-operations
-- Optimized for 20M+ rows
-- ============================================

CREATE DATABASE IF NOT EXISTS products_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE products_db;

-- ----------------------------
-- category
-- ----------------------------
CREATE TABLE IF NOT EXISTS category (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255)    NOT NULL,
  image_url  VARCHAR(512)    DEFAULT NULL
) ENGINE=InnoDB;

-- ----------------------------
-- brand
-- ----------------------------
CREATE TABLE IF NOT EXISTS brand (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255)    NOT NULL,
  image_url  VARCHAR(512)    DEFAULT NULL
) ENGINE=InnoDB;

-- ----------------------------
-- products
-- ----------------------------
CREATE TABLE IF NOT EXISTS products (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255)    NOT NULL,
  description     TEXT            DEFAULT NULL,
  category_id     BIGINT UNSIGNED DEFAULT NULL,
  brand_id        BIGINT UNSIGNED DEFAULT NULL,
  created         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  purchase_price  DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  sales_price     DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  deleted_at      DATETIME        DEFAULT NULL,

  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES category(id),
  CONSTRAINT fk_products_brand    FOREIGN KEY (brand_id)    REFERENCES brand(id)
) ENGINE=InnoDB;

-- ----------------------------
-- stock
-- ----------------------------
CREATE TABLE IF NOT EXISTS stock (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  batch_id    VARCHAR(100)    NOT NULL,
  quantity    INT             NOT NULL DEFAULT 0,
  name        VARCHAR(255)    DEFAULT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,

  CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- ----------------------------
-- images
-- ----------------------------
CREATE TABLE IF NOT EXISTS images (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  url         VARCHAR(512)    NOT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,

  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_products_category  ON products(category_id);
CREATE INDEX idx_products_brand     ON products(brand_id);
CREATE INDEX idx_products_created   ON products(created);
CREATE INDEX idx_products_deleted   ON products(deleted_at);

CREATE INDEX idx_stock_product      ON stock(product_id);
CREATE INDEX idx_images_product     ON images(product_id);

-- Fulltext index for search
ALTER TABLE products ADD FULLTEXT ft_products_name_desc (name, description);

-- Composite index for cursor pagination on non-deleted rows
CREATE INDEX idx_products_active_id ON products(deleted_at, id);
