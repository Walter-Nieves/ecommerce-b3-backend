import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { Role } from "../types/enums";
import { Category } from "../types/primitives";
import {
  responseToError,
  validateId,
  validateName,
  validateRoleForActions,
  validateSlug,
} from "../utils/validations";

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
  } catch (error) {
    return responseToError(error as Error, res);
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
  } catch (error) {
    return responseToError(error as Error, res);
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
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   CREATE
================================ */
export async function createCategory(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const category: Category = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
    };

    const newCategory = await sql`
      INSERT INTO category (name, slug)
      VALUES (${category.name}, ${category.slug})
      RETURNING *
    `;

    res.status(201).json(newCategory[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   UPDATE
================================ */
export async function updateCategory(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    const category: Category = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
    };

    const updated = await sql`
      UPDATE category
      SET name = ${category.name}, slug = ${category.slug}
      WHERE id = ${id}
      RETURNING *
    `;

    res.json(updated[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   SOFT DELETE
================================ */
export async function softDeleteCategory(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    await sql`
      UPDATE category
      SET is_deleted = true
      WHERE id = ${id}
    `;

    res.json({ message: "Categoría eliminada" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   RESTORE
================================ */
export async function restoreCategory(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    await sql`
      UPDATE category
      SET is_deleted = false
      WHERE id = ${id}
    `;

    res.json({ message: "Categoría restaurada" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   FORCE DELETE
================================ */
export async function forceDeleteCategory(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    await sql` 
      DELETE FROM category 
      WHERE id = ${id}  
    `;

    res.json({ message: "Categoría eliminada permanentemente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
