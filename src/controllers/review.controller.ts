import { Request, Response } from "express";
import { sql } from "../db/supabase";
import { Role } from "../types/enums";
import { rating } from "../types/primitives";
import { ReviewWithUser } from "../types/entities";
import {
  resError,
  responseToError,
  validateBody,
  validateId,
  validateRoleForActions,
} from "../utils/validations";

type ReviewRow = {
  product_id: string;
  user_id: string;
  rating: rating | null;
  comment: string | null;
  created_at: string | Date;
  first_name?: string;
  last_name?: string;
};

function mapReview(row: ReviewRow): ReviewWithUser {
  return {
    product_id: row.product_id,
    user_id: row.user_id,
    rating: row.rating as rating,
    comment: row.comment ,
    created_at: new Date(row.created_at),
    user_name: `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "Usuario",
  };
}

function canManageReview(currentRole: Role, currentUserId: string | undefined, ownerId: string) {
  if (currentRole === Role.Admin) return true;
  return currentUserId === ownerId;
}

function validateRating(value: unknown): rating {
  const rating = Number(value);
  if (![1, 2, 3, 4, 5].includes(rating)) {
    resError(400, "Rating must be between 1 and 5");
  }
  return rating as rating;
}

/**
 * GET /api/reviews/all
 * Admin y Seller: todas
 * Buyer: solo las propias
 */
export const getAllReviews = async (_: Request, res: Response): Promise<Response> => {
  try {
    const { role, sub } = res.locals.user as { role: Role; sub?: string };

    let reviews: ReviewRow[] = [];

    if (role === Role.Admin || role === Role.Seller) {
      reviews = await sql<ReviewRow[]>`
        SELECT
          r.product_id,
          r.user_id,
          r.rating,
          r.comment,
          r.created_at,
          u.first_name,
          u.last_name
        FROM review r
        INNER JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC
      `;
    } else {
      const userId = validateId(sub, "User id");
      reviews = await sql<ReviewRow[]>`
        SELECT
          r.product_id,
          r.user_id,
          r.rating,
          r.comment,
          r.created_at,
          u.first_name,
          u.last_name
        FROM review r
        INNER JOIN users u ON u.id = r.user_id
        WHERE r.user_id = ${userId}
        ORDER BY r.created_at DESC
      `;
    }

    return res.status(200).json(reviews.map(mapReview));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

/**
 * GET /api/reviews/product/:productId
 * Público: todas las reseñas de un producto
 */
export const getReviewsByProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
): Promise<Response> => {
  try {
    const productId = validateId(req.params.productId, "Product id");

    const reviews = await sql<ReviewRow[]>`
      SELECT
        r.product_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name,
        u.last_name
      FROM review r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ${productId}
      ORDER BY r.created_at DESC
    `;

    return res.status(200).json(reviews.map(mapReview));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

/**
 * GET /api/reviews/product/:productId/user/:userId
 * Admin: cualquiera
 * Seller/Buyer: solo la suya
 */
export const getReviewByProductAndUser = async (
  req: Request<{ productId: string; userId: string }>,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);

    const productId = validateId(req.params.productId, "Product id");
    const userId = validateId(req.params.userId, "User id");
    const currentUser = res.locals.user as { role: Role; sub?: string };

    if (!canManageReview(currentUser.role, currentUser.sub, userId)) {
      resError(403, "You do not have permission to view this review");
    }

    const [review] = await sql<ReviewRow[]>`
      SELECT
        r.product_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name,
        u.last_name
      FROM review r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ${productId}
      AND r.user_id = ${userId}
      LIMIT 1
    `;

    if (!review) {
      resError(404, "Review not found");
    }

    return res.status(200).json(mapReview(review));
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

/**
 * POST /api/reviews
 * Crea una reseña única por product_id + user_id
 * Buyer, Seller, Admin pueden crear la propia
 */
export const createReview = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);
    validateBody(req.body, false);

    const currentUser = res.locals.user as { role: Role; sub?: string };
    const userId = validateId(currentUser.sub, "User id");
    const productId = validateId(req.body.product_id, "Product id");
    const rating = validateRating(req.body.rating);

    const comment =
      req.body.comment == null || String(req.body.comment).trim() === ""
        ? null
        : String(req.body.comment).trim();

    const [product] = await sql<{ id: string }[]>`
      SELECT id
      FROM product
      WHERE id = ${productId}
      AND is_deleted = false
      LIMIT 1
    `;

    if (!product) {
      resError(404, "Product not found");
    }

    const [existing] = await sql<{ product_id: string; user_id: string }[]>`
      SELECT product_id, user_id
      FROM review
      WHERE product_id = ${productId}
      AND user_id = ${userId}
      LIMIT 1
    `;

    if (existing) {
      resError(409, "You already have a review for this product");
    }

    const [newReview] = await sql<ReviewRow[]>`
      INSERT INTO review (
        product_id,
        user_id,
        rating,
        comment,
        created_at
      )
      VALUES (
        ${productId},
        ${userId},
        ${rating},
        ${comment},
        CURRENT_DATE
      )
      RETURNING product_id, user_id, rating, comment, created_at
    `;

    if (!newReview) {
      resError(500, "Review creation failed");
    }

    const [user] = await sql<{ first_name: string; last_name: string }[]>`
      SELECT first_name, last_name
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    return res.status(201).json({
      ...mapReview({
        ...newReview,
        first_name: user?.first_name,
        last_name: user?.last_name,
      }),
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

/**
 * PUT /api/reviews/product/:productId/user/:userId
 * Admin: cualquiera
 * Seller/Buyer: solo la suya
 */
export const updateReview = async (
  req: Request<{ productId: string; userId: string }>,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);
    validateBody(req.body, false);

    const currentUser = res.locals.user as { role: Role; sub?: string };
    const productId = validateId(req.params.productId, "Product id");
    const userId = validateId(req.params.userId, "User id");

    if (!canManageReview(currentUser.role, currentUser.sub, userId)) {
      resError(403, "You do not have permission to update this review");
    }

    const [existingReview] = await sql<ReviewRow[]>`
      SELECT *
      FROM review
      WHERE product_id = ${productId}
      AND user_id = ${userId}
      LIMIT 1
    `;

    if (!existingReview) {
      resError(404, "Review not found");
    }

    const rating =
      req.body.rating != null ? validateRating(req.body.rating) : existingReview.rating;
    const comment =
      req.body.comment === undefined
        ? existingReview.comment
        : req.body.comment == null || String(req.body.comment).trim() === ""
          ? null
          : String(req.body.comment).trim();

    const [updatedReview] = await sql<ReviewRow[]>`
      UPDATE review
      SET
        rating = ${rating},
        comment = ${comment}
      WHERE product_id = ${productId}
      AND user_id = ${userId}
      RETURNING product_id, user_id, rating, comment, created_at
    `;

    if (!updatedReview) {
      resError(500, "Review update failed");
    }

    const [user] = await sql<{ first_name: string; last_name: string }[]>`
      SELECT first_name, last_name
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    return res.status(200).json({
      ...mapReview({
        ...updatedReview,
        first_name: user?.first_name,
        last_name: user?.last_name,
      }),
    });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};

/**
 * DELETE /api/reviews/product/:productId/user/:userId
 * Admin: cualquiera
 * Seller/Buyer: solo la suya
 * Delete físico, porque la tabla review no tiene soft delete
 */
export const deleteReview = async (
  req: Request<{ productId: string; userId: string }>,
  res: Response,
): Promise<Response> => {
  try {
    validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);

    const currentUser = res.locals.user as { role: Role; sub?: string };
    const productId = validateId(req.params.productId, "Product id");
    const userId = validateId(req.params.userId, "User id");

    if (!canManageReview(currentUser.role, currentUser.sub, userId)) {
      resError(403, "You do not have permission to delete this review");
    }

    const result = await sql`
      DELETE FROM review
      WHERE product_id = ${productId}
      AND user_id = ${userId}
    `;

    if (result.count === 0) {
      resError(404, "Review not found");
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return responseToError(error as Error, res);
  }
};