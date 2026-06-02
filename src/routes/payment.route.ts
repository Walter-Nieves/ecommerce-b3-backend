import { Router } from "express";
import { create, capture, cancel } from "../controllers/payment.controller"
import { authVerify } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authVerify(true), create);
router.get("/capture", authVerify(true), capture);
router.get("/cancel", authVerify(true), cancel);

export default router;