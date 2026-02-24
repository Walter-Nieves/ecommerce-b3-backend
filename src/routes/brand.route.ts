import { Router } from "express";

const router = Router();

router.get("/", getBrand);
router.post("/", postBrand);
router.put("/:id", putBrand);
router.delete("/:id", deleteBrand);
router.patch("/:id", patchBrand);

export default router;
