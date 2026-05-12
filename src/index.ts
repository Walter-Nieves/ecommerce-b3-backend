import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import tag from "./routes/tag.route";
import clasp from "./routes/clasp.route";
import category from "./routes/category.route";
import material from "./routes/material.route";
import color from "./routes/color.route";
import brand from "./routes/brand.route";
import user from "./routes/user.route";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import auth from "./routes/auth.route";
import address from "./routes/address.route";
import primitives from "./routes/primitves.route";
import product from "./routes/product.route";
import reviewRoute from "./routes/review.route";


dotenv.config();

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
app.use("/api/reviews", reviewRoute);

const PORT = Number(process.env.PORT ?? 3000);

app.get("/ping", (_, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
