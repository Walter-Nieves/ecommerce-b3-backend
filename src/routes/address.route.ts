import { Router } from "express";
import { authVerify } from "../middlewares/auth.middleware";
import { createAddress, forceDeleteAddress, getAddressById, getAllAddress, getDeletedAddress, restoreAddress, softDeleteAddress, updateAddress } from "../controllers/address.controller";

const router = Router()

router.get("/all", getAllAddress)
router.get("/all-deleted", getDeletedAddress)
router.get("/:id", getAddressById )

router.post("/", authVerify(true), createAddress )

router.put("/:id", authVerify(true), updateAddress )

router.delete("/force/:id", authVerify(true), forceDeleteAddress)
router.delete("/soft/:id", authVerify(true), softDeleteAddress)

router.patch("/restore/:id", authVerify(true), restoreAddress) 


export default router