import { Router } from "express";
import {
  getAllUsers,
  getDeletedUsers,
  getUserById,
  //createUser,
  //updateUser,
  //softDeleteUser,
  getDeletedUserById,
  //restoreUser,
  //forceDeleteUser,
  getUserByEmail,
  getDeletedUserByEmail,
} from "../controllers/user.controller";
import { createSecureServer } from "http2";

const router = Router();

// 📌 Obtener todos
router.get("/all", getAllUsers);
router.get("/all-deleted", getDeletedUsers);

// 📌 Buscar por ID
router.get("/id/:id", getUserById);
router.get("/id/deleted/:id", getDeletedUserById);

// 📌 Buscar por EMAIL
router.get("/email/:email", getUserByEmail);
router.get("/email/deleted/:email", getDeletedUserByEmail);

// router.post("/", createUser);
// router.put("/:id", updateUser);

// router.delete("/force/:id", forceDeleteUser);
// router.delete("/soft/:id", softDeleteUser);

// router.patch("/restore/:id", restoreUser);

export default router;
