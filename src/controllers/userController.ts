import { Request, Response } from "express";
import { User } from "../models/userModel";
import {
  generateResponse,
  internalServerErrorResponse,
  invalidArgumentsResponse,
} from "../utils/responseGenerator";

export async function UserProfile(req: Request, res: Response) {
  try {
    const { id } = (req as Request & { user: { id: string } }).user;
    const userData = await User.findOne(
      { _id: id, isDeleted: false },
      { _id: 0, firstName: 1, lastName: 1, email: 1 }
    );
    if (!userData) {
      res.status(400).send(generateResponse("User not found", 400, "failed"));
      return;
    }
    res
      .status(200)
      .send(
        generateResponse(
          "User profile fetched successfully",
          200,
          "success",
          userData
        )
      );
  } catch (err) {
    console.log("err", err);
    res.status(500).send(internalServerErrorResponse());
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).send(invalidArgumentsResponse());
      return;
    }
    const { id } = (req as Request & { user: { id: string } }).user;
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
      res.status(400).send(invalidArgumentsResponse());
      return;
    }
    const existingUser = await User.findOne({email, _id: {$ne: id}, isDeleted: false});
    if(existingUser){
        res.status(400).send(generateResponse("Email already exists", 400, "failed"))
        return
    }
    const userData = await User.findOne({ _id: id, isDeleted: false });
    if (!userData) {
      res.status(400).send(generateResponse("User not found", 400, "failed"));
      return;
    }
    await User.updateOne(
      { _id: id },
      { $set: { firstName, lastName, email, updatedAt: new Date() } }
    );
    res
      .status(200)
      .send(generateResponse("Profile updated successfully", 200, "success"));
  } catch (err) {
    console.log("err", err);
    res.status(500).send(internalServerErrorResponse());
  }
}
