# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

High-performance Node.js/Express API for large-scale product dataset (~20M+ rows). MySQL 8+ backend with Redis caching. Optimized for cursor-based pagination, fulltext search, and zero cartesian explosions on 1:N relationships.

## Commands

```bash
npm run dev          # Start dev server (watch mode, auto-reload)
npm start            # Production start
npm run db:setup     # Run schema.sql against MySQL (prompts for password)
```

No test runner configured yet. No linter configured.

## Architecture

```
Request → cors → json parser → rate limiter → logger → route → validation → controller → service → db/cache
```

**Layered structure under `src/`:**

- **routes/** — Express Router definitions, wires validation middleware to controller functions
- **controllers/** — Handle req/res, orchestrate cache reads/writes, delegate to services
- **services/** — Business logic and raw SQL queries via mysql2. Transactions for multi-table writes
- **services/cache.js** — Redis (ioredis) with graceful fallback. App runs without Redis
- **db/pool.js** — mysql2 promise-based connection pool (20 connections, keepalive)
- **middleware/** — Validation (hand-rolled, no library), rate limiting, centralized error handler
- **config/index.js** — Single source for all env-derived config

## Critical Query Rules

These exist to prevent performance collapse at 20M+ rows. **Do not violate them:**

1. **Never join images or stock directly with products** — causes cartesian explosion. Use subqueries:
   - Images: `(SELECT JSON_ARRAYAGG(url) FROM images WHERE product_id = p.id)`
   - Stock: `(SELECT COALESCE(SUM(quantity), 0) FROM stock WHERE product_id = p.id)`
2. **Only JOIN 1:1 relationships** (category, brand) with products
3. **Cursor pagination only** — `WHERE p.id > ? ORDER BY p.id LIMIT ?`. Never use OFFSET
4. **Fulltext search only** — `MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE)`. Never use `LIKE '%term%'`
5. **No `SELECT *`** — always name columns explicitly
6. **All reads filter soft deletes** — `WHERE p.deleted_at IS NULL`

Shared SQL fragments in `services/products.js`: `PRODUCT_COLUMNS`, `FROM_PRODUCTS`, `NOT_DELETED`.

## Response Format

All endpoints return consistent JSON:
```json
{"success": true, "data": ...}
{"success": false, "error": "message"}
```

Status codes: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Internal.

## Conventions

- **ESM only** — `import`/`export`, project uses `"type": "module"`
- **Named React imports only** — never `import React from "react"` (global rule)
- **Async/await** throughout, errors propagated via `next(err)` to centralized handler
- **snake_case** for database columns, **camelCase** for JS variables
- **No external validation library** — validators in `middleware/validate.js` use a `createError(status, message)` pattern
- **Cache keys** — pattern: `products:list:{lastId}:{limit}`, `products:detail:{id}`. Invalidated on writes via wildcard delete

## Environment

Config loaded via `--env-file=.env` (Node 20+ built-in). All vars centralized in `src/config/index.js` with defaults. See `.env.example` for full list: DB connection, Redis URL, port, rate limit settings.
