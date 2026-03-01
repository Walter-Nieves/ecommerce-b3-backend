import dotenv from "dotenv";
import { Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import uuid from "uuid";
import { Role } from "../types/enums";

dotenv.config();

const SECRET: string = process.env.JWT_SECRET as string;

export function resError(code: number, message: string): never {
  throw new Error(JSON.stringify({ code, message }));
}

export function responseToError(error: Error, res: Response): Response {
  console.error(error);
  if (error.message.startsWith("{")) {
    const {
      code,
      message,
    }: {
      code: number;
      message: string;
    } = JSON.parse(error.message);
    return res.status(code).json({ message });
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

export function validateBody(
  body: unknown,
  wouldBeArray: boolean,
): void | never {
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

export function validateRole(
  role: unknown,
  expectedRole: Role[],
): Role | never {
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

export function validateDate(date: unknown, isFuture: boolean): string | never {
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

export function validateHexCode(hex_code: unknown): string | never {
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

  // Valid UUID v4
  const uuidV4Valid = uuid.validate(id);

  if (!uuidV4Valid) {
    resError(400, "Invalid UUID format");
  }

  return id;
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>?/gm, "") // elimina etiquetas HTML
    .replace(/\s+/g, " ") // elimina doble espacio
    .normalize("NFC"); //mantiene acentos correctamente
}

export function validateName(name: unknown): string | never {
  if (name == null) {
    resError(400, "Name is required");
  }

  if (typeof name !== "string") {
    resError(400, "Name must be a string");
  }

  const trimmedName = sanitizeInput(name);

  if (trimmedName.length < 2) {
    resError(400, "Name must be at least 2 characters long");
  }

  if (trimmedName.length > 20) {
    resError(400, "Name cannot exceed 20 characters");
  }

  // los nombres si tienen caracteres especiales

  if (!/^[\p{L}\p{N}\s\-\(\)\.,&]+$/u.test(trimmedName)) {
    resError(400, "Name contains invalid characters");
  }

  return trimmedName;
}

export function validateSlug(slug: unknown, esIndividual: boolean): string | never {
  if (slug == null) {
    resError(400, "Slug is required");
  }

  if (typeof slug !== "string") {
    resError(400, "Slug must be a string");
  }

  const normalizedSlug = slug
    .trim()
    .toLowerCase()
    .normalize("NFD") // elimina acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina los acentos separados
    .replace(/[^a-z0-9\s-]/g, "") // elimina caracteres raros
    .replace(/\s+/g, "-") // espacios a "-""
    .replace(/-+/g, "-") // evita mas de un "-" seguido
    .replace(/^-|-$/g, ""); // quita - al inicio o final

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
    resError(400, "Invalid slug format");
  }
  if (normalizedSlug.length === 0) {
  resError(400, "Slug cannot be empty after normalization");
  }
  if (esIndividual) {
    if (normalizedSlug.length < 2) {
      resError(400, "Slug must be at least 2 characters long");
    }
    if (normalizedSlug.length > 20) {
      resError(400, "Slug cannot exceed 20 characters");
    }
  } else {
    if (normalizedSlug.length < 30) {
      resError(400, "Slug must be at least 30 characters long");
    }
    if (normalizedSlug.length > 100) {
      resError(400, "Slug cannot exceed 100 characters");
    }
  }

  return normalizedSlug;
}

export function validateSku(sku: unknown, esIndividual: boolean): string | never {
  if (sku == null) {
    resError(400, "SKU is required");
  }

  if (typeof sku !== "string") {
    resError(400, "SKU must be a string");
  }

  let trimmedSku: string;

  if (esIndividual) {
    trimmedSku = sku
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
  } else {
    trimmedSku = sku
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\s+/g, "-") // espacio a "-""
      .replace(/-+/g, "-") // evita -- dobles
      .replace(/^-|-$/g, ""); // quita - al inicio o final
  }

  if (esIndividual) {
    if (trimmedSku.length < 1) {
      resError(400, "SKU must be at least 1 characters long");
    }
    if (trimmedSku.length > 3) {
      resError(400, "SKU cannot exceed 3 characters");
    }
  } else {
    if (trimmedSku.length < 10) {
      resError(400, "SKU must be at least 10 characters long");
    }
    if (trimmedSku.length > 50) {
      resError(400, "SKU cannot exceed 50 characters");
    }
  }
  
  if (!/^[A-Z0-9-]+$/.test(trimmedSku)) {
    resError(400, "Invalid SKU format");
  }
  return trimmedSku;
}

export function validateUrl(url: unknown): void | never {
  if (url == null) {
    resError(400, "URL is required");
  }
  if (typeof url !== "string") {
    resError(400, "URL must be a string");
  }
  try {
    new URL(url);
  } catch (error) {
    resError(400, "Invalid URL format");
  }
}

export function validateNumber(number: unknown, type: "int" | "float", from: number, to: number): number | never {
  if (number == null) {
    resError(400, "Number is required");
  }
  if (typeof number !== "number") {
    resError(400, "Value must be a number");
  }
  if (type === "int" && !Number.isInteger(number)) {
    resError(400, "Value must be an integer");
  }
  if (type === "float" && Number.isInteger(number)) {
    resError(400, "Value must be a float");
  }
  if (number < from || number > to) {
    resError(400, `Number must be between ${from} and ${to}`);
  }
  return number;
}