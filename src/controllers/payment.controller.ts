import { CreateOrderRequestBody, PurchaseUnit } from "@paypal/paypal-js";
import axios from "axios";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { resError, responseToError } from "../utils/validations";
dotenv.config();

const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET as string;
const PAYPAL_API_CLIENT_ID = process.env.PAYPAL_API_CLIENT_ID as string;
const PAYPAL_API_URL = process.env.PAYPAL_API_URL as string;

const BACKEND_URL = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

const currentOrders = new Map<string, PurchaseUnit>();

// Hacer peticion de pago
export async function create(req: Request, res: Response) {
    try {
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
            purchase_units: [
                {
                    description: "Unit 1",
                    amount: {
                        currency_code: "CO",
                        value: "10.00"
                    }
                }
            ],
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

        console.log(data);

        res.json("Payment created");
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