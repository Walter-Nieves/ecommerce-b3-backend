import { Request, Response } from "express";
import sql from "../db/supabase";
import { validateId } from "../utils/validations";


/* ===============================
   GET ALL (no eliminadas)
================================ */
export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await sql`
      SELECT * FROM category
      WHERE is_deleted = false
      ORDER BY name
    `;
    res.json(categories);
  } catch {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
}

/* ===============================
   GET ALL DELETED
================================ */
export async function getDeletedCategories(req: Request, res: Response) {
  try {
    const categories = await sql`
      SELECT * FROM category
      WHERE is_deleted = true
      ORDER BY name
    `;
    res.json(categories);
  } catch {
    res.status(500).json({ error: "Error al obtener categorías eliminadas" });
  }
}

/* ===============================
   GET BY ID
================================ */
export async function getCategoryById(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const category = await sql`
      SELECT * FROM category WHERE id = ${id}
    `;

    res.json(category[0]);
  } catch {
    res.status(500).json({ error: "Error al obtener categoría" });
  }
}

/* ===============================
   CREATE
================================ */
export async function createCategory(req: Request, res: Response) {
  try {
    const { name, slug } = req.body;

    const newCategory = await sql`
      INSERT INTO category (name, slug)
      VALUES (${name}, ${slug})
      RETURNING *
    `;

    res.status(201).json(newCategory[0]);
  } catch {
    res.status(500).json({ error: "Error al crear categoría" });
  }
}

/* ===============================
   UPDATE
================================ */
export async function updateCategory(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);
    const { name, slug } = req.body;

    const updated = await sql`
      UPDATE category
      SET name = ${name}, slug = ${slug}
      WHERE id = ${id}
      RETURNING *
    `;

    res.json(updated[0]);
  } catch {
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
}

/* ===============================
   SOFT DELETE
================================ */
export async function softDeleteCategory(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    await sql`
      UPDATE category
      SET is_deleted = true
      WHERE id = ${id}
    `;

    res.json({ message: "Categoría eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
}

/* ===============================
   RESTORE
================================ */
export async function restoreCategory(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    await sql`
      UPDATE category
      SET is_deleted = false
      WHERE id = ${id}
    `;

    res.json({ message: "Categoría restaurada" });
  } catch {
    res.status(500).json({ error: "Error al restaurar categoría" });
  }
}

/* ===============================
   FORCE DELETE
================================ */
export async function forceDeleteCategory(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    await sql` 
      DELETE FROM category 
      WHERE id = ${id}  
    `;

    res.json({ message: "Categoría eliminada permanentemente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar permanentemente" });
  }
}