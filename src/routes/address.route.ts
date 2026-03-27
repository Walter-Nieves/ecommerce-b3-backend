import { Router } from "express";
import { authVerify } from "../middlewares/auth.middleware";
import {
  createAddress,
  DeleteAddress,
  getAddressById,
  getAllAddress,
  getAllMeAddress,
  getAllUserAddress,
  updateAddress,
} from "../controllers/address.controller";

const router = Router();

router.get("/all", authVerify(true), getAllAddress);
router.get("/me", authVerify(true), getAllMeAddress);
router.get("/user/:id", authVerify(true), getAllUserAddress);
router.get("/:id", authVerify(true), getAddressById);

router.post("/", authVerify(true), createAddress);

router.put("/:id", authVerify(true), updateAddress);

router.delete("/:id", authVerify(true), DeleteAddress);

export default router;
