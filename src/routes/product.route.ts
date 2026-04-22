import { Router } from "express";

import {
  getAllProducts,
  getDeletedProducts,
  getProductById,
  getDeletedProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  forceDeleteProduct,
  restoreProduct,

} from "../controllers/product.controller";

const router = Router();

/* GET */
router.get("/all", getAllProducts);
router.get("/all/deleted", getDeletedProducts);
router.get("/id/:id", getProductById);
router.get("/id/deleted/:id", getDeletedProductById);
// router.get("/slug/:slug", getProductBySlug);
// router.get("/slug/deleted/:id", getDeletedProductBySlug);

/* POST */
router.post("/", createProduct);

/* PUT */
router.put("/:id", updateProduct);

/* DELETE */
router.delete("/:id", softDeleteProduct);
router.delete("/force/:id", forceDeleteProduct);

/* PATCH */
router.patch("/restore/:id", restoreProduct);

export default router;