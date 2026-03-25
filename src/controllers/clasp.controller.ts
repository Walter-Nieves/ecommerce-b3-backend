import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { Role } from "../types/enums";
import { Clasp } from "../types/primitives";
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
export async function getAllClasps(req: Request, res: Response) {
  try {
    const Clasp = await sql`
      SELECT * FROM clasp
      WHERE is_deleted = false
      ORDER BY name
    `;
    res.json(Clasp);
  } catch (error) {
    return responseToError(error as Error, res);
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
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   GET BY ID
================================ */
export async function getClaspById(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const Clasp = await sql`
      SELECT * FROM clasp WHERE id = ${id}
    `;

    res.json(Clasp[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   CREATE
================================ */
export async function createClasp(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const claps: Clasp = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
    };
    const newClasp = await sql`
      INSERT INTO clasp (name, slug)
      VALUES (${claps.name}, ${claps.slug})
      RETURNING *
    `;

    res.status(201).json(newClasp[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   UPDATE
================================ */
export async function updateClasp(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    const claps: Clasp = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
    };
    const updated = await sql`
      UPDATE clasp
      SET name = ${claps.name}, slug = ${claps.slug}
      WHERE id = ${id}
      RETURNING *
    `;

    res.json(updated[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}


/* ===============================
   RESTORE
================================ */
export async function restoreClasp(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    await sql`
      UPDATE clasp
      SET is_deleted = false
      WHERE id = ${id}
    `;

    res.json({ message: "Clasp restaurada" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   FORCE DELETE
================================ */
export async function forceDeleteClasp(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    await sql`
      DELETE FROM clasp
      WHERE id = ${id}
    `;

    res.json({ message: "Clasp eliminada permanentemente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}


/* ===============================
   SOFT DELETE
================================ */
export async function softDeleteClasp(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    await sql`
      UPDATE clasp
      SET is_deleted = true
      WHERE id = ${id}
    `;

    res.json({ message: "Clasp eliminada" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}