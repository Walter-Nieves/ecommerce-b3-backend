import { Router } from "express";
import { create, capture, cancel } from "../controllers/payment.controller"

const router = Router();

router.post("/create", create);
router.post("/capture", capture);
router.post("/cancel", cancel);

export default router;