import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { Role } from "../types/enums";
import { Address } from "../types/entities";

import {
  responseToError,
  validateId,
  validateRoleForActions,
} from "../utils/validations";

export async function getAllAddress(req: Request, res: Response) {
  try {
    const address = await sql`
      SELECT * FROM address
      WHERE is_deleted = false
      ORDER BY city
    `;

    res.json(address);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}


export async function getDeletedAddress(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);

    const address = await sql`
      SELECT * FROM address
      WHERE is_deleted = true
      ORDER BY city
    `;

    res.json(address);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}


export async function getAddressById(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const address = await sql`
      SELECT * FROM address
      WHERE id = ${id}
    `;

    res.json(address[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function createAddress(req: Request, res: Response) {
  try {
    const address: Address = {
      user_id: req.body.user_id,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      postal_code: req.body.postal_code,
      street_address: req.body.street_address,
      reference: req.body.reference,
    };

    const newAddress = await sql`
      INSERT INTO address (
        user_id,
        country,
        state,
        city,
        postal_code,
        street_address,
        reference
      )
      VALUES (
        ${address.user_id},
        ${address.country},
        ${address.state},
        ${address.city},
        ${address.postal_code},
        ${address.street_address},
        ${address.reference}
      )
      RETURNING *
    `;

    res.status(201).json(newAddress[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function updateAddress(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const address: Address = {
      user_id: req.body.user_id,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      postal_code: req.body.postal_code,
      street_address: req.body.street_address,
      reference: req.body.reference,
    };

    const updated = await sql`
      UPDATE address
      SET
        user_id = ${address.user_id},
        country = ${address.country},
        state = ${address.state},
        city = ${address.city},
        postal_code = ${address.postal_code},
        street_address = ${address.street_address},
        reference = ${address.reference}
      WHERE id = ${id}
      RETURNING *
    `;

    res.json(updated[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function restoreAddress(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);

    const id = validateId(req.params.id);

    await sql`
      UPDATE address
      SET is_deleted = false
      WHERE id = ${id}
    `;

    res.json({ message: "Address restaurada" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function softDeleteAddress(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);

    const id = validateId(req.params.id);

    await sql`
      UPDATE address
      SET is_deleted = true
      WHERE id = ${id}
    `;

    res.json({ message: "Address eliminada" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function forceDeleteAddress(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);

    const id = validateId(req.params.id);

    await sql`
      DELETE FROM address
      WHERE id = ${id}
    `;

    res.json({ message: "Address eliminada permanentemente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}