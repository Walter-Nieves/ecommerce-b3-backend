import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { User } from "../types/entities";
import { resError, responseToError } from "../utils/validations";
import { Role } from "../types/enums";

type SafeUser = Omit<User, "password_hash">;

const sanitizeUser = (user: User): SafeUser => {
  const { password_hash, ...rest } = user;
  return rest;
};

interface CreateUserBody {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone: string;
  photo_url?: string | null;
  role: Role;
}

interface UpdateUserBody {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string | null;
  role: Role;
  is_active: boolean;
}

//todos excepto los eliminados 
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
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
  req: Request,
  res: Response
): Promise<Response> => {
  try {
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
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const [user] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = false
      LIMIT 1
    `;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

 //obtener eliminados por id
export const getDeletedUserById = async (
  req: Request<{ id: string }>,
  res: Response<SafeUser | { message: string }>
): Promise<Response> => {
  try {
    const { id } = req.params;

    const [user] = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = true
      LIMIT 1
    `;

    if (!user) {
      return res.status(404).json({ message: "Deleted user not found" });
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//obtener activos por email
export const getUserByEmail = async (
  req: Request<{ email: string }>,
  res: Response,
): Promise<Response> => {
  try {
    const { email } = req.params;

    const users = await sql<User[]>`
      SELECT *
      FROM users
      WHERE email = ${email}
      AND is_deleted = false
      LIMIT 1
    `;

    if (users.length === 0) {
      resError(404, "User not found");
    }

    const filtered_users: Omit<User, "password_hash">[] = users.map((user) => {
      const { password_hash, ...rest } = user;
      return rest;
    });

    return res.status(200).json(filtered_users[0]);
  } catch (error: any) {
    return responseToError(error as Error, res);
  }
};

//obtener eliminados por email
export const getDeletedUserByEmail = async (
  req: Request<{ email: string }>,
  res: Response,
): Promise<Response> => {
  try {
    const { email } = req.params;

    const users = await sql<User[]>`
      SELECT *
      FROM users
      WHERE email = ${email}
      AND is_deleted = true
      LIMIT 1
    `;

    if (users.length === 0) {
      resError(404, "User not found");
    }

    const filtered_users: Omit<User, "password_hash">[] = users.map((user) => {
      const { password_hash, ...rest } = user;
      return rest;
    });

    return res.status(200).json(filtered_users[0]);
  } catch (error: any) {
    return responseToError(error as Error, res);
  }
};

//crear usuario 
export const createUser = async (
  req: Request<{}, {}, CreateUserBody>,
  res: Response<SafeUser | { message: string }>
): Promise<Response> => {
  try {
    const {
      first_name,
      last_name,
      email,
      password_hash,
      phone,
      photo_url,
      role,
    } = req.body;

    const [newUser] = await sql<User[]>`
      INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash,
        phone,
        photo_url,
        role,
        is_active,
        email_verified,
        is_deleted
      )
      VALUES (
        ${first_name},
        ${last_name},
        ${email},
        ${password_hash},
        ${phone},
        ${photo_url ?? null},
        ${role},
        true,
        false,
        false
      )
      RETURNING *
    `;

    if (!newUser) {
      return res.status(500).json({ message: "User creation failed" });
    }

    return res.status(201).json(sanitizeUser(newUser));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//actualizar usuario 
export const updateUser = async (
  req: Request<{ id: string }, {}, UpdateUserBody>,
  res: Response<SafeUser | { message: string }>
): Promise<Response> => {
  try {
    const { id } = req.params;

    const {
      first_name,
      last_name,
      email,
      phone,
      photo_url,
      role,
      is_active,
    } = req.body;

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

    // hasChanges bien tipado y limpio
    const normalizedPhotoUrl = photo_url ?? null;

    const hasChanges =
      existingUser.first_name !== first_name ||
      existingUser.last_name !== last_name ||
      existingUser.email !== email ||
      existingUser.phone !== phone ||
      existingUser.photo_url !== normalizedPhotoUrl ||
      existingUser.is_active !== is_active ||
      existingUser.role !== role;

    if (!hasChanges) {
      return res.status(400).json({ message: "No changes detected" });
    }

    const [updatedUser] = await sql<User[]>`
      UPDATE users
      SET
        first_name = ${first_name},
        last_name = ${last_name},
        email = ${email},
        phone = ${phone},
        photo_url = ${normalizedPhotoUrl},
        role = ${role},
        is_active = ${is_active},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedUser) {
      return res.status(500).json({ message: "User update failed" });
    }

    return res.status(200).json(sanitizeUser(updatedUser));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//soft delete
export const softDeleteUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    await sql`
      UPDATE users
      SET
        is_deleted = true,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return res.status(200).json({ message: "User soft deleted" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

//restaurar usuario 
export const restoreUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    await sql`
      UPDATE users
      SET
        is_deleted = false,
        deleted_at = NULL,
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return res.status(200).json({ message: "User restored" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};


//force delete(borrado real)
export const forceDeleteUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    await sql`
      DELETE FROM users
      WHERE id = ${id}
    `;

    return res.status(200).json({ message: "User permanently deleted" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};