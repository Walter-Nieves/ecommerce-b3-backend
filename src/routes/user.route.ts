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
} from "../controllers/user.controller";
import { authVerify } from "../middlewares/auth.middleware";
import { uploadImage } from "../middlewares/file.middleware";
import { BucketRoutes } from "../types/enums";

const router = Router();

// 📌 GET
router.get("/all", getAllUsers);
router.get("/all-deleted", getDeletedUsers);
router.get("/id/deleted/:id", getDeletedUserById);
router.get("/id/:id", getUserById);
router.get("/email/deleted/:email", getDeletedUserByEmail);
router.get("/email/:email", getUserByEmail);
router.get("/me", authVerify(true), getUserMe);

// 📌 CREATE
router.post(
  "/",
  authVerify(false),
  uploadImage(BucketRoutes.UserImages),
  createUser,
); //✅

// 📌 UPDATE
router.put("/:id", authVerify(true), updateUser); //✅

// 📌 DELETE
router.delete("/soft/:id", authVerify(true), softDeleteUser);
router.delete("/force/:id", authVerify(true), forceDeleteUser);

// 📌 PATCH
router.patch("/restore/:id", authVerify(true), restoreUser);
router.patch(
  "/photo/:id",
  authVerify(true),
  uploadImage(BucketRoutes.UserImages),
  updatePhotoUser,
); //✅
router.patch("/password/:id", authVerify(true), updatePasswordUser);

export default router;
