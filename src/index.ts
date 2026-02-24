import cors from "cors";
import express, { json } from "express";
import dotenv from "dotenv";
import tag from "./routes/tag.route";

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

const PORT = Number(process.env.PORT ?? 3000);

app.get("/ping", (_, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
