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
  validateSku,
} from "../utils/validations";
import { movement_type, genre, Role } from "../types/enums";
import { stock_state_values, waterproofness, waterproofness_values, type stock_state } from "../types/primitives";
import { Product, ProductVariant } from "../types/entities";


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

export async function getAllProductVariants(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);
    const variants = await sql<ProductVariant[]>`
      SELECT * FROM product_variant
      WHERE product_id = ${id}
      AND is_deleted = false
      ORDER BY created_at DESC
    `;
    res.json(variants);
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



export async function getProductById(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const [product] = await sql<Product[]>`
      SELECT * FROM product
      WHERE id = ${id} AND is_deleted = false
      LIMIT 1
    `;

    if (!product) {
      resError(404, "Product not found");
    }

    res.json(product);
  } catch (error) {
    return responseToError(error as Error, res);
  }
}
export async function getVariant(req: Request, res: Response) {
  try {
    const id = validateId(req.params.id);

    const [variant] = await sql<ProductVariant[]>`
      SELECT * FROM product_variant
      WHERE id = ${id} AND is_deleted = false
    `;

    if (variant == null) {
      resError(404, "Variant not found");
    }

    res.json(variant);
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

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const slug = validateSlug(req.params.slug, false);

    const [product] = await sql<Product[]>`
      SELECT * FROM product
      WHERE slug = ${slug} AND is_deleted = false
      LIMIT 1
    `;

    if (!product) {
      resError(404, "Product not found");
    }

    res.json(product);
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

interface SearchResultType {
  query: string | null;
  filters: {
    brand: string | string[] | null;
    category: string | string[] | null;
    color: string | string[] | null;
    clasp: string | string[] | null;
    strapmaterial: string | string[] | null;
    casematerial: string | string[] | null;
    crystalmaterial: string | string[] | null;
    typemovement: string | string[] | null;
    waterproofness: string | string[] | null;
  };
}

/* ===============================
   SEARCH
================================ */
export async function searchProducts(req: Request, res: Response) {
  try {
    const filter: string | null = req.params.filter as string | null;
    const input: string | null = req.params.input as string | null;

    // Simulación de los parámetros que recibe tu backend

    // 1. Decodificar el texto de búsqueda (por los espacios %20)
    const textSearch = input == null || input === 'null' ? null : decodeURIComponent(input);

    if (filter == null || filter === 'null') {
      resError(400, "El formato de la URL de filtros no es válido");
    }
    // 2. Expresión regular mágica basada en tus llaves fijas
    // Captura todo lo que esté entre el nombre de una propiedad y la siguiente
    // Evaluar primero el regex antes de hacer match
    const regex = /brand-(.*?)-category-(.*?)-color-(.*?)-clasp-(.*?)-strapmaterial-(.*?)-casematerial-(.*?)-crystalmaterial-(.*?)-typemovement-(.*?)-waterproofness-(.*)/;
    const isValidateRegex = regex.test(filter as string);

    if (!isValidateRegex) {
      resError(400, "El formato de la URL de filtros no es válido2");
    }

    const matches = filter?.match(regex);

    if (!matches) {
      resError(400, "El formato de la URL de filtros no es válido3");
    }

    // 3. Mapear los grupos capturados (el índice 0 es todo el string, del 1 al 9 son tus filtros)
    const [
      _,
      brand,
      category,
      color,
      clasp,
      strapmaterial,
      casematerial,
      crystalmaterial,
      typemovement,
      waterproofness
    ] = matches;

    // Helper para limpiar los "null" y separar valores múltiples si existen
    const formatValue = ({ value }: { value: string | undefined }) => {
      if (!value || value === 'null') return null;

      // Si detecta guiones intermedios, podrías intentar separarlos en un array.
      // OJO: "rose-gold" se separará en ['rose', 'gold']. 
      // Si esto pasa, lo ideal es que uses comas en el frontend como te sugerí antes.
      return value.includes('-') ? value.split('-') : value;
    };

    // 4. Construir el objeto final de filtros
    const searchFilters: SearchResultType = {
      query: textSearch,
      filters: {
        brand: formatValue({ value: brand }),
        category: formatValue({ value: category }),
        color: formatValue({ value: color }),
        clasp: formatValue({ value: clasp }),
        strapmaterial: formatValue({ value: strapmaterial }),
        casematerial: formatValue({ value: casematerial }),
        crystalmaterial: formatValue({ value: crystalmaterial }),
        typemovement: formatValue({ value: typemovement }),
        waterproofness: formatValue({ value: waterproofness }),
      }
    };

    const result = await queryFilter(searchFilters);

    res.json(result)
  } catch (error) {
    return responseToError(error as Error, res);
  }
}

async function queryFilter(searchResult: SearchResultType) {
  const { filters } = searchResult;

  // 1. Helper para saber si un filtro está vacío (null o array vacío)
  const isNull = (val: unknown) => val === null || (Array.isArray(val) && val.length === 0);

  // 2. Helper para normalizar los datos a Arrays (Postgres los necesita así para el operador = ANY)
  const toArray = (val: SearchResultType['filters'][keyof SearchResultType['filters']]) => {
    if (isNull(val)) return [];
    return Array.isArray(val) ? val : [val];
  };

  // 3. Traducción y preparación de variables
  // Traducir movimiento (ej: 'quartz' -> ['Q'])
  const movementValues = isNull(filters.typemovement)
    ? []
    : toArray(filters.typemovement).map((m) => {
      return movement_type[m as keyof typeof movement_type] || m
    });

  // Waterproofness a Mayúsculas (ej: 'diver' -> ['DIVER'])
  const waterproofValues = isNull(filters.waterproofness)
    ? []
    : toArray(filters.waterproofness).map((w) => {
      if (w && w.toUpperCase() == waterproofness_values[5]) {
        return waterproofness_values[5]
      }
      return w as waterproofness
    });

  // 4. Ejecución de la consulta con tu sintaxis exacta
  const products = await sql`
  SELECT * FROM (
    SELECT DISTINCT ON (p.id) 
        p.*,
        -- Calculamos el puntaje máximo que alcanza este producto entre todas sus variantes
        MAX(
          -- Puntos del Bloque A (Producto Base - Peso 10)
          (CASE WHEN ${isNull(filters.brand)} = false AND b.slug = ANY(${toArray(filters.brand)}) THEN 10 ELSE 0 END) +
          (CASE WHEN ${isNull(filters.typemovement)} = false AND p.movement_type = ANY(${movementValues}) THEN 10 ELSE 0 END) +
          (CASE WHEN ${isNull(filters.waterproofness)} = false AND p.waterproofness = ANY(${waterproofValues}) THEN 10 ELSE 0 END) +
          (CASE WHEN ${isNull(filters.casematerial)} = false AND case_mat.slug = ANY(${toArray(filters.casematerial)}) THEN 10 ELSE 0 END) +
          (CASE WHEN ${isNull(filters.crystalmaterial)} = false AND cryst_mat.slug = ANY(${toArray(filters.crystalmaterial)}) THEN 10 ELSE 0 END) +
          
          -- Puntos del Bloque B (Variantes - Peso 1)
          (CASE WHEN ${isNull(filters.color)} = false AND col.slug = ANY(${toArray(filters.color)}) THEN 1 ELSE 0 END) +
          (CASE WHEN ${isNull(filters.strapmaterial)} = false AND strap_mat.slug = ANY(${toArray(filters.strapmaterial)}) THEN 1 ELSE 0 END) +
          (CASE WHEN ${isNull(filters.clasp)} = false AND cl.slug = ANY(${toArray(filters.clasp)}) THEN 1 ELSE 0 END)
        ) OVER(PARTITION BY p.id) as match_score
    FROM product p
    LEFT JOIN brand b ON p.brand_id = b.id
    LEFT JOIN material case_mat ON p.case_material_id = case_mat.id
    LEFT JOIN material cryst_mat ON p.crystal_material_id = cryst_mat.id
    
    LEFT JOIN product_variant pv ON p.id = pv.product_id AND pv.is_deleted = false
    LEFT JOIN color col ON pv.color_id = col.id
    LEFT JOIN material strap_mat ON pv.strap_material_id = strap_mat.id
    LEFT JOIN clasp cl ON pv.clasp_id = cl.id
    WHERE 
        p.is_deleted = false
        AND (
            -- [BLOQUE A]: Filtros del Producto Base
            (
                (${isNull(filters.brand)} = true OR b.slug = ANY(${toArray(filters.brand)})) AND
                (${isNull(filters.typemovement)} = true OR p.movement_type = ANY(${movementValues})) AND
                (${isNull(filters.waterproofness)} = true OR p.waterproofness = ANY(${waterproofValues})) AND
                (${isNull(filters.casematerial)} = true OR case_mat.slug = ANY(${toArray(filters.casematerial)})) AND
                (${isNull(filters.crystalmaterial)} = true OR cryst_mat.slug = ANY(${toArray(filters.crystalmaterial)}))
            )
            OR
            -- [BLOQUE B]: Filtros de las Variantes (Segundo chance)
            (
                (${isNull(filters.color)} = true OR col.slug = ANY(${toArray(filters.color)})) AND
                (${isNull(filters.strapmaterial)} = true OR strap_mat.slug = ANY(${toArray(filters.strapmaterial)})) AND
                (${isNull(filters.clasp)} = true OR cl.slug = ANY(${toArray(filters.clasp)}))
            )
        )
    -- El orden interno sigue siendo obligatorio para que DISTINCT ON funcione correctamente por variante
    ORDER BY p.id, match_score DESC
  ) AS filtered_products
  -- ¡Aquí ocurre la magia! Ahora ordenamos globalmente todos los productos únicos de mayor a menor puntaje
  ORDER BY match_score DESC;
`;

  return products;
}

export async function checkProductSlug(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    validateBody(req.body, false);
    const slug = validateSlug(req.body.slug, false);

    const allSlugs = await sql<{ slug: string }[]>`SELECT slug FROM product`;

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

    const allSlugs = await sql<{ slug: string }[]>`SELECT slug FROM product`;

    console.log("Existing slugs:", allSlugs);

    if (allSlugs.some(p => p.slug === slug)) {
      resError(400, "Slug already exists");
    }

    const description = validateText(req.body.description, "Description", 10, 1000, true);

    const base_price = validateNumber(req.body.base_price, "Base price", "int", 1, Number.MAX_SAFE_INTEGER);

    const brand_id = validateId(req.body.brand_id, "Brand Id");

    const allBrandIds = await sql<{ id: string }[]>`SELECT id FROM brand`;

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

    const allMaterials = await sql<{ id: string }[]>`SELECT id FROM material`;

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
export async function createVariant(req: Request, res: Response) {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller]);
    validateBody(req.body, false);


    const product_id = validateId(req.params.id, "Product Id");

    const [product] = await sql`
      SELECT * FROM product
      WHERE id = ${product_id} AND is_deleted = false
    `;

    if (product == null) {
      resError(404, "Product not found");
    }

    const price = validateNumber(req.body.price, "Price", "int", 1, Number.MAX_SAFE_INTEGER);

    const allMaterials = await sql<{ id: string }[]>`SELECT id FROM material`;
    const allColors = await sql<{ id: string }[]>`SELECT id FROM color`;
    const allClasps = await sql<{ id: string }[]>`SELECT id FROM clasp`;

    const strap_material_id = validateId(req.body.strap_material_id, "Strap material Id");

    if (!allMaterials.some(m => m.id === strap_material_id)) {
      resError(400, "Strap material ID does not exist");
    }

    const color_id = validateId(req.body.color_id, "Color Id");

    if (!allColors.some(m => m.id === color_id)) {
      resError(400, "Color ID does not exist");
    }
    const clasp_id = validateId(req.body.clasp_id, "Clasp Id");

    if (!allClasps.some(m => m.id === clasp_id)) {
      resError(400, "Clasp ID does not exist");
    }

    const sku = validateSku(req.body.sku, false);

    const user_quantity = validateNumber(req.body.user_quantity, "User quantity", "int", 0, 9999);
    const stock_quantity = validateNumber(req.body.stock_quantity, "Stock quantity", "int", 0, 9999);

    const variantBody: Omit<ProductVariant, "id" | "is_deleted" | "created_at" | "updated_at" | "deleted_at"> = {
      product_id,
      price,
      strap_material_id,
      color_id,
      clasp_id,
      sku,
      image_1: validateUrl(req.body.image_1),
      image_2: validateUrl(req.body.image_2),
      image_3: validateUrl(req.body.image_3),
      stock_quantity,
      user_quantity
    }

    const newVariant = await sql`
      INSERT INTO product_variant (
        product_id,
        price,
        strap_material_id,
        color_id,
        clasp_id,
        sku,
        user_quantity,
        stock_quantity,
        image_1,
        image_2,
        image_3,
        created_at,
        updated_at
      )
      VALUES (
        ${variantBody.product_id},
        ${variantBody.price},
        ${variantBody.strap_material_id},
        ${variantBody.color_id},
        ${variantBody.clasp_id},
        ${variantBody.sku},
        ${variantBody.user_quantity},
        ${variantBody.stock_quantity},
        ${variantBody.image_1},
        ${variantBody.image_2},
        ${variantBody.image_3},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    if (newVariant.length === 0) {
      resError(500, "Error creating variant");
    }

    res.status(201).json(newVariant[0]);
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

    const allBrandIds = await sql<{ id: string }[]>`SELECT id FROM brand`;

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

    const allMaterials = await sql<{ id: string }[]>`SELECT id FROM material`;

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