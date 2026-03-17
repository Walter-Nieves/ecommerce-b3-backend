import { Router} from "express"
import { getAllImages, uploadImage } from "../middlewares/file.middleware";
import { BucketRoutes } from "../types/enums";
import { createBrand, forceDeleteBrand, getAllBrands, getAllDeletedBrands, getBrandById, restoreBrand, softDeleteBrand, updateBrand } from "../controllers/brand.controller";
import { authVerify } from "../middlewares/auth.middleware";

const router = Router()

router.get("/all", getAllBrands );
router.get("/all-deleted", getAllDeletedBrands );
router.get("/images", getAllImages(BucketRoutes.BrandImages))
router.get("/:id", getBrandById);

router.post("/", authVerify(true), uploadImage(BucketRoutes.BrandImages), createBrand);

router.put("/:id", uploadImage(BucketRoutes.BrandImages),updateBrand);

router.delete("/force/:id", forceDeleteBrand);
router.delete("/soft/:id", softDeleteBrand);

router.patch("/restore/:id", restoreBrand);

export default router