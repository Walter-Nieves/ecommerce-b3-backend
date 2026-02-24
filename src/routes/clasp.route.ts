
import { Router } from "express";
import {
  getAllClasps,
  getDeletedClasps,
  getClaspById,
  createClasp,
  updateClasp,
  deleteClasp,
  restoreClasp,
  forceDeleteClasp,
} from "../controllers/clasp.controller";

const router = Router();

router.get("/all", getAllClasps);
router.get("/all-deleted", getDeletedClasps);
router.get("/:id", getClaspById);

router.post("/", createClasp);
router.put("/:id", updateClasp);

router.delete("/force/:id", forceDeleteClasp);
router.delete("/:id", deleteClasp);

router.patch("/restore/:id", restoreClasp);

export default router;