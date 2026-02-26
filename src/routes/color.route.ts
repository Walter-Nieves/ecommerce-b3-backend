import { Router } from "express"
import { deleteColor, getColor, patchColor, postColor, putColor } from "../controllers/color.controller"

const router = Router()

<<<<<<< HEAD
router.get("/", getColor)
router.post("/", postColor)
router.put("/:id", putColor)
router.delete("/:id", deleteColor)
router.patch("/:id", patchColor)
=======
// router.get("/", getColor)
// router.post("/",postColor)
// router.put("/:id", putColor)
// router.delete("/:id",deleteColor)
// router.patch("/:id", patchColor)
>>>>>>> master

export default router