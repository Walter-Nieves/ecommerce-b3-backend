import { Request, Response } from "express";
import sql from "../db/supabase";
import { resError, responseToError, validateBody, validateHexCode } from "../utils/validations";

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

    const id = req.params.id as string;
    const hex_code_id = validateHexCode(id);
    try {
        const colors = await sql`
            SELECT * FROM COLOR
            WHERE hex_code_id = ${id}
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

        const { name, hex_code_id, slug, sku } = req.body;

        if (!name) resError(400, "Falta el nombre del color");
        if (!hex_code_id) resError(400, "Falta el codigo hex del color");
        if (!slug) resError(400, "Falta el slug del color");
        if (!sku) resError(400, "Falta el sku del color");

        const newColor = await sql`
            INSERT INTO COLOR (name, hex_code_id, slug, sku)
            VALUES (${name}, ${hex_code_id}, ${slug}, ${sku})
            RETURNING *
        `;

        res.status(201).json(newColor[0]);

    } catch (error) {
        return responseToError(error as Error, res);
    }
}

export async function softDeleteColor(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const hex_code_id = validateHexCode(id);
        await sql`
            UPDATE COLOR
            SET is_deleted = true
            WHERE id = ${id}
        `;

        res.status(204).send();

    } catch (error) {
        return responseToError(error as Error, res);
    }
}

export async function forceDeleteColor(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const hex_code_id = validateHexCode(id);
        const deletedMaterial = await sql`
      DELETE FROM COLOR
      WHERE id = ${id}
      RETURNING *
    `

        if (deletedMaterial.length === 0) {
            return res.status(404).json({ error: "Color no encontrado" })
        }

        res.json({ message: "Color eliminado permanentemente" })
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar permanentemente el color" })
    }
}

export async function restoreColor(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const hex_code_id = validateHexCode(id);

        await sql`
            UPDATE COLOR
            SET is_deleted = false
            WHERE id = ${id}
        `;

        res.status(204).send();

    } catch (error) {
        return responseToError(error as Error, res);
    }
}

export async function putColor(req: Request, res: Response) {
    try {
        validateBody(req.body, false);

        const id = req.params.id as string;
        const { name, slug, sku } = req.body;

        const hex_code_id = validateHexCode(id);

        if (!name) resError(400, "Falta el nombre del color");
        if (!hex_code_id) resError(400, "Falta el codigo hex del color");
        if (!slug) resError(400, "Falta el slug del color");
        if (!sku) resError(400, "Falta el sku del color");

        const updatedColor = await sql`
            UPDATE COLOR
            SET name = ${name as string},
                slug = ${slug as string},
                sku = ${sku as string}
            WHERE hex_code_id = ${hex_code_id}
            RETURNING *
        `;

        res.json(updatedColor[0]);

    } catch (error) {
        return responseToError(error as Error, res);
    }
}

export async function patchColor(req: Request, res: Response) {
    try {
        validateBody(req.body, false);

        const id = req.params.id as string;
        const { name, slug, sku } = req.body;

        const hex_code_id = validateHexCode(id);

        const fields = [];

        if (name !== undefined) {
            fields.push(sql`name = ${name}`);
        }

        if (hex_code_id !== undefined) {
            fields.push(sql`hex_code_id = ${hex_code_id}`);
        }

        if (slug !== undefined) {
            fields.push(sql`slug = ${slug}`);
        }

        if (sku !== undefined) {
            fields.push(sql`sku = ${sku}`);
        }

        if (fields.length === 0) {
            resError(400, "Error en el cuerpo enviado");
        }

        const updatedColor = await sql`
            UPDATE COLOR
            SET ${sql.join(fields, sql`, `)}
            WHERE id = ${id}
            RETURNING *
        `;

        res.json(updatedColor[0]);

    } catch (error) {
        return responseToError(error as Error, res);
    }
}