import { Request, Response } from "express";
import { sql } from "../db/supabase";
import {
  responseToError,
  validateId,
  resError,
  validateName,
  validateSku,
  validateSlug,
} from "../utils/validations";
import { Material } from "../types/primitives";

export async function getAllMaterial(req: Request, res: Response) {
  try {
    const materials = await sql`
      SELECT * FROM material
      WHERE is_deleted = false
      ORDER BY name
    `;

    res.json(materials);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function getAllMaterialDeleteds(req: Request, res: Response) {
  try {
    const materials = await sql`
      SELECT * FROM material
      WHERE is_deleted = true
      ORDER BY name
    `;

    res.json(materials);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function getMaterialById(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const material = await sql`
      SELECT * FROM material
      WHERE id = ${id}
      LIMIT 1
    `;

    if (material.length === 0) {
      resError(404, "Material no encontrado");
    }

    res.json(material[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function createMaterial(req: Request, res: Response) {
  try {
    const material: Material = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
      sku: validateSku(req.body.sku, true),
    };

    const newMaterial = await sql`
      INSERT INTO material (name, slug, sku, is_deleted)
      VALUES (${material.name}, ${material.slug}, ${material.sku}, false)
      RETURNING *
    `;

    res.status(201).json(newMaterial[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function updateMaterial(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);
    const material: Material = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
      sku: validateSku(req.body.sku, true),
    };
    const updatedMaterial = await sql`
      UPDATE material
      SET name = ${material.name},
          slug = ${material.slug},
          sku = ${material.sku}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedMaterial.length === 0) {
      resError(404, "Material no encontrado");
    }

    res.json(updatedMaterial[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function softDeleteMaterial(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const deletedMaterial = await sql`
      UPDATE material
      SET is_deleted = true
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedMaterial.length === 0) {
      resError(404, "Material no encontrado");
    }

    res.json({ message: "Material eliminado correctamente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function forceDeleteMaterial(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const deletedMaterial = await sql`
      DELETE FROM material
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedMaterial.length === 0) {
      resError(404, "Material no encontrado");
    }

    res.json({ message: "Material eliminado permanentemente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function restoreMaterial(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const restoredMaterial = await sql`
      UPDATE material
      SET is_deleted = false
      WHERE id = ${id}
      RETURNING *
    `;

    if (restoredMaterial.length === 0) {
      resError(404, "Material no encontrado");
    }

    res.json({ message: "Material restaurado correctamente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
