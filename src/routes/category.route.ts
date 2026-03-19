import { Router } from "express";
import {
  createCategory,
  forceDeleteCategory,
  getAllCategories,
  getCategoryById,
  getDeletedCategories,
  restoreCategory,
  softDeleteCategory,
  updateCategory,
} from "../controllers/category.controller";
import { authVerify } from "../middlewares/auth.middleware";

const router = Router();

router.get("/all", getAllCategories);
router.get("/all-deleted", getDeletedCategories);
router.get("/:id", getCategoryById);

router.post("/", authVerify(true), createCategory);
router.put("/:id", authVerify(true), updateCategory);

router.delete("/force/:id", authVerify(true), forceDeleteCategory);
router.delete("/soft/:id", authVerify(true), softDeleteCategory);

router.patch("/restore/:id", authVerify(true), restoreCategory);

export default router;
