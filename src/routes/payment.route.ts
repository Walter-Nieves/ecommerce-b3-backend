import { Router } from "express";
import { create, cancel, capture } from "../controllers/payment.controller"
import { authVerify } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authVerify(true), create);
router.get("/capture/:id", authVerify(true), capture);
router.get("/cancel/:id", authVerify(true), cancel);

export default router;