import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { Role } from "../types/enums";
import {
    resError,
    responseToError,
    validateId,
    validateNumber,
    validateRoleForActions,
} from "../utils/validations";

// ===============================
//    GET CART (usuario)
// ================================ 
export async function getCart(req: Request, res: Response) {
  try {
    // 🔥 Forzamos tipo seguro (evita error never)
    const user_id = validateId(res.locals.user.sub);


    // 🔍 Buscar carrito del usuario
    const cart = await sql<{ id: string }[]>`
      SELECT c.id
      FROM shopping_cart c 
      WHERE c.user_id = ${user_id}
    `;

    // desestructuring
    const [cartRow]=cart;

    if (!cartRow) {
      return res.json({ items: [] });
    }

    const cart_id = cartRow.id;  // el objeto es posiblemente undefined

    // 🔍 Obtener items del carrito
    const items = await sql`
      SELECT 
        ci.id,
        ci.amount,
        pv.id AS variant_id,
        p.name,
        p.slug,
        pv.price,
        pv.image_1
      FROM payment_item_carrito ci
      JOIN product_variant pv ON ci.product_variant_id = pv.id
      JOIN product p ON pv.product_id = p.id
      WHERE ci.shopping_cart_id_FK = ${cart_id}
    `;

    res.json({ cart_id, items });

  } catch (error) {
    return responseToError(error as Error, res);
  }
}


//  ===============================
//    ADD ITEM
// ================================ 
export async function addToCart(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [
      Role.Admin,
      Role.Buyer,
      Role.Seller,
    ]);

    const user_id = res.locals.user.sub as string;

    const product_variant_id = validateId(req.body.product_variant_id);
    const amount = validateNumber(req.body.amount, "Amount", "int", 1, 100);

    // validar que la variante existe
    const variant = await sql<{ id: string }[]>`
      SELECT id FROM product_variant WHERE id = ${product_variant_id}
    `;

    if (variant.length === 0) {
      return resError(404, "Product variant not found");
    }

    // 🔍 buscar carrito
    const [cartRowInitial] = await sql<{ id: string }[]>`
      SELECT id FROM shopping_cart WHERE user_id = ${user_id}
    `;

    let cartRow = cartRowInitial;

    // 🆕 crear carrito si no existe
    if (!cartRow) {
      const [newCart] = await sql<{ id: string }[]>`
        INSERT INTO shopping_cart (user_id)
        VALUES (${user_id})
        RETURNING id
      `;

      if (!newCart) return resError(500, "Error creating cart");

      cartRow = newCart;
    }

    const cart_id = cartRow.id;

    // 🔥 UPSERT (evita duplicados y race conditions)
    await sql`
      INSERT INTO payment_item_carrito (
        shopping_cart_id_FK,
        product_variant_id,
        amount
      )
      VALUES (${cart_id}, ${product_variant_id}, ${amount})
      ON CONFLICT (shopping_cart_id_FK, product_variant_id)
      DO UPDATE SET amount = payment_item_carrito.amount + ${amount}
    `;

    res.json({ message: "Producto agregado al carrito" });

  } catch (error) {
    return responseToError(error as Error, res);
  }
}

//  ===============================
//    UPDATE ITEM
// ================================ 

export async function updateCartItem(req: Request, res: Response) {
  try {
    const user_id = res.locals.user.sub as string;

    const item_id = validateId(req.params.id);
    const amount = validateNumber(req.body.amount, "Amount", "int", 1, 100);

    // 🔍 Verificar que el item pertenece al usuario
    const item = await sql<{ id: string }[]>`
      SELECT ci.id
      FROM payment_item_carrito ci
      JOIN shopping_cart c ON ci.shopping_cart_id_FK = c.id
      WHERE ci.id = ${item_id} AND c.user_id = ${user_id}
    `;

    if (item.length === 0) {
      resError(404, "Item not found in your cart");
    }

    // 🔁 Actualizar cantidad
    await sql`
      UPDATE payment_item_carrito
      SET amount = ${amount}
      WHERE id = ${item_id}
    `;

    res.json({ message: "Cantidad actualizada" });

  } catch (error) {
    return responseToError(error as Error, res);
  }
}


//  ===============================
//    DELETE ITEM
// ================================ 
export async function removeCartItem(req: Request, res: Response) {
  try {
    const user_id = res.locals.user.sub as string;
    const item_id = validateId(req.params.id);

    // 🔍 Validar que el item pertenece al usuario
    const item = await sql<{ id: string }[]>`
      SELECT ci.id
      FROM payment_item_carrito ci
      JOIN shopping_cart c ON ci.shopping_cart_id_FK = c.id
      WHERE ci.id = ${item_id} AND c.user_id = ${user_id}
    `;

    if (item.length === 0) {
      resError(404, "Item not found in your cart");
    }

    // 🗑️ Eliminar item
    await sql`
      DELETE FROM payment_item_carrito
      WHERE id = ${item_id}
    `;

    res.json({ message: "Producto eliminado del carrito" });

  } catch (error) {
    return responseToError(error as Error, res);
  }
}