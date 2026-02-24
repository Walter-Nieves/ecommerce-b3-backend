import { Router } from "express";

const router = Router();

router.get("/", getCategory);
router.post("/", postCategory);
router.put("/:id", putCategory);
router.delete("/:id", deleteCategory);
router.patch("/:id", patchCategory);

export default router;
