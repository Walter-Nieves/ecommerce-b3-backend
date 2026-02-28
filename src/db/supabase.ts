import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();
export const sql = postgres(process.env.DATABASE_URL as string);
export const { storage } = createClient(
  process.env.SUPABASE_URL as string,
  process.env.ANON_KEY as string,
);
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
