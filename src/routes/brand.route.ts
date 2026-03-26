import { Router } from "express";
import { createBrand, forceDeleteBrand, getAllBrands, getAllDeletedBrands, getBrandById, restoreBrand, softDeleteBrand, updateBrand } from "../controllers/brand.controller";
import { authVerify } from "../middlewares/auth.middleware";
import { getAllImages, uploadImage } from "../middlewares/file.middleware";
import { BucketRoutes } from "../types/enums";

const router = Router()

router.get("/all", getAllBrands);
router.get("/all-deleted", getAllDeletedBrands);
router.get("/images", getAllImages(BucketRoutes.BrandImages))
router.get("/:id", getBrandById);

router.post("/", authVerify(false), uploadImage(BucketRoutes.BrandImages), createBrand);

router.put("/:id", authVerify(true), uploadImage(BucketRoutes.BrandImages), updateBrand);

router.delete("/force/:id", authVerify(true), forceDeleteBrand);
router.delete("/soft/:id", authVerify(true), softDeleteBrand);

router.patch("/restore/:id", authVerify(true), restoreBrand);

export default router