import { Request, Response } from "express";
import sql from "../db/supabase";

export async function getAllMaterial(req: Request, res: Response) {
    try {
        const materials = await sql`
      SELECT * FROM material
      WHERE is_deleted = false
      ORDER BY name
    `

        res.json(materials)
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los materiales" })
    }
}

export async function getAllMaterialDeleteds(req: Request, res: Response) {
    try {
        const materials = await sql`
      SELECT * FROM material
      WHERE is_deleted = true
      ORDER BY name
    `

        res.json(materials)
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los materiales eliminados" })
    }
}

export async function getMaterialById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)

        if (!id) {
            return res.status(400).json({ error: "ID inválido" })
        }

        const material = await sql`
      SELECT * FROM material
      WHERE id = ${id}
      LIMIT 1
    `

        if (material.length === 0) {
            return res.status(404).json({ error: "Material no encontrado" })
        }

        res.json(material[0])
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el material" })
    }
}

export async function createMaterial(req: Request, res: Response) {
    try {
        const { name, slug, sku } = req.body

        if (!name || !slug || !sku) {
            return res.status(400).json({ error: "name, slug y sku son obligatorios" })
        }

        const newMaterial = await sql`
      INSERT INTO material (name, slug, sku, is_deleted)
      VALUES (${name}, ${slug}, ${sku}, false)
      RETURNING *
    `

        res.status(201).json(newMaterial[0])
    } catch (error) {
        res.status(500).json({ error: "Error al crear el material" })
    }
}

export async function updateMaterial(req: Request, res: Response ) {
    try {
        const id = Number(req.params.id)
        const { name, slug, sku } = req.body

        if (!name || !slug || !sku || !id) {
            return res.status(400).json({ error: "id, name, slug y sku son obligatorios" })
        }

        const updatedMaterial = await sql`
      UPDATE material
      SET name = ${name},
          slug = ${slug},
          sku = ${sku}
      WHERE id = ${id}
      RETURNING *
    `

        if (updatedMaterial.length === 0) {
            return res.status(404).json({ error: "Material no encontrado" })
        }

        res.json(updatedMaterial[0])
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el material" })
    }
}

export async function softDeleteMaterial(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)

        if (!id) {
            return res.status(400).json({ error: "ID inválido" })
        }

        const deletedMaterial = await sql`
      UPDATE material
      SET is_deleted = true
      WHERE id = ${id}
      RETURNING *
    `

        if (deletedMaterial.length === 0) {
            return res.status(404).json({ error: "Material no encontrado" })
        }

        res.json({ message: "Material eliminado correctamente" })
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el material" })
    }
}

export async function forceDeleteMaterial( req: Request, res: Response) {
    try {
        const id = Number(req.params.id)

        if (!id) {
            return res.status(400).json({ error: "ID inválido" })
        }

        const deletedMaterial = await sql`
      DELETE FROM material
      WHERE id = ${id}
      RETURNING *
    `

        if (deletedMaterial.length === 0) {
            return res.status(404).json({ error: "Material no encontrado" })
        }

        res.json({ message: "Material eliminado permanentemente" })
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar permanentemente el material" })
    }
}

export async function restoreMaterial(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)

        if (!id) {
            return res.status(400).json({ error: "ID inválido" })
        }

        const restoredMaterial = await sql`
      UPDATE material
      SET is_deleted = false
      WHERE id = ${id}
      RETURNING *
    `

        if (restoredMaterial.length === 0) {
            return res.status(404).json({ error: "Material no encontrado" })
        }

        res.json({ message: "Material restaurado correctamente" })
    } catch (error) {
        res.status(500).json({ error: "Error al restaurar el material" })
    }
}