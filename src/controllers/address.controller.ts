import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { Role } from "../types/enums";
import { Address } from "../types/entities";

import {
  resError,
  responseToError,
  validateBody,
  validateId,
  validateRoleForActions,
  validateText,
} from "../utils/validations";

export async function getAllAddress(_: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);

    const address = await sql`
      SELECT * FROM address ORDER BY city
    `;

    res.json(address);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function getAllMeAddress(_: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [
      Role.Admin,
      Role.Seller,
      Role.Buyer,
    ]);
    const id = validateId(res.locals.user.sub);

    const address = await sql`
      SELECT * FROM address WHERE user_id = ${id} ORDER BY is_default DESC, city ASC
    `;

    res.json(address);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function getAllUserAddress(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);

    const id = validateId(req.params.id);

    const address = await sql`
      SELECT * FROM address WHERE user_id = ${id} ORDER BY is_default DESC, city ASC
    `;

    res.json(address);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function getAddressById(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    const address = await sql`
      SELECT * FROM address WHERE id = ${id}
    `;

    if (address.length === 0) {
      resError(404, "Address not found");
    }

    res.json(address[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function createAddress(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [
      Role.Admin,
      Role.Seller,
      Role.Buyer,
    ]);
    const user_id = validateId(res.locals.user.sub);
    validateBody(req.body, false);
    const country = validateText(req.body.country, "Country", 3, 70, false);
    const state = validateText(req.body.state, "State", 3, 70, false);
    const city = validateText(req.body.city, "City", 3, 70, false);
    const is_default = req.body.is_default === true;
    const postal_code = validateText(
      req.body.postal_code,
      "Postal Code",
      3,
      70,
      true,
    );
    const street_address = validateText(
      req.body.street_address,
      "Street Address",
      3,
      70,
      true,
    );
    const reference = validateText(
      req.body.reference,
      "Reference",
      10,
      256,
      true,
    );
    const address: Address = {
      user_id,
      country,
      state,
      city,
      postal_code,
      street_address,
      reference,
      is_default
    };

    if (is_default) {
      await sql`
        UPDATE address
        SET is_default = false
        WHERE user_id = ${user_id}
      `;
    }

    const newAddress = await sql`
      INSERT INTO address (
        user_id,
        country,
        state,
        city,
        postal_code,
        street_address,
        reference,
        is_default
      )
      VALUES (
        ${address.user_id},
        ${address.country},
        ${address.state},
        ${address.city},
        ${address.postal_code},
        ${address.street_address},
        ${address.reference},
        ${address.is_default}
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
    validateRoleForActions(res.locals.user.role, [
      Role.Admin,
      Role.Seller,
      Role.Buyer,
    ]);
    
    const id = validateId(req.params.id);

    const current_address = await sql<Address[]>`
      SELECT * FROM address WHERE id = ${id}
    `;

    if (current_address.length == 0) {
      resError(404, "Address not found");
    }

    const user = {
      sub: validateId(res.locals.user.sub),
      role: res.locals.user.role
    }

    if (
      current_address[0]?.user_id != user.sub // si no soy el dueño de la dirección
      && user.role != Role.Admin // y no soy administrador
    ) {
      /* resError(403, "You do not have permission to access this address");
      Nota de seguridad: Algunos desarrolladores prefieren devolver
      un 404 Not Found incluso en problemas de permisos.
      Esto se hace para no confirmar a un posible atacante que el ID
      que está probando realmente existe en la base de datos. */
      resError(404, "Address not found");
    }

    validateBody(req.body, false);

    const country = validateText(req.body.country, "Country", 3, 70, false);
    const state = validateText(req.body.state, "State", 3, 70, false);
    const city = validateText(req.body.city, "City", 3, 70, false);
    const is_default = req.body.is_default === true;
    const postal_code = validateText(
      req.body.postal_code,
      "Postal Code",
      3,
      70,
      true,
    );
    const street_address = validateText(
      req.body.street_address,
      "Street Address",
      3,
      70,
      true,
    );
    const reference = validateText(
      req.body.reference,
      "Reference",
      10,
      256,
      true,
    );
    if (is_default) {
      await sql`
        UPDATE address
        SET is_default = false
        WHERE user_id = ${current_address[0]?.user_id as string}
      `;
    }
    const address: Omit<Address, "user_id"> = {
      country,
      state,
      city,
      postal_code,
      street_address,
      reference,
      is_default
    };

    const updated = await sql`
      UPDATE address
      SET
        country = ${address.country},
        state = ${address.state},
        city = ${address.city},
        postal_code = ${address.postal_code},
        street_address = ${address.street_address},
        reference = ${address.reference},
        is_default = ${address.is_default}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      resError(404, "Address no encontrada");
    }

    res.json(updated[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function setDefaultAddress(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [
      Role.Admin,
      Role.Seller,
      Role.Buyer,
    ]);

    const userId = validateId(res.locals.user.sub);
    const addressId = validateId(req.params.id);

    await sql`
      UPDATE address
      SET is_default = false
      WHERE user_id = ${userId}
    `;

    const updated = await sql`
      UPDATE address
      SET is_default = true
      WHERE id = ${addressId} AND user_id = ${userId}
      RETURNING *
    `;

    if (updated.length === 0) {
      resError(404, "Address no encontrada");
    }

    res.json(updated[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}



export async function DeleteAddress(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [
      Role.Admin,
      Role.Seller,
      Role.Buyer,
    ]);

    const id = validateId(req.params.id);

    const result = await sql`
      DELETE FROM address
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      resError(404, "Address no encontrada");
    }

    res.json({ message: "Address eliminada correctamente" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
