import { Router } from "express";
import { authVerify } from "../middlewares/auth.middleware";
import {
  addToCart,
  checkoutCart,
  getCart,
  getCurrentCart,
  getMyPurchases,
  getPurchaseById,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller";

const router = Router();

router.get("/", authVerify(true), getCart);
router.get("/current", authVerify(true), getCurrentCart);
router.post("/", authVerify(true), addToCart);
router.put("/item/:variantId", authVerify(true), updateCartItem);
router.delete("/item/:variantId", authVerify(true), removeCartItem);
router.post("/current/checkout", authVerify(true), checkoutCart);
router.get("/purchases", authVerify(true), getMyPurchases);
router.get("/purchases/:id", authVerify(true), getPurchaseById);

export default router;