import { Request, Response } from "express";
import { User } from "../types/entities";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import {
  resError,
  responseToError,
  validateBody,
  validateEmail,
  validatePassword,
  validatePasswordHash,
  validateToken,
} from "../utils/validations";
import { sql } from "../db/supabase";
import { UserPayload } from "../types/primitives";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function login(req: Request, res: Response): Promise<Response> {
  try {
    const body = req.body;
    validateBody(body, false);

    const email = validateEmail(body.email);
    const password = validatePassword(body.password);

    const [user] = await sql<User[]>`
      SELECT * FROM users
      WHERE email = ${email}
      AND is_deleted = false
      LIMIT 1
    `;

    if (user == null) {
      resError(404, "User not found");
    }

    validatePasswordHash(password, user.password_hash);

    const accessPayload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
    };

    const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(refreshPayload, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ message: "Login successful" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function refresh(req: Request, res: Response): Promise<Response> {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken == null) resError(401, "Refresh token is required");

    const userId = validateToken(refreshToken) as UserPayload;

    const [user] = await sql<User[]>`
      SELECT * FROM users
      WHERE id = ${userId.sub}
      AND is_deleted = false
      LIMIT 1
    `;

    if (user == null) {
      resError(404, "User not found");
    }

    const newAccessPayload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const newAccessToken = jwt.sign(newAccessPayload, JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.json({ message: "Access token refreshed" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function logout (_: Request, res: Response): Promise<Response> {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0
    })
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0
    })
    return res.json({ message: "Logout successful" });
  } catch (error) {
    return responseToError(error as Error, res)
  }
}