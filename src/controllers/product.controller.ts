import { Request, Response } from "express";
import { sql } from "../db/supabase";
import {
  responseToError,
  validateId,
  validateName,
  validateSlug,
  validateBody,
  resError,
  validateRoleForActions,
  validateText,
  validateNumber,
  validateUrl,
} from "../utils/validations";
import { movement_type, genre, Role } from "../types/enums";
import { stock_state_values, waterproofness, waterproofness_values, type stock_state } from "../types/primitives";
import { Product } from "../types/entities";

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
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
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
      resError(404, "Product not found");
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
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    const product = await sql`
      SELECT * FROM product
      WHERE id = ${id} AND is_deleted = true
    `;

    if (product.length === 0) {
      resError(404, "Delete Product not found");
    }

    res.json(product[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
/* ===============================
   GET BY SLUG (active)
================================ */
export async function getProductBySlug(req: Request, res: Response) {
  try {
    const slug = validateSlug(req.params.slug, false);

    const product = await sql`
      SELECT * FROM product
      WHERE slug = ${slug} AND is_deleted = false
    `;

    if (product.length === 0) {
      resError(404, "Product not found");
    }

    res.json(product[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   GET BY SLUG (deleted)
================================ */
export async function getDeletedProductBySlug(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const slug = validateSlug(req.params.slug, false);

    const product = await sql`
      SELECT * FROM product
      WHERE slug = ${slug} AND is_deleted = true
    `;
    console.log("Queried product:", product);

    if (product.length === 0) {
      resError(404, "Delete Product not found");
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
    const { filter, input } = req.params;

    // brand-null-category-null-color-null-clasp-null-strapmaterial-null-casematerial-null-crystalmaterial-null-typemovement-null-waterproofness-null/null


    const condition_for_products: {[key: string]: string[]} = {
      brand: [],
      category: []
    };
    const condition_for_variant_products: string[] = [];

    res.send([])
//     const conditions: string[] = [];
//     const values: any[] = [];

//     const addFilter = (field: string, queryValue?: string) => {
//       if (queryValue) {
//         const items = queryValue.split("-");
//         values.push(items);
//         conditions.push(`${field} = ANY($${values.length})`);
//       }
//     };

//     addFilter("b.slug", brand as string);
//     addFilter("c.slug", category as string);
//     addFilter("co.slug", color as string);
//     addFilter("cl.slug", clasp as string);
//     addFilter("sm.slug", strapmaterials as string);
//     addFilter("cm.slug", casematerials as string);
//     addFilter("cr.slug", crystalmaterials as string);
//     addFilter("tm.slug", typemovements as string);
//     addFilter("wp.name", waterproofness as string);

//     const whereClause =
//       conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

//     const query = `
//       SELECT p.*
//       FROM product p
//       LEFT JOIN brand b ON p.brand_id = b.id
//       LEFT JOIN category c ON p.category_id = c.id
//       LEFT JOIN color co ON p.color_id = co.id
//       LEFT JOIN clasp cl ON p.clasp_id = cl.id
//       LEFT JOIN material sm ON p.strap_material_id = sm.id
//       LEFT JOIN material cm ON p.case_material_id = cm.id
//       LEFT JOIN material cr ON p.crystal_material_id = cr.id
//       LEFT JOIN movement_type tm ON p.movement_type = tm.slug
//       LEFT JOIN waterproofness wp ON p.waterproofness = wp.name
//       WHERE p.is_deleted = false
//       ${whereClause}
//       ORDER BY p.created_at DESC
//     `;

//     const result = await sql.unsafe(query, values);

//     res.json(result);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function checkProductSlug(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    validateBody(req.body, false);
    const slug = validateSlug(req.body.slug, false);

    const allSlugs = await sql<{slug: string}[]>`SELECT slug FROM product`;

    console.log("Existing slugs:", allSlugs);

    if (allSlugs.some(p => p.slug === slug)) {
      resError(400, "Slug already exists");
    }
    res.status(200).json({ message: "Slug is available" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

/* ===============================
   CREATE
================================ */
export async function createProduct(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    validateBody(req.body, false);

    const name = validateName(req.body.name, true);
    const slug = validateSlug(req.body.slug, false);

    const allSlugs = await sql<{slug: string}[]>`SELECT slug FROM product`;

    console.log("Existing slugs:", allSlugs);

    if (allSlugs.some(p => p.slug === slug)) {
      resError(400, "Slug already exists");
    }

    const description = validateText(req.body.description, "Description", 10, 1000, true);

    const base_price = validateNumber(req.body.base_price, "Base price", "int", 1, Number.MAX_SAFE_INTEGER);

    const brand_id = validateId(req.body.brand_id, "Brand Id");

    const allBrandIds = await sql<{id: string}[]>`SELECT id FROM brand`;

    if (!allBrandIds.some(b => b.id === brand_id)) {
      resError(400, "Brand ID does not exist");
    }

    const genreValue = req.body.genre;

    if (!Object.values(genre).includes(genreValue)) {
      resError(400, "Invalid genre");
    }

    const movementTypeValue = req.body.movement_type;

    if (!Object.values(movement_type).includes(movementTypeValue)) {
      resError(400, "Invalid movement type");
    }

    const waterproofness: waterproofness = req.body.waterproofness;

    if (!waterproofness_values.includes(waterproofness)) {
      resError(400, "Invalid waterproofness value");
    }

    const allMaterials = await sql<{id: string}[]>`SELECT id FROM material`;

    const case_material_id = validateId(req.body.case_material_id, "Case material Id");

    if (!allMaterials.some(m => m.id === case_material_id)) {
      resError(400, "Case material ID does not exist");
    }

    const crystal_material_id = validateId(req.body.crystal_material_id, "Crystal material Id");

    if (!allMaterials.some(m => m.id === crystal_material_id)) {
      resError(400, "Crystal material ID does not exist");
    }

    const productBody: Omit<Product, "id" | "is_deleted" | "stock_state" | "created_at" | "updated_at"> = {
      name,
      slug,
      description,
      base_price,
      brand_id,
      genre: genreValue,
      movement_type: movementTypeValue,
      waterproofness,
      case_material_id,
      crystal_material_id
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
        created_at,
        updated_at
      )
      VALUES (
        ${productBody.name},
        ${productBody.slug},
        ${productBody.description},
        ${productBody.base_price},
        ${productBody.brand_id},
        ${productBody.genre},
        ${productBody.movement_type},
        ${productBody.waterproofness},
        ${productBody.case_material_id},
        ${productBody.crystal_material_id},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    if (newProduct.length === 0) {
      resError(500, "Error creating product");
    }

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
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    validateBody(req.body, false);

    const name = validateName(req.body.name, true);

    const description = validateText(req.body.description, "Description", 10, 1000, true);

    const base_price = validateNumber(req.body.base_price, "Base price", "int", 1, Number.MAX_SAFE_INTEGER);

    const brand_id = validateId(req.body.brand_id, "Brand Id");

    const allBrandIds = await sql<{id: string}[]>`SELECT id FROM brand`;

    if (!allBrandIds.some(b => b.id === brand_id)) {
      resError(400, "Brand ID does not exist");
    }

    const genreValue = req.body.genre;

    if (!Object.values(genre).includes(genreValue)) {
      resError(400, "Invalid genre");
    }

    const movementTypeValue = req.body.movement_type;

    if (!Object.values(movement_type).includes(movementTypeValue)) {
      resError(400, "Invalid movement type");
    }

    const waterproofness: waterproofness = req.body.waterproofness;

    if (!waterproofness_values.includes(waterproofness)) {
      resError(400, "Invalid waterproofness value");
    }

    const allMaterials = await sql<{id: string}[]>`SELECT id FROM material`;

    const case_material_id = validateId(req.body.case_material_id, "Case material Id");

    if (!allMaterials.some(m => m.id === case_material_id)) {
      resError(400, "Case material ID does not exist");
    }

    const crystal_material_id = validateId(req.body.crystal_material_id, "Crystal material Id");

    if (!allMaterials.some(m => m.id === crystal_material_id)) {
      resError(400, "Crystal material ID does not exist");
    }

    const stock_state = req.body.stock_state as stock_state;

    if (!stock_state_values.includes(stock_state)) {
      resError(400, "Invalid stock state");
    }

    const productBody: Omit<Product, "id" | "is_deleted" | "slug" | "created_at" | "updated_at"> = {
      name,
      description,
      base_price,
      brand_id,
      genre: genreValue,
      movement_type: movementTypeValue,
      waterproofness,
      case_material_id,
      crystal_material_id,
      stock_state
    }

    const updated = await sql`
      UPDATE product
      SET
        name = ${productBody.name},
        description = ${productBody.description},
        base_price = ${productBody.base_price},
        brand_id = ${productBody.brand_id},
        genre = ${productBody.genre},
        movement_type = ${productBody.movement_type},
        waterproofness = ${productBody.waterproofness},
        case_material_id = ${productBody.case_material_id},
        crystal_material_id = ${productBody.crystal_material_id},
        stock_state = ${productBody.stock_state},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      resError(404, "Product not found");
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
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    const result = await sql`
      UPDATE product
      SET is_deleted = true, deleted_at = NOW()
      WHERE id = ${id}
    `;

    if (result.count === 0) {
      resError(404, "Product not found");
    }

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
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    const result = await sql`
      DELETE FROM product
      WHERE id = ${id}
    `;

    if (result.count === 0) {
      resError(404, "Product not found");
    }


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
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);

    const result = await sql`
      UPDATE product
      SET is_deleted = false, deleted_at = NULL
      WHERE id = ${id}
    `;

    if (result.count === 0) {
      resError(404, "Product not found");
    }

    res.json({ message: "Product restored" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function uploadProductImage(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    validateBody(req.body, false);
    const posibleImage = validateUrl(req.body.imageUrl);
    if (!posibleImage) {
      resError(400, "Image upload failed");
    } else {
      return res.status(200).json({ imageUrl: posibleImage });
    }
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

export async function updateImageProduct(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    const id = validateId(req.params.id);
    validateBody(req.body, true);
    console.log(req.body);
    const posibleImages = (req.body as string[]).map((url: string) => validateUrl(url));
    console.log(posibleImages);
    const result = await sql`
      UPDATE product
      SET 
        image_1 = ${posibleImages[0] || null},
        image_2 = ${posibleImages[1] || null},
        image_3 = ${posibleImages[2] || null},
        image_4 = ${posibleImages[3] || null},
        image_5 = ${posibleImages[4] || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      resError(404, "Product not found");
    }
    res.json(result[0]);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}