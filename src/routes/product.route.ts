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
  searchProducts,

} from "../controllers/product.controller";

const router = Router();

/* GET */
router.get("/all", getAllProducts);
router.get("/deleted", getDeletedProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.get("/deleted/:id", getDeletedProductById);

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