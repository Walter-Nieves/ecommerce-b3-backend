import { Router} from "express"
import { getAllMaterial, getAllMaterialDeleteds, getMaterialById, createMaterial, updateMaterial, forceDeleteMaterial, softDeleteMaterial, restoreMaterial} from "../controllers/material.controller"

const router = Router()

router.get("/all", getAllMaterial );
router.get("/all-deleted", getAllMaterialDeleteds );
router.get("/:id", getMaterialById);

router.post("/", createMaterial);

router.put("/:id", updateMaterial);

router.delete("/force/:id", forceDeleteMaterial);
router.delete("/soft/:id", softDeleteMaterial  );

router.patch("/restore/:id", restoreMaterial );

export default router