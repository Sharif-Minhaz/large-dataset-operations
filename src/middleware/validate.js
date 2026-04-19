/**
 * Lightweight validation helpers.
 * Express 5: req.query is recomputed on each access, so validated
 * values are stored on res.locals.validated instead of mutating req.query.
 */

export function validatePagination(req, res, next) {
	const lastId = req.query.lastId;
	const limit = req.query.limit;

	let parsedLastId = null;
	if (lastId !== undefined) {
		const n = Number(lastId);
		if (!Number.isInteger(n) || n < 0) {
			return next(createError(400, "lastId must be a non-negative integer"));
		}
		parsedLastId = n;
	}

	let parsedLimit = 20;
	if (limit !== undefined) {
		const n = Number(limit);
		if (!Number.isInteger(n) || n < 1 || n > 100) {
			return next(createError(400, "limit must be an integer between 1 and 100"));
		}
		parsedLimit = n;
	}

	res.locals.validated = { lastId: parsedLastId, limit: parsedLimit };
	next();
}

export function validateProductBody(req, _res, next) {
	const { name, sales_price, purchase_price } = req.body;

	if (!name || typeof name !== "string" || name.trim().length === 0) {
		return next(createError(400, "name is required"));
	}

	if (sales_price !== undefined && (typeof sales_price !== "number" || sales_price < 0)) {
		return next(createError(400, "sales_price must be a non-negative number"));
	}

	if (
		purchase_price !== undefined &&
		(typeof purchase_price !== "number" || purchase_price < 0)
	) {
		return next(createError(400, "purchase_price must be a non-negative number"));
	}

	next();
}

export function validateSearch(req, res, next) {
	const term = req.query.term;

	if (!term || typeof term !== "string" || term.trim().length === 0) {
		return next(createError(400, "search term is required"));
	}

	let parsedLimit = 20;
	const limit = req.query.limit;
	if (limit !== undefined) {
		const n = Number(limit);
		if (!Number.isInteger(n) || n < 1 || n > 100) {
			return next(createError(400, "limit must be an integer between 1 and 100"));
		}
		parsedLimit = n;
	}

	let parsedPage = 1;
	const page = req.query.page;
	if (page !== undefined) {
		const n = Number(page);
		if (!Number.isInteger(n) || n < 1) {
			return next(createError(400, "page must be a positive integer"));
		}
		parsedPage = n;
	}

	res.locals.validated = { term: term.trim(), limit: parsedLimit, page: parsedPage };
	next();
}

export function validateId(req, res, next) {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id < 1) {
		return next(createError(400, "Invalid product ID"));
	}
	res.locals.validatedId = id;
	next();
}

function createError(status, message) {
	const err = new Error(message);
	err.status = status;
	err.expose = true;
	return err;
}
