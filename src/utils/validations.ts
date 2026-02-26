import { Response } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
dotenv.config();

const SECRET: string = process.env.JWT_SECRET as string;

export function resError(code: number, message: string): never {
  throw new Error(JSON.stringify({ code, message }));
}

export function responseToError(error: Error, res: Response): Response {
  console.error(error);
  if (error.message.startsWith("{")) {
    const { code, message }: {
      code: number;
      message: string;
    } = JSON.parse(error.message)
    return res.status(code).json({message})
  }
  return res.status(500).json({ message: "Internal Server Error" });
}

export function validateToken(token: string): JwtPayload | never {
  try {
    const payload = jwt.verify(token, SECRET) as JwtPayload;
    return payload;
  } catch (error) {
    resError(401, "Invalid or expired token");
  }
}

export function validateBody (body: unknown, wouldBeArray: boolean): void | never {
  if (body == null) {
    resError(400, "Request body is required");
  }
  if (typeof body !== "object") {
    resError(400, "Request body is not a valid JSON object");
  }
  if (wouldBeArray && !Array.isArray(body)) {
    resError(400, "Request body should be an array");
  }
  if (!wouldBeArray && Array.isArray(body)) {
    resError(400, "Request body should be an object, not an array");
  }
}

export function validateRole (role: unknown, expectedRole: Role[]): Role | never {
  if (role == null) {
    resError(400, "Role is required");
  }
  if (!Object.values(Role).includes(role as Role)) {
    resError(400, "Invalid role");
  }
  if (!expectedRole.includes(role as Role)) {
    resError(400, "Role not allowed for this action");
  }
  return role as Role;
}

export function validateDate (date: unknown, isFuture: boolean): string | never {
  if (date == null) {
    resError(400, "Date is required");
  }
  if (typeof date !== "string" || isNaN(Date.parse(date))) {
    resError(400, "Invalid date format");
  }
  if (new Date(date) > new Date() && !isFuture) {
    resError(400, "Date cannot be in the future");
  }
  if (new Date(date) < new Date() && isFuture) {
    resError(400, "Date cannot be in the past");
  }
  return date;
}

export function validateHexCode (hex_code: unknown): string | never {
  if (hex_code == null) {
    resError(400, "Hex code is required");
  }
  if (typeof hex_code !== "string" || !/^#?[0-9A-Fa-f]{6}$/.test(hex_code)) { 
    resError(400, "Invalid hex code format");
  }
  return hex_code.startsWith("#") ? hex_code.substring(1) : hex_code;
}

export function validateId(id: unknown): string | never {
  if (id == null) {
    resError(400, "Id is required");
  }

  if (typeof id !== "string") {
    resError(400, "Id must be a string");
  }

  // Regex UUID v4
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    resError(400, "Invalid UUID format");
  }

  return id;
}