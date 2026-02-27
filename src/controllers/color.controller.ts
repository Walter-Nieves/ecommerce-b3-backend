import { Request, Response } from "express";
import sql from "../db/supabase";
import {
  resError,
  responseToError,
  validateBody,
  validateHexCode,
  validateId,
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
    validateBody(req.body, false);

    const { name, slug, sku } = req.body;

    const hex_code = validateHexCode(req.body.hex_code);

    if (!name) resError(400, "Falta el nombre del color");
    if (!slug) resError(400, "Falta el slug del color");
    if (!sku) resError(400, "Falta el sku del color");

    const newColor = await sql`
            INSERT INTO COLOR (name, hex_code, slug, sku)
            VALUES (${name}, ${hex_code}, ${slug}, ${sku})
            RETURNING *
        `;

    res.status(201).json(newColor[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function softDeleteColor(req: Request, res: Response) {
  try {
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
    const id = req.params.id as string;
    const deletedMaterial = await sql`
      DELETE FROM COLOR
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedMaterial.length === 0) {
      return res.status(404).json({ error: "Color no encontrado" });
    }

    res.json({ message: "Color eliminado permanentemente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar permanentemente el color" });
  }
}

export async function restoreColor(req: Request, res: Response) {
  try {
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
    validateBody(req.body, false);

    const id = validateId(req.params.id);
    const { name, slug, sku } = req.body;

    const hex_code = validateHexCode(req.body.hex_code);

    if (!name) resError(400, "Falta el nombre del color");
    if (!slug) resError(400, "Falta el slug del color");
    if (!sku) resError(400, "Falta el sku del color");

    const updatedColor = await sql`
            UPDATE COLOR
            SET name = ${name as string},
                slug = ${slug as string},
                sku = ${sku as string},
                hex_code = ${hex_code}
            WHERE id = ${id}
            RETURNING *
        `;

    res.json(updatedColor[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
