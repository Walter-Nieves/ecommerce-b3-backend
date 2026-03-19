import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { Role } from "../types/enums";
import { Color } from "../types/primitives";
import {
  resError,
  responseToError,
  validateBody,
  validateHexCode,
  validateId,
  validateName,
  validateRoleForActions,
  validateSku,
  validateSlug,
} from "../utils/validations";

export async function getAllColor(req: Request, res: Response) {
  try {
    const colors = await sql`
            SELECT * FROM COLOR
            WHERE is_deleted = false
            ORDER BY name
        `;

    res.json(colors);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function getAllDeletedColor(req: Request, res: Response) {
  try {
    const colors = await sql`
            SELECT * FROM COLOR
            WHERE is_deleted = true
            ORDER BY name
        `;

    res.json(colors);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function getColorByHexId(req: Request, res: Response) {
  const id = validateId(req.params.id);
  try {
    const colors = await sql`
          SELECT * FROM COLOR
          WHERE id = ${id}
          ORDER BY name
      `;

    res.json(colors);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function postColor(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    validateBody(req.body, false);

    const color: Color = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
      sku: validateSku(req.body.sku, true),
      hex_code: validateHexCode(req.body.hex_code),
    };

    const newColor = await sql`
            INSERT INTO COLOR (name, hex_code, slug, sku)
            VALUES (${color.name}, ${color.hex_code}, ${color.sku}, ${color.slug})
            RETURNING *
        `;

    res.status(201).json(newColor[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function softDeleteColor(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);
    await sql`
          UPDATE COLOR
          SET is_deleted = true
          WHERE id = ${id}
      `;

    res.json({ message: "Color eliminado correctamente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function forceDeleteColor(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = req.params.id as string;
    const deletedMaterial = await sql`
      DELETE FROM COLOR
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedMaterial.length === 0) {
      resError(404, "Color not found");
    }

    res.json({ message: "Color eliminado permanentemente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function restoreColor(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    await sql`
            UPDATE COLOR
            SET is_deleted = false
            WHERE id = ${id}
        `;

    res.json({ message: "Color restaurado correctamente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function putColor(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    validateBody(req.body, false);

    const id = validateId(req.params.id);
    const color: Color = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
      sku: validateSku(req.body.sku, true),
      hex_code: validateHexCode(req.body.hex_code),
    };

    const updatedColor = await sql`
            UPDATE COLOR
            SET name = ${color.name},
                slug = ${color.slug},
                sku = ${color.sku},
                hex_code = ${color.hex_code}
            WHERE id = ${id}
            RETURNING *
        `;

    res.json(updatedColor[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
