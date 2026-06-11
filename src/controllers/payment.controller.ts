import { CreateOrderRequestBody, PurchaseUnit } from "@paypal/paypal-js";
import axios from "axios";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { resError, responseToError, validateId, validateRoleForActions } from "../utils/validations";
import { Role } from "../types/enums";
import { CartStatus, getCartItems, getOrCreatePendingCart } from "./cart.controller";
import { sql } from "../db/supabase";
dotenv.config();

const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET as string;
const PAYPAL_API_CLIENT_ID = process.env.PAYPAL_API_CLIENT_ID as string;
const PAYPAL_API_URL = process.env.PAYPAL_API_URL as string;

const FRONT_DOMAIN = process.env.FRONT_DOMAIN ?? `http://localhost:5173`;
const BACKEND_URL = process.env.BACKEND_URL ?? `http://localhost:3000`;

/*** First string is userId, second string is cartId */
const pending_pays = new Map<string, string>();

// Hacer peticion de pago
export async function create(req: Request, res: Response) {
    try {

        validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);

        const userId = validateId(res.locals.user.sub);

        const pendingCart = await getOrCreatePendingCart(userId);

        const items = await getCartItems(pendingCart.id);

        if (items.length === 0) {
            resError(400, "Cart is empty");
        }

        const [user_address_info] = await sql<{
            first_name: string,
            last_name: string,
            state: string,
            city: string,
            postal_code: string,
            street_address: string,
            reference: string
        }[]>`SELECT 
            u.first_name, 
            u.last_name, 
            a.state, 
            a.city, 
            a.postal_code, 
            a.street_address, 
            a.reference
            FROM 
                users u
            INNER JOIN 
                address a ON u.id = a.user_id
            WHERE 
            u.id = ${userId} 
            AND a.is_default = TRUE;`;

        if (user_address_info == null) {
            resError(400, "User has no default address");
        }

        // Peticion inicial para solicitar token de acceso
        const params = new URLSearchParams()
        params.append("grant_type", "client_credentials")

        // Se hace uso de axios para poder incluir facilmente params en la peticion
        const { data: { access_token } } = await axios.post(`${PAYPAL_API_URL}/v1/oauth2/token`, params, {
            auth: {
                username: PAYPAL_API_CLIENT_ID,
                password: PAYPAL_API_SECRET
            }
        })

        // Si no hay token, lanzar error
        if (access_token == null) {
            resError(400, "Access token not found");
        }
        const response = await axios.get("https://co.dolarapi.com/v1/cotizaciones/usd");
        const peso = (response.data.compra) * 100;
        const comision_paypal = Math.round(peso * 0.054);

        // Si hay token, empezar a crear orden
        const order: CreateOrderRequestBody = {
            intent: "CAPTURE",
            purchase_units:
                [
                    {
                        description: "Unit 1",
                        amount: {
                            currency_code: "USD",
                            value: ((items.reduce((acc, item) => acc + Number(item.item_total), 0) + comision_paypal) / peso).toFixed(2).toString()
                        },
                    }
                ]
            ,
            application_context: {
                brand_name: "ChronoLux",
                landing_page: "NO_PREFERENCE",
                user_action: "PAY_NOW",
                return_url: `${BACKEND_URL}/api/payment/capture/${userId}`,
                cancel_url: `${BACKEND_URL}/api/payment/cancel/${userId}`
            }
        };

        const { data } = await axios.post(`${PAYPAL_API_URL}/v2/checkout/orders`, order, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })

        pending_pays.set(userId, pendingCart.id);

        res.json(data.links[1]);
    } catch (error) {
        return responseToError(error as Error, res);
    }
}

// Responde con redireccion a frontend

// El pago fue realizado
export async function capture(req: Request, res: Response) {
    try {
        const id = validateId(req.params.id);
        const pendingCartId = pending_pays.get(id);
        if (pendingCartId == null) {
            resError(400, "Pending cart not found");
        }
        // PENDIENTE, NO BORRAR
        const [updated] = await sql<{ id: string; status: CartStatus }[]>`
                UPDATE shopping_cart
                SET status = 'processing'
                WHERE id = ${pendingCartId}
                AND user_id = ${id}
                AND status = 'pending'
                RETURNING id, status
            `;
        if (!updated) {
            resError(404, "Pending cart not found");
        }
        const items = await getCartItems(pendingCartId);
        // update all amounts
        items.forEach(async (item) => {
            await sql`
            UPDATE product_variant
            SET user_quantity = user_quantity - ${item.amount}
            WHERE id = ${item.product_variant_id}
            AND user_quantity >= ${item.amount}
            RETURNING *
            `;
        });
        res.redirect(`${FRONT_DOMAIN}/complete`);
    } catch (error) {
        return responseToError(error as Error, res);
    }
}

// El pago fue cancelado
export async function cancel(req: Request, res: Response) {
    try {
        const id = validateId(req.params.id);
        pending_pays.delete(id);
        res.redirect(`${FRONT_DOMAIN}/cancel`);
    } catch (error) {
        return responseToError(error as Error, res);
    }
}