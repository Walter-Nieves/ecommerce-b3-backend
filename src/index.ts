import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import morgan from "morgan";
import address from "./routes/address.route";
import auth from "./routes/auth.route";
import brand from "./routes/brand.route";
import cartRoute from "./routes/cart.route";
import category from "./routes/category.route";
import clasp from "./routes/clasp.route";
import color from "./routes/color.route";
import inventoryRoute from "./routes/inventory.route";
import material from "./routes/material.route";
import payment from "./routes/payment.route";
import primitives from "./routes/primitves.route";
import product from "./routes/product.route";
import reviewRoute from "./routes/review.route";
import tag from "./routes/tag.route";
import user from "./routes/user.route";


dotenv.config();

import { sql } from "./db/supabase";

const app = express();

app.use(
  cors({
    origin: process.env.FRONT_DOMAIN,
    credentials: true,
  }),
);
app.use(json());
app.use(cookieParser());
app.use(morgan("dev"));


app.use("/api/tag", tag);
app.use("/api/clasp", clasp);
app.use("/api/category", category);
app.use("/api/material", material);
app.use("/api/color", color);
app.use("/api/brand", brand);
app.use("/api/user", user);
app.use("/api/primitives", primitives);
app.use("/auth", auth);
app.use("/api/address", address)
app.use("/api/product", product)
app.use("/api/review", reviewRoute);
app.use("/api/inventory", inventoryRoute)
app.use("/api/cart", cartRoute);
app.use("/api/payment", payment);

const PORT = Number(process.env.PORT ?? 3000);

app.get("/ping", (_, res) => {
  res.send("pong");
});

// Función para mantener activa la base de datos de Supabase
const startSupabaseKeepAlive = () => {
  // Ejecuta cada 1 hora
  const INTERVAL_MS = 60 * 60 * 1000;

  setInterval(async () => {
    try {
      // Hacemos una consulta super ligera para registrar actividad
      await sql`SELECT 1`;
      console.log(`[Keep-Alive] Consulta a Supabase exitosa: ${new Date().toISOString()}`);
    } catch (error) {
      console.error("[Keep-Alive] Error al pingear Supabase:", error);
    }
  }, INTERVAL_MS);
};

// Iniciar el keep-alive
startSupabaseKeepAlive();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
