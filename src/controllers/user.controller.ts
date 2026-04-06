import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { User } from "../types/entities";
import {
  hashPassword,
  resError,
  responseToError,
  validateEmail,
  validateId,
  validatePassword,
  validatePhone,
  validateSimpleName,
  validateUrl,
  validateBody,
  validateRole,
  validateRoleForActions,
  validatePasswordHash,
} from "../utils/validations";
import { Role } from "../types/enums";
import { UserPayload } from "../types/primitives";

type SafeUser = Omit<User, "password_hash">;

const sanitizeUser = (user: User): SafeUser => {
  const { password_hash, ...rest } = user;
  return rest;
};

export const getUserMe = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateBody(res.locals.user, false);

    const currentUser = res.locals.user as UserPayload;

    const id = validateId(currentUser.sub);

    const [user] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = false
      LIMIT 1
    `;

    if (!user) {
      resError(404, "User not found");
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//todos excepto los eliminados
export const getAllUsers = async (
  _: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);
    const users = await sql<User[]>`
      SELECT *
      FROM users
      WHERE is_deleted = false
      ORDER BY created_at DESC
    `;

    const safeUsers = users.map(sanitizeUser);

    return res.status(200).json(safeUsers);
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//todos los eliminados
export const getDeletedUsers = async (
  _: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);
    const users = await sql<User[]>`
      SELECT *
      FROM users
      WHERE is_deleted = true
      ORDER BY created_at DESC
    `;

    const safeUsers = users.map(sanitizeUser);

    return res.status(200).json(safeUsers);
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//obtener activos por id
export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const { id } = req.params;

    const [user] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = false
      LIMIT 1
    `;

    if (!user) {
      resError(404, "User not found");
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//obtener eliminados por id
export const getDeletedUserById = async (
  req: Request,
  res: Response<SafeUser | { message: string }>,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    const [user] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = true
      LIMIT 1
    `;

    if (!user) {
      resError(404, "Deleted user not found");
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//obtener activos por email
export const getUserByEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const email = validateEmail(req.params.email);

    const [user] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE email = ${email}
      AND is_deleted = false
      LIMIT 1
    `;

    if (!user) {
      resError(404, "Deleted user not found");
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error: any) {
    return responseToError(error as Error, res);
  }
};

//obtener eliminados por email
export const getDeletedUserByEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const email = validateEmail(req.params.email);

    const [user] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE email = ${email}
      AND is_deleted = true
      LIMIT 1
    `;

    if (!user) {
      resError(404, "Deleted user not found");
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error: any) {
    return responseToError(error as Error, res);
  }
};

//crear usuario
export const createUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateBody(req.body, false);

    const first_name = validateSimpleName(
      req.body.first_name,
      true,
      "First name",
    );
    const last_name = validateSimpleName(req.body.last_name, true, "Last name");
    const email = validateEmail(req.body.email);
    const password = validatePassword(req.body.password);
    const password_hash = await hashPassword(password);
    const phone = validatePhone(req.body.phone);

    let role: Role;

    if (res.locals.user.role === Role.Admin) {
      role = validateRole(req.body.role, [Role.Admin, Role.Seller, Role.Buyer]);
    } else {
      role = Role.Buyer; // Si el usuario no es admin, se le asigna el rol de buyer por defecto
    }

    const user: User = {
      first_name,
      last_name,
      email,
      password_hash,
      phone,
      role,
    };

    const [newUser] = await sql<User[]>`
      INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash,
        phone,
        role,
        created_at,
        updated_at
      )
      VALUES (
        ${user.first_name},
        ${user.last_name},
        ${user.email},
        ${user.password_hash},
        ${user.phone},
        ${user.role},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    if (!newUser) {
      resError(500, "User creation failed");
    }

    return res.status(201).json(sanitizeUser(newUser));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//actualizar usuario
export const updateUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [
      Role.Admin,
      Role.Seller,
      Role.Buyer,
    ]);
    const id = validateId(req.params.id);

    const [existingUser] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = false
      LIMIT 1
    `;

    if (!existingUser) {
      resError(404, "User not found");
    }

    validateBody(req.body, false);
    const first_name = validateSimpleName(
      req.body.first_name,
      true,
      "First name",
    );
    const last_name = validateSimpleName(req.body.last_name, true, "Last name");
    const email = validateEmail(req.body.email);
    const phone = validatePhone(req.body.phone);

    const [emailIsBusy] = await sql<
      User[]
    >`SELECT FROM users WHERE email = ${email} AND id != ${id}`;

    if (emailIsBusy) {
      resError(400, "Email is already in use by another user");
    }

    const [phoneIsBusy] = await sql<
      User[]
    >`SELECT FROM users WHERE phone = ${phone} AND id != ${id}`;

    if (phoneIsBusy) {
      resError(400, "Phone is already in use by another user");
    }

    let role: Role;

    if (res.locals.user.role === Role.Admin) {
      role = validateRole(req.body.role, [Role.Admin, Role.Seller, Role.Buyer]);
    } else {
      role = Role.Buyer; // Si el usuario no es admin, se le asigna el rol de buyer por defecto
    }

    //detectar cambios
    const hasChanges =
      existingUser.first_name !== first_name ||
      existingUser.last_name !== last_name ||
      existingUser.email !== email ||
      existingUser.phone !== phone ||
      existingUser.role !== role;

    if (!hasChanges) {
      return res.status(200).json(sanitizeUser(existingUser));
    }

    const user: Omit<User, "password_hash" | "photo_url"> = {
      first_name,
      last_name,
      email,
      phone,
      role,
    };

    const [updatedUser] = await sql<User[]>`
      UPDATE users
      SET
        first_name = ${user.first_name},
        last_name = ${user.last_name},
        email = ${user.email},
        phone = ${user.phone},
        role = ${user.role},
        updated_at = NOW()
      WHERE id = ${id}
      AND is_deleted = false
      RETURNING *
    `;

    if (!updatedUser) {
      resError(500, "User update failed");
    }

    return res.status(200).json(sanitizeUser(updatedUser));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//soft delete
export const softDeleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);
    const id = validateId(req.params.id);

    if (res.locals.user.sub === id) {
      resError(400, "You cannot delete your own account");
    }

    const result = await sql`
      UPDATE users
      SET
        is_deleted = true,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      AND is_deleted = false
    `;

    if (result.count === 0) {
      resError(404, "User not found");
    }

    return res.status(200).json({ message: "User soft deleted" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//restaurar usuario
export const restoreUser = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);
    const id = validateId(req.params.id);

    const result = await sql`
      UPDATE users
      SET
        is_deleted = false,
        deleted_at = NULL,
        updated_at = NOW()
      WHERE id = ${id}
      AND is_deleted = true
    `;

    if (result.count === 0) {
      resError(404, "Deleted user not found");
    }

    return res.status(200).json({ message: "User restored" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//force delete(borrado real)
export const forceDeleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);
    const id = validateId(req.params.id);

    if (res.locals.user.sub === id) {
      resError(400, "You cannot delete your own account");
    }

    const result = await sql`
      DELETE FROM users
      WHERE id = ${id}
    `;

    if (result.count === 0) {
      resError(404, "User not found");
    }

    return res.status(200).json({ message: "User permanently deleted" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

export const updatePasswordUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [
      Role.Admin,
      Role.Buyer,
      Role.Seller,
    ]);
    validateBody(req.body, false);

    const id = validateId(req.params.id);

    const [user] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = false
      LIMIT 1
    `;

    if (!user) {
      resError(404, "User not found");
    }

    const { current_password, new_password } = req.body;

    const validatedCurrentPassword = validatePassword(current_password);
    const validatedNewPassword = validatePassword(new_password);

    await validatePasswordHash(validatedCurrentPassword, user.password_hash);

    //hashear nueva contraseña
    const newPasswordHash = await hashPassword(validatedNewPassword);

    await sql`
      UPDATE users
      SET
        password_hash = ${newPasswordHash},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};
export const updatePasswordAdminUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin]);
    validateBody(req.body, false);

    const id = validateId(req.params.id);

    const [user] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = false
      LIMIT 1
    `;

    if (!user) {
      resError(404, "User not found");
    }

    const { new_password } = req.body;

    const validatedNewPassword = validatePassword(new_password);
    const newPasswordHash = await hashPassword(validatedNewPassword);

    await sql`
      UPDATE users
      SET
        password_hash = ${newPasswordHash},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

export const updatePhotoUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateBody(req.body, false);
    const id = validateId(req.params.id);

    // Verificamos que el usuario exista
    const [existingUser] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = false
      LIMIT 1
    `;

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validamos URL (puedes usar tu validateUrl si ya lo tienes)
    const photo_url = validateUrl(req.body.imageUrl);

    const [updatedUser] = await sql<User[]>`
      UPDATE users
      SET
        photo_url = ${photo_url},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedUser) {
      resError(500, "Photo update failed");
    }

    return res.status(200).json({ message: "Photo updated successfully" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

export const postCheckEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateBody(req.body, false);
    const email = validateEmail(req.body.email);
    const [result] = await sql<
      [{ exists: boolean }]
    >`SELECT EXISTS(SELECT 1 FROM users WHERE email = ${email} AND is_deleted = false) AS exists`;

    return res.status(200).json({ exists: result.exists });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};
