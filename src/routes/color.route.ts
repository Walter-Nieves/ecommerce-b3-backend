import { Router } from "express";
import { forceDeleteColor, getAllColor, getAllDeletedColor, getColorById, postColor, putColor, restoreColor, softDeleteColor } from "../controllers/color.controller";
import { authVerify } from "../middlewares/auth.middleware";

const router = Router()

router.get("/all", getAllColor);
router.get("/all-deleted", authVerify(true), getAllDeletedColor);
router.get("/:id", getColorById);

router.post("/", authVerify(true), postColor)

router.put("/:id", authVerify(true), putColor)

router.delete("/force/:id", authVerify(true), forceDeleteColor);
router.delete("/soft/:id", authVerify(true), softDeleteColor);

router.patch("/restore/:id", authVerify(true), restoreColor);

export default router