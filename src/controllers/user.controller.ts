import { Request, Response } from "express";
import { User } from "../types/entities";
import { sql } from "../db/supabase";
import { resError, responseToError } from "../utils/validations";

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const users = await sql<User[]>`
      SELECT *
      FROM users
      WHERE is_deleted = false
      ORDER BY created_at DESC
    `;

    const filtered_users: Omit<User, "password_hash">[] = users.map((user) => {
      const { password_hash, ...rest } = user;
      return rest;
    });

    return res.status(200).json(filtered_users);
  } catch (error: any) {
    return responseToError(error as Error, res);
  }
};

export const getDeletedUsers = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const users = await sql<User[]>`
      SELECT *
      FROM users
      WHERE is_deleted = true
      ORDER BY created_at DESC
    `;
    const filtered_users: Omit<User, "password_hash">[] = users.map((user) => {
      const { password_hash, ...rest } = user;
      return rest;
    });

    return res.status(200).json(filtered_users);
  } catch (error: any) {
    return responseToError(error as Error, res);
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    const users = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
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

export const getDeletedUserById = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    const users = await sql<User[]>`
      SELECT *
      FROM users
      WHERE id = ${id}
      AND is_deleted = true
      LIMIT 1
    `;
    if (users.length === 0) {
      resError(404, "User delete not found");
    }
    const filtered_users: Omit<User, "password_hash">[] = users.map((user) => {
      const { password_hash, ...rest } = user;
      return rest;
    });

    return res.status(200).json(users[0]);
  } catch (error: any) {
    return responseToError(error as Error, res);
  }
};
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
