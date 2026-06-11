import { Router } from "express";
import { authVerify } from "../middlewares/auth.middleware";
import {
  addToCart,
  checkoutCart,
  getCarts,
  getCurrentCart,
  getMyPurchases,
  getPurchaseById,
  removeCartItem,
  updateCartItem,
  updateOtherCartItem,
} from "../controllers/cart.controller";

const router = Router();

router.get("/all", authVerify(true), getCarts);
router.get("/current", authVerify(true), getCurrentCart);
router.post("/", authVerify(true), addToCart);
router.put("/item/:variantId", authVerify(true), updateCartItem);
router.patch("/:cartId/item/:variantId", authVerify(true), updateOtherCartItem);
router.delete("/item/:variantId", authVerify(true), removeCartItem);
router.post("/checkout/:cartId", authVerify(true), checkoutCart);
router.get("/purchases", authVerify(true), getMyPurchases);
router.get("/purchases/:id", authVerify(true), getPurchaseById);

export default router;