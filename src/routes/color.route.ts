import { Router } from "express"
import { deleteColor, getColor, patchColor, postColor, putColor } from "../controllers/color.controller"

const router = Router()

router.get("/", getColor)
router.post("/", postColor)
router.put("/:id", putColor)
router.delete("/:id", deleteColor)
router.patch("/:id", patchColor)

export default router