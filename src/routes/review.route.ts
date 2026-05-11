import { Router } from "express";
import { authVerify } from "../middlewares/auth.middleware";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReviewByProductAndUser,
  getReviewsByProduct,
  updateReview,
} from "../controllers/review.controller";

const router = Router();

router.get("/all", authVerify(true), getAllReviews);
router.get("/product/:productId", getReviewsByProduct);
router.get("/product/:productId/user/:userId", authVerify(true), getReviewByProductAndUser);

router.post("/", authVerify(true), createReview);

router.put("/product/:productId/user/:userId", authVerify(true), updateReview);

router.delete("/product/:productId/user/:userId", authVerify(true), deleteReview);

export default router;