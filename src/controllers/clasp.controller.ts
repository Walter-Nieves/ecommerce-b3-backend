import { Request, Response } from "express";
import sql from "../db/supabase";

/* ===============================
   GET ALL (no eliminadas)
================================ */
export async function getAllClasps(req: Request, res: Response) {
  try {
    const Clasp = await sql`
      SELECT * FROM clasp
      WHERE is_deleted = false
      ORDER BY name
    `;
    res.json(Clasp);
  } catch {
    res.status(500).json({ error: "Error al obtener clasps" });
  }
}

/* ===============================
   GET ALL DELETED
================================ */
export async function getDeletedClasps(req: Request, res: Response) {
  try {
    const Clasp = await sql`
      SELECT * FROM clasp
      WHERE is_deleted = true
      ORDER BY name
    `;
    res.json(Clasp);
  } catch {
    res.status(500).json({ error: "Error al obtener Clasps eliminadas" });
  }
}

/* ===============================
   GET BY ID
================================ */
export async function getClaspById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const Clasp = await sql`
      SELECT * FROM clasp WHERE id = ${id}
    `;

    res.json(Clasp[0]);
  } catch {
    res.status(500).json({ error: "Error al obtener clasp" });
  }
}

/* ===============================
   CREATE
================================ */
export async function createClasp(req: Request, res: Response) {
  try {
    const { name, slug } = req.body;

    const newClasp = await sql`
      INSERT INTO clasp (name, slug)
      VALUES (${name}, ${slug})
      RETURNING *
    `;

    res.status(201).json(newClasp[0]);
  } catch(error) {
      console.error(error);
    res.status(500).json({ error });
  }
}

/* ===============================
   UPDATE
================================ */
export async function updateClasp(req: Request, res: Response) {
  try {
   const id = Number(req.params.id);
    const { name, slug } = req.body;

    const updated = await sql`
      UPDATE clasp
      SET name = ${name}, slug = ${slug}
      WHERE id = ${id}
      RETURNING *
    `;

    res.json(updated[0]);
  } catch {
    res.status(500).json({ error: "Error al actualizar clasp" });
  }
}

/* ===============================
   SOFT DELETE
================================ */
export async function deleteClasp(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    await sql`
      UPDATE clasp
      SET is_deleted = true
      WHERE id = ${id}
    `;

    res.json({ message: "Clasp eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar clasp" });
  }
}

/* ===============================
   RESTORE
================================ */
export async function restoreClasp(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    await sql`
      UPDATE clasp
      SET is_deleted = false
      WHERE id = ${id}
    `;

    res.json({ message: "Clasp restaurada" });
  } catch {
    res.status(500).json({ error: "Error al restaurar clasp" });
  }
}

/* ===============================
   FORCE DELETE
================================ */
export async function forceDeleteClasp(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    await sql`
      DELETE FROM clasp
      WHERE id = ${id}
    `;

    res.json({ message: "Clasp eliminada permanentemente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar clasp permanentemente" });
  }
}