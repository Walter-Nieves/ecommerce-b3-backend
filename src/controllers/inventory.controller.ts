import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { Role } from "../types/enums";

import {
    resError,
    responseToError,
    validateBody,
    validateId,
    validateRoleForActions,
} from "../utils/validations";


// Obtener inventario de una variante
export async function getInventoryByVariantId(
    req: Request,
    res: Response
) {
    try {
        validateRoleForActions(
            res.locals.user.role,
            [Role.Admin, Role.Seller, Role.Buyer]
        );

        const variant_id = validateId(req.params.variant_id);

        const inventory = await sql`
      SELECT * FROM inventory
      WHERE variant_id = ${variant_id}
    `;

        if (inventory.length === 0) {
            resError(404, "Inventory not found");
        }

        res.json(inventory[0]);

    } catch (error) {
        return responseToError(error as Error, res);
    }
}


// Crear inventario
export async function createInventory(
    req: Request,
    res: Response
) {
    try {
        validateRoleForActions(
            res.locals.user.role,
            [Role.Admin, Role.Seller]
        );

        validateBody(req.body, false);

        const variant_id = validateId(
            req.body.variant_id
        );

        const stock_quantity = Number(
            req.body.stock_quantity
        );

        const user_quantity = Number(
            req.body.user_quantity
        );

        if (
            isNaN(stock_quantity) ||
            stock_quantity < 0
        ) {
            resError(400, "Invalid stock quantity");
        }

        if (
            isNaN(user_quantity) ||
            user_quantity < 0
        ) {
            resError(400, "Invalid user quantity");
        }

        const exists = await sql`
      SELECT variant_id FROM inventory
      WHERE variant_id = ${variant_id}
    `;

        if (exists.length > 0) {
            resError(400, "Inventory already exists");
        }

        const created = await sql`
      INSERT INTO inventory (
        variant_id,
        stock_quantity,
        user_quantity
      )
      VALUES (
        ${variant_id},
        ${stock_quantity},
        ${user_quantity}
      )
      RETURNING *
    `;

        res.status(201).json(created[0]);

    } catch (error) {
        return responseToError(error as Error, res);
    }
}


// Agregar stock
export async function addInventory(
    req: Request,
    res: Response
) {
    try {
        validateRoleForActions(
            res.locals.user.role,
            [Role.Admin, Role.Seller]
        );

        const variant_id = validateId(
            req.params.variant_id
        );

        validateBody(req.body, false);

        const quantity = Number(
            req.body.quantity
        );

        if (
            isNaN(quantity) ||
            quantity <= 0
        ) {
            resError(400, "Invalid quantity");
        }

        const current = await sql`
      SELECT * FROM inventory
      WHERE variant_id = ${variant_id}
    `;

        if (current.length === 0) {
            resError(404, "Inventory not found");
        }

        const updated = await sql`
      UPDATE inventory
      SET
        stock_quantity = stock_quantity + ${quantity},
        user_quantity = user_quantity + ${quantity}
      WHERE variant_id = ${variant_id}
      RETURNING *
    `;

        res.json(updated[0]);

    } catch (error) {
        return responseToError(error as Error, res);
    }
}


// Restar stock
export async function removeInventory(
    req: Request,
    res: Response
) {
    try {
        validateRoleForActions(
            res.locals.user.role,
            [Role.Admin, Role.Seller]
        );

        const variant_id = validateId(
            req.params.variant_id
        );

        validateBody(req.body, false);

        const quantity = Number(
            req.body.quantity
        );

        if (
            isNaN(quantity) ||
            quantity <= 0
        ) {
            resError(400, "Invalid quantity");
        }

        const current = await sql`
      SELECT * FROM inventory
      WHERE variant_id = ${variant_id}
    `;

        if (current.length === 0) {
            resError(404, "Inventory not found");
        }

        if (
            current[0]?.stock_quantity < quantity
        ) {
            resError(
                400,
                "Not enough stock available"
            );
        }

        const updated = await sql`
      UPDATE inventory
      SET
        stock_quantity = stock_quantity - ${quantity},
        user_quantity = user_quantity - ${quantity}
      WHERE variant_id = ${variant_id}
      RETURNING *
    `;

        res.json(updated[0]);

    } catch (error) {
        return responseToError(error as Error, res);
    }
}