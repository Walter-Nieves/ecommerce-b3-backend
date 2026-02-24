import { Router } from "express";
import { getAllTag } from "../controllers/tag.controller";

const router = Router();

router.get("/all", getAllTag);
router.get("/all-deleted", );
router.get("/:id", );

router.post("/", );

router.put("/:id", );

router.delete("/force/:id", );
router.delete("/soft/:id", );

router.patch("/restore/:id", );

export default router;
