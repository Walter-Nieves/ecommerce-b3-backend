import { Router } from "express";

const router = Router();

router.get("/", getClasp);
router.post("/", postClasp);
router.put("/:id", putClasp);
router.delete("/:id", deleteClasp);
router.patch("/:id", patchClasp);

export default router;
