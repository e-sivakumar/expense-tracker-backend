import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET_KEY || "thesecretkey";

export function generateAccessToken(data: object) {
  return jwt.sign(data, secretKey);
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return null;
  }
}