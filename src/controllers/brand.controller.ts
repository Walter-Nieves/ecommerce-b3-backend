import { Request, Response } from "express";
import { sql } from "../db/supabase";
import {
  responseToError,
  validateId,
  resError,
  validateName,
  validateSku,
  validateSlug,
  validateBody,
  validateUrl,
} from "../utils/validations";
import { Brand } from "../types/primitives";

export async function getAllBrands(req: Request, res: Response) {
  try {
    const brands = await sql`
      SELECT * FROM brand
      WHERE is_deleted = false
      ORDER BY name
    `;
    res.json(brands);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function getAllDeletedBrands(req: Request, res: Response) {
  try {
    const brands = await sql`
      SELECT * FROM brand
      WHERE is_deleted = true
      ORDER BY name
    `;
    res.json(brands);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function getBrandById(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const brands = await sql`
      SELECT * FROM brand
      WHERE id = ${id}
      LIMIT 1
    `;

    if (brands.length === 0) {
      resError(404, "Brand not found");
    }

    res.json(brands[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function createBrand(req: Request, res: Response) {
  try {
    validateBody(req.body, false);
    const brand: Brand = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
      sku: validateSku(req.body.sku, true),
      logo_url: validateUrl(req.body.imageUrl),
    };

    const newBrand = await sql`
      INSERT INTO brand (name, slug, sku, logo_url)
      VALUES (${brand.name}, ${brand.slug}, ${brand.sku}, ${brand.logo_url ?? null})
      RETURNING *
    `;

    res.status(201).json(newBrand[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function updateBrand(req: Request, res: Response) {
  try {
    validateBody(req.body, false);
    const id = validateId(req.params.id);
    const brand: Brand = {
      name: validateName(req.body.name),
      slug: validateSlug(req.body.slug, true),
      sku: validateSku(req.body.sku, true),
      logo_url: validateUrl(req.body.imageUrl),
    };
    const updatedBrand = await sql`
      UPDATE brand
      SET name = ${brand.name},
          slug = ${brand.slug},
          sku = ${brand.sku},
          logo_url = ${brand.logo_url ?? null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedBrand.length === 0) {
      resError(404, "Brand not found");
    }

    res.json(updatedBrand[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function softDeleteBrand(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const deletedBrand = await sql`
      UPDATE brand
      SET is_deleted = true
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedBrand.length === 0) {
      resError(404, "Brand not found");
    }

    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function forceDeleteBrand(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const deletedBrand = await sql`
      DELETE FROM brand
      WHERE id = ${id}
      RETURNING *
    `;

    if (deletedBrand.length === 0) {
      resError(404, "Brand not found");
    }

    res.json({ message: "Brand permanently deleted successfully" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function restoreBrand(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const restoredBrand = await sql`
      UPDATE brand
      SET is_deleted = false
      WHERE id = ${id}
      RETURNING *
    `;

    if (restoredBrand.length === 0) {
      resError(404, "Brand not found");
    }

    res.json({ message: "Brand restored successfully" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
