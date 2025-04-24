import express from "express";
import { validateUser } from "../middlewares/userValidation";
import { updateProfile, UserProfile } from "../controllers/userController";

export const userRoutes = express.Router();

userRoutes.get("/profile", validateUser, UserProfile);
userRoutes.put("/update-profile", validateUser, updateProfile);