import pool from "../db/pool.js";

// ─── Shared SQL fragments ───────────────────────────────────────

const PRODUCT_COLUMNS = `
  p.id,
  p.name,
  p.description,
  p.purchase_price,
  p.sales_price,
  p.created,
  c.name  AS category_name,
  c.id    AS category_id,
  b.name  AS brand_name,
  b.id    AS brand_id,
  (SELECT JSON_ARRAYAGG(i.url) FROM images i WHERE i.product_id = p.id) AS images,
  (SELECT COALESCE(SUM(s.quantity), 0) FROM stock s WHERE s.product_id = p.id) AS total_stock
`;

const FROM_PRODUCTS = `
  FROM products p
  LEFT JOIN category c ON c.id = p.category_id
  LEFT JOIN brand    b ON b.id = p.brand_id
`;

const NOT_DELETED = `p.deleted_at IS NULL`;

// ─── List (cursor-based pagination) ─────────────────────────────

export async function getProducts(lastId, limit) {
  const cursorClause = lastId !== null ? `AND p.id > ?` : "";
  const params = lastId !== null ? [lastId, limit] : [limit];

  const sql = `
    SELECT ${PRODUCT_COLUMNS}
    ${FROM_PRODUCTS}
    WHERE ${NOT_DELETED}
      ${cursorClause}
    ORDER BY p.id
    LIMIT ?
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

// ─── Single product ─────────────────────────────────────────────

export async function getProductById(id) {
  const sql = `
    SELECT ${PRODUCT_COLUMNS}
    ${FROM_PRODUCTS}
    WHERE ${NOT_DELETED}
      AND p.id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
}

// ─── Fulltext search ────────────────────────────────────────────

export async function searchProducts(term, limit, page = 1) {
  const offset = (page - 1) * limit;
  const sql = `
    SELECT
      p.id,
      p.name,
      p.sales_price,
      c.name AS category_name,
      b.name AS brand_name,
      MATCH(p.name, p.description) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance
    ${FROM_PRODUCTS}
    WHERE ${NOT_DELETED}
      AND MATCH(p.name, p.description) AGAINST (? IN NATURAL LANGUAGE MODE)
    ORDER BY relevance DESC, p.id ASC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(sql, [term, term, limit, offset]);
  return rows;
}

// ─── Create ─────────────────────────────────────────────────────

export async function createProduct({ name, description, category_id, brand_id, purchase_price, sales_price, images, stock }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO products (name, description, category_id, brand_id, purchase_price, sales_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, category_id || null, brand_id || null, purchase_price || 0, sales_price || 0]
    );

    const productId = result.insertId;

    if (images?.length) {
      const placeholders = images.map(() => "(?, ?)").join(", ");
      const values = images.flatMap((url) => [url, productId]);
      await conn.query(
        `INSERT INTO images (url, product_id) VALUES ${placeholders}`,
        values
      );
    }

    if (stock?.length) {
      const placeholders = stock.map(() => "(?, ?, ?, ?)").join(", ");
      const values = stock.flatMap((s) => [s.batch_id, s.quantity || 0, s.name || null, productId]);
      await conn.query(
        `INSERT INTO stock (batch_id, quantity, name, product_id) VALUES ${placeholders}`,
        values
      );
    }

    await conn.commit();
    return productId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ─── Update ─────────────────────────────────────────────────────

export async function updateProduct(id, fields) {
  const allowed = ["name", "description", "category_id", "brand_id", "purchase_price", "sales_price"];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (sets.length === 0) return false;

  values.push(id);

  const [result] = await pool.query(
    `UPDATE products SET ${sets.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
    values
  );

  return result.affectedRows > 0;
}

// ─── Soft delete ────────────────────────────────────────────────

export async function softDeleteProduct(id) {
  const [result] = await pool.query(
    `UPDATE products SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );

  return result.affectedRows > 0;
}
