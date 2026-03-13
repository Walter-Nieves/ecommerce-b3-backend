import { Router } from "express";
import { responseToError } from "../utils/validations";
import { movement_type } from "../types/enums";
import { waterproofness_values } from "../types/primitives";

const router = Router();

router.get("/movement-type/all", (_, res) => {
  try {
    const values = Object.keys(movement_type).map((key) => {
      return {
        name: key.slice(0, 1).toUpperCase() + key.slice(1).toLowerCase(),
        refLetter: movement_type[key as keyof typeof movement_type],
        slug: key,
      };
    });
    return res.status(200).json(values);
  } catch (err) {
    return responseToError(err as Error, res);
  }
});
router.get("/waterproofness/all", (_, res) => {
  try {
    const values = waterproofness_values.map((value) => {
      return {
        name: value,
      };
    });
    return res.status(200).json(values);
  } catch (err) {
    return responseToError(err as Error, res);
  }
});

export default router;
