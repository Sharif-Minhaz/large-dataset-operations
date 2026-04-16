import { Router } from "express";
import * as ctrl from "../controllers/products.js";
import {
	validatePagination,
	validateProductBody,
	validateSearch,
	validateId,
} from "../middleware/validate.js";

const router = Router();

router.get("/products", validatePagination, ctrl.list);
router.get("/products/:id", validateId, ctrl.getById);
router.get("/search", validateSearch, ctrl.search);
router.post("/products", validateProductBody, ctrl.create);
router.put("/products/:id", validateId, ctrl.update);
router.delete("/products/:id", validateId, ctrl.remove);

export default router;
