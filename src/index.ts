import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import tag from "./routes/tag.route";
import clasp from "./routes/clasp.route";
import category from "./routes/category.route";

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
app.use("/api/category", category)

const PORT = Number(process.env.PORT ?? 3000);

app.get("/ping", (_, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
