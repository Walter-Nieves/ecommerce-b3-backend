
import { Router } from "express";
import {
  getAllUsers,
  getDeletedUsers,
  getUserById,
  getDeletedUserById,
  getUserByEmail,
  getDeletedUserByEmail,
  createUser,
  updateUser,
  softDeleteUser,
  forceDeleteUser,
  restoreUser
} from "../controllers/user.controller";

const router = Router();

// 📌 GET
router.get("/all", getAllUsers);
router.get("/all-deleted", getDeletedUsers);
router.get("/id/:id", getUserById);
router.get("/id/deleted/:id", getDeletedUserById);
router.get("/email/:email", getUserByEmail);
router.get("/email/deleted/:email", getDeletedUserByEmail);

// 📌 CREATE
router.post("/", createUser);

// 📌 UPDATE
router.put("/:id", updateUser);

// 📌 DELETE
router.delete("/soft/:id", softDeleteUser);
router.delete("/force/:id", forceDeleteUser);

// 📌 RESTORE
router.patch("/restore/:id", restoreUser);

export default router;