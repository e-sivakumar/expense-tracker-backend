import express from "express";
import { createUser, login, resetPassword } from "../controllers/authController";
import { validateUser } from "../middlewares/userValidation";

export const authRoutes = express.Router();

authRoutes.post("/signup", createUser);
authRoutes.post("/login", login);
// authRoutes.put("/forgot-password");
authRoutes.put("/reset-password", validateUser, resetPassword);