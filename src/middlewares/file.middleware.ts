import { Request, Response, NextFunction } from "express";
import { upload, storage } from "../db/supabase";
import {
  resError,
  responseToError,
  validateBody,
  validateNumber,
  validateUrl,
} from "../utils/validations";
import { BucketRoutes } from "../types/enums";

const bucketName = process.env.SUPABASE_BUCKET as string;

/** Middle ware para manejar la subida de imágenes utilizando Multer y Supabase Storage.
 * recibe la ruta del bucket de Supabase Storage donde se almacenarán las imágenes.
 * El middleware procesa la solicitud de subida de imagen, verifica que se haya subido un archivo y maneja cualquier error que pueda ocurrir durante el proceso.
 */
export function uploadImage(route: BucketRoutes) {
  // Configura Multer para manejar la subida de archivos
  const uploadMiddleware = upload.single("image");
  // Devuelve un middleware que maneja la subida de imágenes
  return (req: Request, res: Response, next: NextFunction) => {
    // Llama al middleware de Multer para procesar la subida de la imagen
    uploadMiddleware(req, res, async () => {
      try {
        // Verifica que se haya subido un archivo
        const file = req.file;
        if (file == null) {
          req.body.imageUrl = validateUrl(req.body.imageUrl);
          return next();
        }
        // Obtener ruta completa del archivo y subirlo a Supabase Storage
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `${Date.now()}.${fileExtension}`;
        const filePath = `${route}/${fileName}`;

        // Subir el archivo a Supabase Storage
        const { error } = await storage
          .from(bucketName)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
          });

        // Manejar errores de subida
        if (error) {
          resError(500, "Error uploading file.");
        }

        // Obtener la URL pública del archivo subido
        const { data } = storage.from(bucketName).getPublicUrl(filePath);
        const imageUrl = data.publicUrl;

        // Agregar la URL de la imagen al objeto req para que esté disponible en los siguientes middlewares o controladores
        req.body.imageUrl = imageUrl;

        // Continuar con el siguiente middleware o controlador
        next();
      } catch (error) {
        responseToError(error as Error, res);
      }
    });
  };
}

export function getAllImages(route: BucketRoutes) {
  return async (req: Request, res: Response) => {
    try {
      const { data, error } = await storage.from(bucketName).list(route, {
        limit: 1000,
        offset: 0,
        sortBy: {
          column: "name",
          order: "desc",
        },
      });

      if (error) {
        resError(500, "Error fetching images.");
      }

      const imagesInBucket = data
        .filter((file) => file.name !== ".emptyFolderPlaceholder")
        .map((file) => {
          const { data } = storage
            .from(bucketName)
            .getPublicUrl(`${route}/${file.name}`);
          return {
            name: file.name,
            url: data.publicUrl,
          };
        });

      return res.status(200).json(imagesInBucket);
    } catch (error) {
      responseToError(error as Error, res);
    }
  };
}
