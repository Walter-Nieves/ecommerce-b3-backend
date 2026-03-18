import { Router } from "express";
import { checkCode, login, logout, refresh, sendCode } from "../controllers/auth.controller";

const authRoute = Router();

authRoute.post("/login", login);

authRoute.post("/send-check-code", sendCode);

authRoute.post("/check-code", checkCode);

authRoute.post("/refresh", refresh);

authRoute.post("/logout", logout);

export default authRoute;
