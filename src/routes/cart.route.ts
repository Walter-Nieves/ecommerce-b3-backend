import { Router } from "express";
import { authVerify } from "../middlewares/auth.middleware";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cart.controller";

const router = Router();

/* ===============================
   CART ROUTES
================================ */

//  Obtener carrito
router.get("/", authVerify(true), getCart);

// Agregar producto
router.post("/", authVerify(true), addToCart);

// Actualizar cantidad
router.put("/:id", authVerify(true), updateCartItem);

//  Eliminar item
router.delete("/:id", authVerify(true), removeCartItem);

export default router;