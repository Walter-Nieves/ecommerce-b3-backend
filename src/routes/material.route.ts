import { Router } from "express";
import { createMaterial, forceDeleteMaterial, getAllMaterial, getAllMaterialDeleteds, getMaterialById, restoreMaterial, softDeleteMaterial, updateMaterial } from "../controllers/material.controller";
import { authVerify } from "../middlewares/auth.middleware";

const router = Router()

router.get("/all", getAllMaterial);
router.get("/all-deleted", getAllMaterialDeleteds);
router.get("/:id", getMaterialById);

router.post("/", authVerify(true), createMaterial);

router.put("/:id", authVerify(true), updateMaterial);

router.delete("/force/:id", authVerify(true), forceDeleteMaterial);
router.delete("/soft/:id", authVerify(true), softDeleteMaterial);

router.patch("/restore/:id", authVerify(true), restoreMaterial);

export default router