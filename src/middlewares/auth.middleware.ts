import { Response } from "express";
import dotenv from "dotenv";
import { resError, responseToError, validateToken } from "../utils/validations";
import { Role } from "../types/enums";
import { middleware } from "./types";

dotenv.config();

export function authVerify(
  needLogin: boolean,
): middleware<Response | undefined> {
  return (req, res, next) => {
    try {
      const { accessToken } = req.cookies;

      if (accessToken == null) {
        if (needLogin) {
          return resError(401, "Token not provided or sesion expired");
        } else {
          const defaultRole = Role.Buyer;
          res.locals.user = { role: defaultRole };
          next();
          return;
        }
      }

      const payload = validateToken(accessToken);
      res.locals.user = payload;

      next();
    } catch (error) {
      return responseToError(error as Error, res);
    }
  };
}
