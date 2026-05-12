import { Router } from "express";
import { authVerify } from "../middlewares/auth.middleware";

import {
    addInventory,
    createInventory,
    getInventoryByVariantId,
    removeInventory,
} from "../controllers/inventory.controller";

const router = Router();

router.get("/:variant_id", authVerify(true), getInventoryByVariantId);

router.post("/", authVerify(true), createInventory);

router.patch("/:variant_id/add", authVerify(true), addInventory);

router.patch("/:variant_id/remove", authVerify(true), removeInventory);

export default router;