import { Request, Response } from "express";
import sql from "../db/supabase";
import {responseToError, validateId} from "../utils/validations"

export async function getAllTag(req: Request, res: Response) {
  try {
    const tags = await sql`
      SELECT * FROM tag
      WHERE is_deleted = false
      ORDER BY name
    `;
    res.json(tags);
  } catch (error) {
    return responseToError(error as Error, res);
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
    return responseToError(error as Error, res);
  }
}


export async function getTagById(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id)

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
    return responseToError(error as Error, res);
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
    return responseToError(error as Error, res);
  }
}

export async function updateTag(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id)
    const { name } = req.body;

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
    return responseToError(error as Error, res);
  }
}

export async function softDeleteTag(req: Request, res: Response) {
  try {
    const id= validateId(req.params.id)

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
    return responseToError(error as Error, res);
  }
}

export async function forceDeleteTag(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id)

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
    return responseToError(error as Error, res);
  }
}


export async function restoreTag(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id)

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
    return responseToError(error as Error, res);
  }
}