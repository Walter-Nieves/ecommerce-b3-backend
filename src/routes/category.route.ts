
import { Router } from "express";
import {
  getAllCategories,
  getDeletedCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  forceDeleteCategory,
} from "../controllers/category.controller";

const router = Router();

router.get("/all", getAllCategories);
router.get("/all-deleted", getDeletedCategories);
router.get("/:id", getCategoryById);

router.post("/", createCategory);
router.put("/:id", updateCategory);

router.delete("/force/:id", forceDeleteCategory);
router.delete("/:id", deleteCategory);

router.patch("/restore/:id", restoreCategory);

export default router;