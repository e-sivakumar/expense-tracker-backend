import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    categories: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { collection: "users", versionKey: false }
);

export const User = mongoose.model("user", userSchema);
