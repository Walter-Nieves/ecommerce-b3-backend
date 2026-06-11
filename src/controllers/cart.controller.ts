
import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { cart_status, Role } from "../types/enums";
import {
  resError,
  responseToError,
  validateId,
  validateNumber,
  validateRoleForActions,
} from "../utils/validations";

export type CartStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface CartItemRow {
  shopping_cart_id: string;
  product_variant_id: string;
  amount: number | string | null;
  variant_sku: string;
  variant_price: number | string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_description: string;
  product_image_1: string | null;
  product_image_2: string | null;
  product_image_3: string | null;
  product_image_4: string | null;
  product_image_5: string | null;
  review_rating: number | string | null;
  review_comment: string | null;
}

interface CartSummaryRow {
  id: string;
  status: CartStatus;
  total_amount: number | string | null;
  item_count: number | string | null;
  preview_name: string | null;
  preview_image: string | null;
}

interface PendingCartRow {
  id: string;
  status: CartStatus;
}

function asNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function buildPreviewImage(row: CartItemRow) {
  return (
    row.product_image_1 ??
    row.product_image_2 ??
    row.product_image_3 ??
    row.product_image_4 ??
    row.product_image_5 ??
    null
  );
}

export async function getOrCreatePendingCart(userId: string) {
  const [existing] = await sql<PendingCartRow[]>`
    SELECT id, status
    FROM shopping_cart
    WHERE user_id = ${userId}
    AND status = 'pending'
    LIMIT 1
  `;

  if (existing) {
    return existing;
  }

  const [created] = await sql<PendingCartRow[]>`
    INSERT INTO shopping_cart (user_id, status)
    VALUES (${userId}, 'pending')
    RETURNING id, status
  `;

  if (!created) {
    resError(500, "Error creating pending cart");
  }

  return created;
}

export async function getCartItems(cartId: string) {
  const items = await sql<CartItemRow[]>`
    SELECT
      sci.shopping_cart_id,
      sci.product_variant_id,
      sci.amount,
      pv.sku AS variant_sku,
      pv.price AS variant_price,
      p.id AS product_id,
      p.name AS product_name,
      p.slug AS product_slug,
      p.description AS product_description,
      p.image_1 AS product_image_1,
      p.image_2 AS product_image_2,
      p.image_3 AS product_image_3,
      p.image_4 AS product_image_4,
      p.image_5 AS product_image_5
    FROM shopping_cart_item sci
    INNER JOIN product_variant pv ON pv.id = sci.product_variant_id
    INNER JOIN product p ON p.id = pv.product_id
    WHERE sci.shopping_cart_id = ${cartId}
    ORDER BY p.name ASC
  `;

  // console.log(items)

  return items.map((row) => {
    const amount = asNumber(row.amount) || 1;
    const variantPrice = asNumber(row.variant_price);

    return {
      shopping_cart_id: row.shopping_cart_id,
      product_variant_id: row.product_variant_id,
      amount,
      variant_sku: row.variant_sku,
      variant_price: variantPrice,
      product_id: row.product_id,
      product_name: row.product_name,
      product_slug: row.product_slug,
      product_description: row.product_description,
      product_image_1: row.product_image_1,
      product_image_2: row.product_image_2,
      product_image_3: row.product_image_3,
      product_image_4: row.product_image_4,
      product_image_5: row.product_image_5,
      review_rating: row.review_rating == null ? null : asNumber(row.review_rating),
      review_comment: row.review_comment,
      item_total: amount * variantPrice,
      preview_image: buildPreviewImage(row),
    };
  });
}

// ===============================
// GET CURRENT PENDING CART
// ===============================
export async function getCurrentCart(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);
    const userId = validateId(res.locals.user.sub);

    const cart = await getOrCreatePendingCart(userId);
    const items = await getCartItems(cart.id);

    const total_amount = items.reduce((acc, item) => acc + Number(item.item_total), 0);

    return res.status(200).json({
      cart_id: cart.id,
      status: cart.status,
      item_count: items.length,
      total_amount,
      items,
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

// ===============================
// ADD ITEM TO CART
// ===============================
export async function addToCart(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);

    const userId = validateId(res.locals.user.sub);
    const productVariantId = validateId(req.body.product_variant_id, "Product variant id");
    const amount = validateNumber(req.body.amount ?? 1, "Amount", "int", 1, 1000);

    const [variant] = await sql<{ id: string; product_id: string | null; stock_quantity: number | string; is_deleted: boolean }[]>`
      SELECT id, product_id, stock_quantity, is_deleted
      FROM product_variant
      WHERE id = ${productVariantId}
      LIMIT 1
    `;

    if (!variant || variant.is_deleted) {
      resError(404, "Product variant not found");
    }

    const [product] = await sql<{ id: string; is_deleted: boolean }[]>`
      SELECT id, is_deleted
      FROM product
      WHERE id = ${variant.product_id}
      LIMIT 1
    `;

    if (!product || product.is_deleted) {
      resError(404, "Product not found");
    }

    const pendingCart = await getOrCreatePendingCart(userId);

    const [existingItem] = await sql<{ amount: number | string }[]>`
      SELECT amount
      FROM shopping_cart_item
      WHERE shopping_cart_id = ${pendingCart.id}
      AND product_variant_id = ${productVariantId}
      LIMIT 1
    `;

    const currentAmount = asNumber(existingItem?.amount);
    const stockQuantity = asNumber(variant.stock_quantity);

    if (currentAmount + amount > stockQuantity) {
      resError(400, "Not enough stock for this variant");
    }

    const [saved] = await sql<{
      shopping_cart_id: string;
      product_variant_id: string;
      amount: number | string;
    }[]>`
      INSERT INTO shopping_cart_item (
        shopping_cart_id,
        product_variant_id,
        amount
      )
      VALUES (
        ${pendingCart.id},
        ${productVariantId},
        ${amount}
      )
      ON CONFLICT (shopping_cart_id, product_variant_id)
      DO UPDATE SET amount = shopping_cart_item.amount + EXCLUDED.amount
      RETURNING shopping_cart_id, product_variant_id, amount
    `;

    return res.status(200).json({
      message: "Producto agregado al carrito",
      item: saved ?? {
        shopping_cart_id: pendingCart.id,
        product_variant_id: productVariantId,
        amount: currentAmount + amount,
      },
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

// ===============================
// UPDATE ITEM QUANTITY
// ===============================
export async function updateCartItem(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);

    const userId = validateId(res.locals.user.sub);
    const variantId = validateId(req.params.variantId, "Variant id");
    const amount = validateNumber(req.body.amount, "Amount", "int", 1, 1000);

    const pendingCart = await getOrCreatePendingCart(userId);

    const [variant] = await sql<{ stock_quantity: number | string }[]>`
      SELECT stock_quantity
      FROM product_variant
      WHERE id = ${variantId}
      LIMIT 1
    `;

    if (!variant) {
      resError(404, "Product variant not found");
    }

    if (amount > asNumber(variant.stock_quantity)) {
      resError(400, "Not enough stock for this variant");
    }

    const updated = await sql`
      UPDATE shopping_cart_item
      SET amount = ${amount}
      WHERE shopping_cart_id = ${pendingCart.id}
      AND product_variant_id = ${variantId}
      RETURNING shopping_cart_id, product_variant_id, amount
    `;

    if (updated.length === 0) {
      resError(404, "Item not found in your cart");
    }

    return res.status(200).json({ message: "Cantidad actualizada" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
export async function updateOtherCartItem(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const cartId = validateId(req.params.cartId, "Cart id");
    const variantId = validateId(req.params.variantId, "Variant id");
    const amount = validateNumber(req.body.amount, "Amount", "int", 1, 1000);

    const [current_shopping_item] = await sql<{ amount: number | string}[]>`
      SELECT amount
      FROM shopping_cart_item
      WHERE shopping_cart_id = ${cartId}
      AND product_variant_id = ${variantId}
      LIMIT 1
    `;

    if (!current_shopping_item) {
      resError(404, "Item not found in your cart");
    }

    const updated = await sql`
      UPDATE shopping_cart_item
      SET amount = ${amount}
      WHERE shopping_cart_id = ${cartId}
      AND product_variant_id = ${variantId}
      RETURNING shopping_cart_id, product_variant_id, amount
    `;

    if (updated.length === 0) {
      resError(404, "Item not found in your cart");
    }

    await sql`
      UPDATE product_variant
      SET user_quantity = user_quantity + ${Number(current_shopping_item.amount) - amount}
      WHERE id = ${variantId}
      RETURNING *
    `;

    return res.status(200).json({ message: "Cantidad actualizada" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

// ===============================
// REMOVE ITEM
// ===============================
export async function removeCartItem(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);

    const userId = validateId(res.locals.user.sub);
    const variantId = validateId(req.params.variantId, "Variant id");

    const pendingCart = await getOrCreatePendingCart(userId);

    const deleted = await sql`
      DELETE FROM shopping_cart_item
      WHERE shopping_cart_id = ${pendingCart.id}
      AND product_variant_id = ${variantId}
      RETURNING shopping_cart_id, product_variant_id
    `;

    if (deleted.length === 0) {
      resError(404, "Item not found in your cart");
    }

    return res.status(200).json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function checkoutCart(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const cartId = validateId(req.params.cartId);

    const [updated] = await sql<{ id: string; status: CartStatus }[]>`
      UPDATE shopping_cart
      SET status = ${cart_status.shipped}
      WHERE id = ${cartId}
      AND status = ${cart_status.processing}
      RETURNING id, status
    `;

    if (!updated) {
      resError(404, "Pending cart not found");
    }
    const items = await getCartItems(cartId);
    // update all amounts
    items.forEach(async (item) => {
      await sql`
            UPDATE product_variant
            SET stock_quantity = user_quantity
            WHERE id = ${item.product_variant_id}
            RETURNING *
            `;
    });
    return res.status(200).json({
      message: "Cart processed",
      cart_id: updated.id,
      status: updated.status,
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

// ===============================
// GET MY PURCHASES
// ===============================
export async function getMyPurchases(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);

    const userId = validateId(res.locals.user.sub);

    const purchases = await sql<CartSummaryRow[]>`
      SELECT
        c.id,
        c.status,
        COALESCE(SUM(COALESCE(sci.amount, 1) * COALESCE(pv.price, 0)), 0) AS total_amount,
        COALESCE(COUNT(sci.product_variant_id), 0) AS item_count,
        (
          SELECT p2.name
          FROM shopping_cart_item sci2
          INNER JOIN product_variant pv2 ON pv2.id = sci2.product_variant_id
          INNER JOIN product p2 ON p2.id = pv2.product_id
          WHERE sci2.shopping_cart_id = c.id
          LIMIT 1
        ) AS preview_name,
        (
          SELECT COALESCE(p2.image_1, p2.image_2, p2.image_3, p2.image_4, p2.image_5)
          FROM shopping_cart_item sci2
          INNER JOIN product_variant pv2 ON pv2.id = sci2.product_variant_id
          INNER JOIN product p2 ON p2.id = pv2.product_id
          WHERE sci2.shopping_cart_id = c.id
          LIMIT 1
        ) AS preview_image
      FROM shopping_cart c
      LEFT JOIN shopping_cart_item sci ON sci.shopping_cart_id = c.id
      LEFT JOIN product_variant pv ON pv.id = sci.product_variant_id
      WHERE c.user_id = ${userId}
      AND c.status <> 'pending'
      GROUP BY c.id, c.status
      ORDER BY c.id DESC
    `;

    return res.status(200).json(
      purchases.map((row) => ({
        id: row.id,
        status: row.status,
        total_amount: asNumber(row.total_amount),
        item_count: asNumber(row.item_count),
        preview_name: row.preview_name,
        preview_image: row.preview_image,
      }))
    );
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

// ===============================
// GET PURCHASE DETAIL
// ===============================
export async function getPurchaseById(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);

    const userId = validateId(res.locals.user.sub);
    const cartId = validateId(req.params.id, "Cart id");

    const [cart] = await sql<{ id: string; status: CartStatus }[]>`
      SELECT id, status
      FROM shopping_cart
      WHERE id = ${cartId}
      AND user_id = ${userId}
      AND status <> 'pending'
      LIMIT 1
    `;

    if (!cart) {
      resError(404, "Purchase not found");
    }

    const items = await sql<CartItemRow[]>`
      SELECT
        sci.shopping_cart_id,
        sci.product_variant_id,
        sci.amount,
        pv.sku AS variant_sku,
        pv.price AS variant_price,
        p.id AS product_id,
        p.name AS product_name,
        p.slug AS product_slug,
        p.description AS product_description,
        p.image_1 AS product_image_1,
        p.image_2 AS product_image_2,
        p.image_3 AS product_image_3,
        p.image_4 AS product_image_4,
        p.image_5 AS product_image_5,
        r.rating AS review_rating,
        r.comment AS review_comment
      FROM shopping_cart_item sci
      INNER JOIN product_variant pv ON pv.id = sci.product_variant_id
      INNER JOIN product p ON p.id = pv.product_id
      LEFT JOIN review r
        ON r.product_id = p.id
        AND r.user_id = ${userId}
      WHERE sci.shopping_cart_id = ${cartId}
      ORDER BY p.name ASC
    `;

    const mappedItems = items.map((row) => {
      const amount = asNumber(row.amount) || 1;
      const variantPrice = asNumber(row.variant_price);

      return {
        shopping_cart_id: row.shopping_cart_id,
        product_variant_id: row.product_variant_id,
        amount,
        variant_sku: row.variant_sku,
        variant_price: variantPrice,
        product_id: row.product_id,
        product_name: row.product_name,
        product_slug: row.product_slug,
        product_image_1: row.product_image_1,
        product_image_2: row.product_image_2,
        product_image_3: row.product_image_3,
        product_image_4: row.product_image_4,
        product_image_5: row.product_image_5,
        review_rating: row.review_rating == null ? null : asNumber(row.review_rating),
        review_comment: row.review_comment,
      };
    });

    const total_amount = mappedItems.reduce(
      (acc, item) => acc + Number(item.amount) * Number(item.variant_price),
      0
    );

    return res.status(200).json({
      cart_id: cart.id,
      status: cart.status,
      item_count: mappedItems.length,
      total_amount,
      items: mappedItems,
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

// ===============================
// GET CURRENT CART ALIAS
// ===============================
export async function getCarts(req: Request, res: Response) {
  try {
    const allCarts = await sql<PendingCartRow[]>`
      SELECT id, status
      FROM shopping_cart
      WHERE status = ${cart_status.processing}
    `;

    const allPendingForSellerCartsAndItems = allCarts.map(async (cart) => {
      const items = await getCartItems(cart.id);
      return {
        cart,
        items
      }
    });
    const result = await Promise.all(allPendingForSellerCartsAndItems);
    return res.json(result);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}