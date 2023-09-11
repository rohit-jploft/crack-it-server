import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import { JWT_SECRET } from "./constant";

interface Payload {
  userId: string;
}

export const createJwtToken = (payload: Payload): string => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "360h" });
  return token;
};

export const verifyJwtToken = (token: string, next: NextFunction): string | null => {
  try {
    const { userId } = jwt.verify(token, JWT_SECRET) as Payload;
    return userId;
  } catch (err) {
    next(err);
    return null;
  }
};
