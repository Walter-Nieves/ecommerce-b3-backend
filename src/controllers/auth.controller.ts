import { Request, Response } from "express";
import { User } from "../types/entities";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import {
  hashPassword,
  resError,
  responseToError,
  validateBody,
  validateCode,
  validateEmail,
  validatePassword,
  validatePasswordHash,
  validateToken,
} from "../utils/validations";
import { sql } from "../db/supabase";
import { UserPayload } from "../types/primitives";
import { CODE_EXPIRATION_MS, verificationCodes } from "../db/emailCheckStore";
import { transporter } from "../utils/mailer";

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

    await validatePasswordHash(password, user.password_hash);

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

export async function logout(_: Request, res: Response): Promise<Response> {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 0,
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 0,
    });
    return res.json({ message: "Logout successful" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function sendCode(req: Request, res: Response) {
  try {
    validateBody(req.body, false);
    const email = validateEmail(req.body.email);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const code_hash = await hashPassword(code);

    const expiresAt = Date.now() + CODE_EXPIRATION_MS;

    verificationCodes.set(email, {
      code: code_hash,
      expiresAt,
    });

    await transporter.sendMail({
      from: "Ecommerce App NoReply",
      to: email,
      subject: "Verification Code",
      html: `
        <h2>Your verification code</h2>
        <p>This is the code:</p>
        <h1>${code}</h1>
        <p>Expires at 5 minutes</p>
      `,
    });

    return res.status(200).json({
      message: "Verification code send successfully",
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function checkCode(req: Request, res: Response) {
  try {
    validateBody(req.body, false);
    const email = validateEmail(req.body.email);
    const code = validateCode(req.body.code);

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return resError(400, "Code not found or expired");
    }

    if (storedData.expiresAt < Date.now()) {
      verificationCodes.delete(email);
      return resError(400, "Code expired");
    }

    await validatePasswordHash(code, storedData.code);

    verificationCodes.delete(email);

    // llamar a la base de datos para marcar correo como true

    return res.status(200).json({
      message: "Code verified successfully",
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
