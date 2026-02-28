import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import tag from "./routes/tag.route";
import clasp from "./routes/clasp.route";
import category from "./routes/category.route";
import material from "./routes/material.route";
import color from "./routes/color.route";
import user from "./routes/user.route";

dotenv.config();

const app = express();

app.use(json());

app.use(
  cors({
    origin: process.env.FRONT_DOMAIN,
    credentials: true,
  }),
);

app.use("/api/tag", tag);
app.use("/api/clasp", clasp);
app.use("/api/category", category);
app.use("/api/material", material);
app.use("/api/color", color);
app.use("/api/user", user);

const PORT = Number(process.env.PORT ?? 3000);

app.get("/ping", (_, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
