import * as productService from "../services/products.js";
import { cacheGet, cacheSet, cacheDel } from "../services/cache.js";

// ─── GET /products ──────────────────────────────────────────────

export async function list(_req, res, next) {
  try {
    const { lastId, limit } = res.locals.validated;

    const cacheKey = `products:list:${lastId ?? "start"}:${limit}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      console.info(`[cache] HIT ${cacheKey}`);
      return res.json(cached);
    }

    const rows = await productService.getProducts(lastId, limit);

    const response = {
      success: true,
      data: rows,
      pagination: {
        limit,
        nextCursor: rows.length === limit ? rows[rows.length - 1].id : null,
      },
    };

    await cacheSet(cacheKey, response, 30);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// ─── GET /products/:id ─────────────────────────────────────────

export async function getById(_req, res, next) {
  try {
    const id = res.locals.validatedId;

    const cacheKey = `products:detail:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      console.info(`[cache] HIT ${cacheKey}`);
      return res.json(cached);
    }

    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const response = { success: true, data: product };
    await cacheSet(cacheKey, response, 60);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// ─── GET /search ────────────────────────────────────────────────

export async function search(_req, res, next) {
  try {
    const { term, limit, page } = res.locals.validated;
    const rows = await productService.searchProducts(term, limit, page);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      pagination: {
        page,
        limit,
        nextPage: rows.length === limit ? page + 1 : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /products ─────────────────────────────────────────────

export async function create(req, res, next) {
  try {
    const productId = await productService.createProduct(req.body);
    await cacheDel("products:list:*");

    res.status(201).json({
      success: true,
      data: { id: productId },
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /products/:id ─────────────────────────────────────────

export async function update(req, res, next) {
  try {
    const id = res.locals.validatedId;
    const updated = await productService.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Product not found or no changes" });
    }

    await cacheDel(`products:detail:${id}`);
    await cacheDel("products:list:*");

    res.json({ success: true, message: "Product updated" });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /products/:id ───────────────────────────────────────

export async function remove(_req, res, next) {
  try {
    const id = res.locals.validatedId;
    const deleted = await productService.softDeleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    await cacheDel(`products:detail:${id}`);
    await cacheDel("products:list:*");

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}
