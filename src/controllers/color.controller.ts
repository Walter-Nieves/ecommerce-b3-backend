import { Request, Response } from "express";
import sql from "../db/supabase";

export async function getColor(req: Request, res: Response) {
    try {
        const colors = await sql`SELECT * FROM COLOR ORDER BY name`;
        res.json(colors);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los colores" });
    }
}

export async function postColor(req: Request, res: Response) {
    try {
        const { name, hex_code_id, slug, sku } = req.body;
        const newColor = await sql`INSERT INTO COLOR (name, hex_code_id, slug, sku) VALUES (${name}, ${hex_code_id}, ${slug}, ${sku})`;
        res.status(201).json(newColor[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el color" });
    }
}

export async function deleteColor(req: Request, res: Response) {
    try {
        const { id } = req.params;

        await sql`
            UPDATE COLOR SET is_deleted = true WHERE id = ${id}`;

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el color" });
    }
}

export async function putColor(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, hex_code_id, slug, sku } = req.body;
        const updatedColor = await sql`UPDATE COLOR SET name = ${name}, hex_code_id = ${hex_code_id}, slug = ${slug}, sku = ${sku} WHERE id = ${id} RETURNING *`;
        res.json(updatedColor[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el color" });
    }
}

export async function patchColor(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, hex_code_id, slug, sku, is_deleted } = req.body;

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
        if (is_deleted !== undefined) {
            fields.push(sql`is_deleted = ${is_deleted}`);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: "No hay campos para actualizar" });
        }

        const updatedColor = await sql` UPDATE COLOR SET ${sql.join(fields, sql`, `)} WHERE id = ${id} RETURNING *`;

        res.json(updatedColor[0]);

    } catch (error) {
        res.status(500).json({ error: "Error al actualizar parcialmente el color" });
    }
}
