import { Router } from "express";
import { login, logout, refresh } from "../controllers/auth.controller";

const authRoute = Router();

authRoute.post("/login", login);

authRoute.post("/refresh", refresh);

authRoute.post("/logout", logout);

export default authRoute;
