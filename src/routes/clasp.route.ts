
import { Router } from "express";
import {
  createClasp,
  forceDeleteClasp,
  getAllClasps,
  getClaspById,
  getDeletedClasps,
  restoreClasp,
  softDeleteClasp,
  updateClasp,
} from "../controllers/clasp.controller";
import { authVerify } from "../middlewares/auth.middleware";


const router = Router();

router.get("/all", getAllClasps);
router.get("/all-deleted", getDeletedClasps);
router.get("/:id", getClaspById);

router.post("/", authVerify(true), createClasp);
router.put("/:id", authVerify(true), updateClasp);

router.delete("/force/:id", authVerify(true), forceDeleteClasp);
router.delete("/soft/:id", authVerify(true), softDeleteClasp);

router.patch("/restore/:id", restoreClasp);

export default router;