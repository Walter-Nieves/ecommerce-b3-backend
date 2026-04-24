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
  getProductBySlug,
  getDeletedProductBySlug,
  uploadProductImage,
  updateImageProduct,

} from "../controllers/product.controller";
import { authVerify } from "../middlewares/auth.middleware";
import { getAllImages, uploadImage } from "../middlewares/file.middleware";
import { BucketRoutes } from "../types/enums";

const router = Router();

/* GET */
router.get("/all", getAllProducts);
router.get("/all/deleted", authVerify(true), getDeletedProducts);
router.get("/all/images", getAllImages(BucketRoutes.ProductImages));
router.get("/id/:id", getProductById);
router.get("/id/deleted/:id", authVerify(true), getDeletedProductById);
router.get("/slug/:slug", getProductBySlug);
router.get("/slug/deleted/:slug", authVerify(true), getDeletedProductBySlug);

/* POST */
router.post("/", authVerify(true), createProduct);

/* Upload images */
router.post("/upload", authVerify(true), uploadImage(BucketRoutes.ProductImages), uploadProductImage);

/* PUT */
router.put("/:id", authVerify(true), updateProduct);

/* DELETE */
router.delete("/soft/:id", authVerify(true), softDeleteProduct);
router.delete("/force/:id", authVerify(true), forceDeleteProduct);

/* PATCH */
router.patch("/restore/:id", authVerify(true), restoreProduct);
router.patch("/images/:id", authVerify(true), updateImageProduct);

export default router;