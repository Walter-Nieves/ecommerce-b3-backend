import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { Role } from "../types/enums";

import {
    resError,
    responseToError,
    validateBody,
    validateId,
    validateNumber,
    validateRoleForActions,
} from "../utils/validations";

// Obtener inventario de una variante
export async function getInventoryByVariantId(req: Request, res: Response) {
    try {
        validateRoleForActions(res.locals.user.role, [
            Role.Admin,
            Role.Seller,
            Role.Buyer,
        ]);

        const variant_id = validateId(req.params.variant_id);

        const inventory = await sql`
      SELECT * FROM product_variant
      WHERE id = ${variant_id}
    `;

        if (inventory.length === 0) {
            resError(404, "Inventory not found");
        }

        res.json(inventory[0]);
    } catch (error) {
        return responseToError(error as Error, res);
    }
}



// Agregar stock
export async function changeInventory(req: Request, res: Response) {
    try {
        validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);

        const variant_id = validateId(req.params.variant_id);

        validateBody(req.body, false);

        const stock_quantity = validateNumber(req.body.stock_quantity, "Stock Quantity", "int", 0, 9999)
        const user_quantity = validateNumber(req.body.user_quantity, "User Quantity", "int", 0, 9999)

        const current = await sql`
      SELECT * FROM product_variant
      WHERE id = ${variant_id}
    `;

        if (current.length === 0) {
            resError(404, "Inventory not found");
        }

        const updated = await sql`
      UPDATE product_variant
      SET
        stock_quantity = ${stock_quantity},
        user_quantity = ${user_quantity}
      WHERE id = ${variant_id}
      RETURNING *
    `;

        res.json(updated[0]);
    } catch (error) {
        return responseToError(error as Error, res);
    }
}
