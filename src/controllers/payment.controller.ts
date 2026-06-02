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

const BACKEND_URL = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

// Hacer peticion de pago
export async function create(req: Request, res: Response) {
    try {

        validateRoleForActions(res.locals.user.role, [Role.Admin, Role.Seller, Role.Buyer]);

        const userId = validateId(res.locals.user.sub);

        const pendingCart = await getOrCreatePendingCart(userId);

        const items = await getCartItems(pendingCart.id, userId);

        if (items.length === 0) {
            resError(400, "Cart is empty");
        }
        // PENDIENTE, NO BORRAR
        // const [updated] = await sql<{ id: string; status: CartStatus }[]>`
        //       UPDATE shopping_cart
        //       SET status = 'processing'
        //       WHERE id = ${pendingCart.id}
        //       AND user_id = ${userId}
        //       AND status = 'pending'
        //       RETURNING id, status
        //     `;

        // if (!updated) {
        //     resError(404, "Pending cart not found");
        // }

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

        // Si hay token, empezar a crear orden
        const order: CreateOrderRequestBody = {
            intent: "CAPTURE",
            // pendiente
            purchase_units:
            // items.map(item => {
            //     return {
            //         reference_id: item.shopping_cart_id,
            //         amount: {
            //             currency_code: "CO",
            //             value: item.item_total.toString()
            //         }
            //     }
            // })
            [
                {
                    description: "Unit 1",
                    amount: {
                        currency_code: "USD",
                        value: "10.00"
                    }
                }
            ]
            ,
            application_context: {
                brand_name: "ChronoLux",
                landing_page: "NO_PREFERENCE",
                user_action: "PAY_NOW",
                return_url: `${BACKEND_URL}/api/payment/capture`,
                cancel_url: `${BACKEND_URL}/api/payment/cancel`
            }
        };

        const { data } = await axios.post(`${PAYPAL_API_URL}/v2/checkout/orders`, order, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })

        res.json(data.links[1]);
    } catch (error) {
        return responseToError(error as Error, res);
    }
}

// El pago fue realizado
export async function capture(req: Request, res: Response) {
    try {
        res.json("Payment captured");
    } catch (error) {
        return responseToError(error as Error, res);
    }
}

// El pago fue cancelado
export async function cancel(req: Request, res: Response) {
    try {
        res.json("Payment captured");
    } catch (error) {
        return responseToError(error as Error, res);
    }
}