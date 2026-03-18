import { Router } from "express";
import {
  createUser,
  forceDeleteUser,
  getAllUsers,
  getDeletedUserByEmail,
  getDeletedUserById,
  getDeletedUsers,
  getUserByEmail,
  getUserById,
  getUserMe,
  restoreUser,
  softDeleteUser,
  updatePasswordUser,
  updatePhotoUser,
  updateUser,
  postCheckEmail,
} from "../controllers/user.controller";
import { authVerify } from "../middlewares/auth.middleware";
import { uploadImage } from "../middlewares/file.middleware";
import { BucketRoutes } from "../types/enums";

const router = Router();

// 📌 GET
router.get("/all", authVerify(true), getAllUsers); //✅
router.get("/all-deleted", authVerify(true), getDeletedUsers); //✅
router.get("/id/deleted/:id", authVerify(true), getDeletedUserById); //✅
router.get("/id/:id", authVerify(true), getUserById); //✅
router.get("/email/deleted/:email", authVerify(true), getDeletedUserByEmail); //✅
router.get("/email/:email", authVerify(true), getUserByEmail); //✅
router.get("/me", authVerify(true), getUserMe); //✅

// 📌 CREATE
router.post(
  "/",
  authVerify(false),
  uploadImage(BucketRoutes.UserImages),
  createUser,
); //✅

router.post("/check-email", postCheckEmail);

// 📌 UPDATE
router.put("/:id", authVerify(true), updateUser); //✅

// 📌 DELETE
router.delete("/soft/:id", authVerify(true), softDeleteUser); //✅
router.delete("/force/:id", authVerify(true), forceDeleteUser); //✅

// 📌 PATCH
router.patch("/restore/:id", authVerify(true), restoreUser); //✅
router.patch(
  "/photo/:id",
  authVerify(true),
  uploadImage(BucketRoutes.UserImages),
  updatePhotoUser,
); //✅
router.patch("/password/:id", authVerify(true), updatePasswordUser);

export default router;
