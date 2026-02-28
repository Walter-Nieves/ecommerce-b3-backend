// import { Request, Response, NextFunction } from "express";
// import { upload, storage } from "../db/supabase";
// import { responseToError } from "../utils/validations";
// import { middleware } from "./types";

// export function uploadImage(): middleware<Response | undefined> {
//     return upload.single("image")(req, res, next) => {
//         try {
//             res.status(200).json({ message: "Imagen subida exitosamente" });
//         } catch (error) {
//             return responseToError(error as Error, res);
//         }
//     }
// }

// export async function handleTestImageUpload(req: Request, res: Response) {

//     console.log(req.file);
//     try {
//         const file = req.file;
//         if (!file) return res.status(400).send("No se subió ninguna imagen.");
//         const fileExtension = file.originalname.split(".").pop();
//         const fileName = `${Date.now()}.${fileExtension}`;
//         const filePath = `uploads/${fileName}`;

//         const { error: storageError } = await storage
//             .from("user_images") // Nombre de tu bucket
//             .upload(filePath, file.buffer, {
//                 contentType: file.mimetype,
//             });

//         if (storageError) throw storageError;

//         const { data: publicUrlData } = storage
//             .from("user_images")
//             .getPublicUrl(filePath);

//         const imageUrl = publicUrlData.publicUrl;

//         await sql`
//       INSERT INTO test_image (foto) VALUES (${imageUrl})`;

//         res.json({ imageUrl });
//     } catch (error) {
//         console.error("Error al subir imagen:", error);
//         res.status(500).send("Error al subir imagen");
//     }
// });
