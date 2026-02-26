import { Router } from "express";
import { forceDeleteColor, getAllColor, getAllDeletedColor, getColorByHexId, patchColor, postColor, putColor, restoreColor, softDeleteColor } from "../controllers/color.controller";

const router = Router()

router.patch("/:id", patchColor)

router.get("/all", getAllColor);
router.get("/all-deleted", getAllDeletedColor);
router.get("/:id", getColorByHexId);

router.post("/", postColor)

router.put("/:id", putColor)


router.delete("/force/:id", forceDeleteColor);
router.delete("/soft/:id", softDeleteColor);

router.patch("/restore/:id", restoreColor);

export default router