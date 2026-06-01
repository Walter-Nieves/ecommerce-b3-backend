import { Router } from "express";
import { authVerify } from "../middlewares/auth.middleware";

import {
    changeInventory,
    // createInventory,
    getInventoryByVariantId,
} from "../controllers/inventory.controller";

const router = Router();

router.get("/:variant_id", authVerify(true), getInventoryByVariantId);

// router.post("/", authVerify(true), createInventory);

router.patch("/:variant_id/change", authVerify(true), changeInventory);

export default router;