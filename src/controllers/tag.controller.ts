import { Request, Response } from "express";
import sql from "../db/supabase";

export async function getAllTag(req: Request, res: Response) {
  try {
    const tags = await sql`SELECT * FROM TAG ORDER BY name`;
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las etiquetas" });
  }
}
