import { Request, Response } from "express";
import sql from "../db/supabase";

export async function getAllTag(req: Request, res: Response) {
  try {
    const tags = await sql`
      SELECT * FROM tag
      WHERE is_deleted = false
      ORDER BY name
    `;
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las etiquetas" });
  }
}

export async function getAllTagDeleteds(req: Request, res: Response) {
  try {
    const tags = await sql`
      SELECT * FROM tag
      WHERE is_deleted = true
      ORDER BY name
    `;
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las etiquetas eliminadas" });
  }
}


export async function getTagById(req: Request, res: Response) {
  try {
    const { id } = req.params

    if (!id) {
    return res.status(400).json({ error: "ID requerido" });
    }

    const tag = await sql`
      SELECT * FROM tag
      WHERE id = ${id}
      LIMIT 1
    `

    if (tag.length === 0) {
      return res.status(404).json({ error: "Etiqueta no encontrada" });
    }

    res.json(tag[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la etiqueta" });
  }
}

export async function createTag(req: Request, res: Response) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const newTag = await sql`
      INSERT INTO tag (name, is_deleted)
      VALUES (${name}, false)
      RETURNING *
    `;

    res.status(201).json(newTag[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la etiqueta" });
  }
}

export async function updateTag(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
    return res.status(400).json({ error: "ID requerido" });
    }

    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const updatedTag = await sql`
      UPDATE tag
      SET name = ${name}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedTag.length === 0) {
      return res.status(404).json({ error: "Etiqueta no encontrada" });
    }

    res.json(updatedTag[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la etiqueta" });
  }
}

export async function softDeleteTag(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
    return res.status(400).json({ error: "ID requerido" });
    }

    const deletedTag = await sql`
      UPDATE tag
      SET is_deleted = true
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedTag.length === 0) {
      return res.status(404).json({ error: "Etiqueta no encontrada" });
    }

    res.json({ message: "Etiqueta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la etiqueta" });
  }
}

export async function forceDeleteTag(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
    return res.status(400).json({ error: "ID requerido" });
    }

    const deletedTag = await sql`
      DELETE FROM tag
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedTag.length === 0) {
      return res.status(404).json({ error: "Etiqueta no encontrada" });
    }

    res.json({ message: "Etiqueta eliminada permanentemente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar permanentemente la etiqueta" });
  }
}


export async function restoreTag(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
    return res.status(400).json({ error: "ID requerido" });
    }

    const restoredTag = await sql`
      UPDATE tag
      SET is_deleted = false
      WHERE id = ${id}
      RETURNING *
    `;

    if (restoredTag.length === 0) {
      return res.status(404).json({ error: "Etiqueta no encontrada" });
    }

    res.json({ message: "Etiqueta restaurada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al restaurar la etiqueta" });
  }
}