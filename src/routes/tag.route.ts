import { Router } from "express";
import { createTag, forceDeleteTag, getAllTag, getAllTagDeleteds, getTagById, restoreTag, softDeleteTag, updateTag } from "../controllers/tag.controller";

const router = Router();

router.get("/all", getAllTag);
router.get("/all-deleted", getAllTagDeleteds );
router.get("/:id", getTagById );

router.post("/", createTag );

router.put("/:id",updateTag );

router.delete("/force/:id", forceDeleteTag );
router.delete("/:id", softDeleteTag );

router.patch("/restore/:id", restoreTag);

export default router;
