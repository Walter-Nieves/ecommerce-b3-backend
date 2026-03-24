
import { Request, Response } from "express";
import { sql } from "../db/supabase";
import {
  responseToError,
  validateId,
  validateName,
  validateSlug,
  validateBody,
  resError
} from "../utils/validations";
import  { movement_type, genre  } from "../types/enums";
import  { stock_state } from "../types/primitives";

type ProductBody = {
  name: string;
  slug: string;
  description: string;
  base_price: number;
  brand_id: string;
  genre: genre;
  movement_type: movement_type;
  waterproofness: string;
  case_material_id: string;
  crystal_material_id: string;
  stock_state: stock_state;
};

/* ===============================
   GET ALL (active)
================================ */
export async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await sql`
      SELECT * FROM product
      WHERE is_deleted = false
      ORDER BY created_at DESC
    `;
    res.json(products);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   GET ALL (deleted)
================================ */
export async function getDeletedProducts(req: Request, res: Response) {
  try {
    const products = await sql`
      SELECT * FROM product
      WHERE is_deleted = true
      ORDER BY deleted_at DESC
    `;
    res.json(products);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   GET BY ID (active)
================================ */
export async function getProductById(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const product = await sql`
      SELECT * FROM product
      WHERE id = ${id} AND is_deleted = false
    `;

    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   GET BY ID (deleted)
================================ */
export async function getDeletedProductById(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const product = await sql`
      SELECT * FROM product
      WHERE id = ${id} AND is_deleted = true
    `;

    if (product.length === 0) {
      return res.status(404).json({ error: "Deleted product not found" });
    }

    res.json(product[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   SEARCH
================================ */
export async function searchProducts(req: Request, res: Response) {
  try {
    const {
      brand,
      category,
      color,
      clasp,
      strapmaterials,
      casematerials,
      crystalmaterials,
      typemovements,
      waterproofness
    } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];

    const addFilter = (field: string, queryValue?: string) => {
      if (queryValue) {
        const items = queryValue.split("-");
        values.push(items);
        conditions.push(`${field} = ANY($${values.length})`);
      }
    };

    addFilter("b.slug", brand as string);
    addFilter("c.slug", category as string);
    addFilter("co.slug", color as string);
    addFilter("cl.slug", clasp as string);
    addFilter("sm.slug", strapmaterials as string);
    addFilter("cm.slug", casematerials as string);
    addFilter("cr.slug", crystalmaterials as string);
    addFilter("tm.slug", typemovements as string);
    addFilter("wp.name", waterproofness as string);

    const whereClause =
      conditions.length > 0
        ? "AND " + conditions.join(" AND ")
        : "";

    const query = `
      SELECT p.*
      FROM product p
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN category c ON p.category_id = c.id
      LEFT JOIN color co ON p.color_id = co.id
      LEFT JOIN clasp cl ON p.clasp_id = cl.id
      LEFT JOIN material sm ON p.strap_material_id = sm.id
      LEFT JOIN material cm ON p.case_material_id = cm.id
      LEFT JOIN material cr ON p.crystal_material_id = cr.id
      LEFT JOIN movement_type tm ON p.movement_type = tm.slug
      LEFT JOIN waterproofness wp ON p.waterproofness = wp.name
      WHERE p.is_deleted = false
      ${whereClause}
      ORDER BY p.created_at DESC
    `;

    const result = await sql.unsafe(query, values);

    res.json(result);

  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   CREATE
================================ */
export async function createProduct(req: Request, res: Response) {
  try {
    validateBody(req.body, false);

    const {
      name,
      slug,
      description,
      base_price,
      brand_id,
      genre:genreValue,
      movement_type:movementValue,
      waterproofness,
      case_material_id,
      crystal_material_id,
      stock_state:stockValue,
    } = req.body as ProductBody;

    const validatedName = validateName(name);
    const validatedSlug = validateSlug(slug, false);

    if (typeof description !== "string") {
      resError(400, "Description must be a string");
    }

    if (!Number.isInteger(base_price) || base_price <= 0) {
      resError(400, "Base price must be a positive integer");
    }

    if (typeof brand_id !== "string") {
      resError(400, "Brand ID must be a UUID string");
    }

    if (typeof case_material_id !== "string") {
      resError(400, "Case material ID must be a UUID string");
    }

    if (typeof crystal_material_id !== "string") {
      resError(400, "Crystal material ID must be a UUID string");
    }

   if (!Object.values(genre).includes(genreValue)) {
  resError(400, "Invalid genre");
}

if (!Object.values(movement_type).includes(movementValue)) {
  resError(400, "Invalid movement type");
}

const validStockStates = ["in_stock", "out_of_stock", "pre_order"];

if (!validStockStates.includes(stockValue)) {
  resError(400, "Invalid stock state");
}

    const newProduct = await sql`
      INSERT INTO product (
        name,
        slug,
        description,
        base_price,
        brand_id,
        genre,
        movement_type,
        waterproofness,
        case_material_id,
        crystal_material_id,
        stock_state
      )
      VALUES (
        ${validatedName},
        ${validatedSlug},
        ${description},
        ${base_price},
        ${brand_id},
        ${genreValue},
        ${movementValue},
        ${waterproofness},
        ${case_material_id},
        ${crystal_material_id},
        ${stockValue}
      )
      RETURNING *
    `;

    res.status(201).json(newProduct[0]);

  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   UPDATE
================================ */
export async function updateProduct(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    validateBody(req.body, false);

  const {
      name,
      slug,
      description,
      base_price,
      brand_id,
      genre:genreValue,
      movement_type:movementValue,
      waterproofness,
      case_material_id,
      crystal_material_id,
      stock_state:stockValue,
    } = req.body as ProductBody;

    const validatedName = validateName(name);
    const validatedSlug = validateSlug(slug, false);

    if (typeof description !== "string") {
      resError(400, "Description must be a string");
    }

    if (!Number.isInteger(base_price) || base_price <= 0) {
      resError(400, "Base price must be a positive integer");
    }

    if (typeof brand_id !== "string") {
      resError(400, "Brand ID must be a UUID string");
    }

    if (typeof case_material_id !== "string") {
      resError(400, "Case material ID must be a UUID string");
    }

    if (typeof crystal_material_id !== "string") {
      resError(400, "Crystal material ID must be a UUID string");
    }

    
   if (!Object.values(genre).includes(genreValue)) {
  resError(400, "Invalid genre");
}

if (!Object.values(movement_type).includes(movementValue)) {
  resError(400, "Invalid movement type");
}

const validStockStates = ["in_stock", "out_of_stock", "pre_order"];

if (!validStockStates.includes(stockValue)) {
  resError(400, "Invalid stock state");
}

    const updated = await sql`
      UPDATE product
      SET
        name = ${validatedName},
        slug = ${validatedSlug},
        description = ${description},
        base_price = ${base_price},
        brand_id = ${brand_id},
        genre = ${genreValue},
        movement_type = ${movementValue},
        waterproofness = ${waterproofness},
        case_material_id = ${case_material_id},
        crystal_material_id = ${crystal_material_id},
        stock_state = ${stockValue},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updated[0]);

  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   SOFT DELETE
================================ */
export async function softDeleteProduct(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    await sql`
      UPDATE product
      SET is_deleted = true, deleted_at = NOW()
      WHERE id = ${id}
    `;

    res.json({ message: "Product soft deleted" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   FORCE DELETE
================================ */
export async function forceDeleteProduct(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    await sql`
      DELETE FROM product
      WHERE id = ${id}
    `;

    res.json({ message: "Product permanently deleted" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   RESTORE
================================ */
export async function restoreProduct(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    await sql`
      UPDATE product
      SET is_deleted = false, deleted_at = NULL
      WHERE id = ${id}
    `;

    res.json({ message: "Product restored" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}