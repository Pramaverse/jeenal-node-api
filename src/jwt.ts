import * as jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { HttpError } from "./errors/error";
import { UserModel } from "./models/user";

export function createToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = await req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      const user = await UserModel.findById(decoded["id"]);
      if (!user) {
        next(new HttpError("Unauthorized", 401));
        return;
      }
      req.user = user;
      next();
    } else {
      next(new HttpError("Unauthorized", 401));
    }
  } catch (error) {
    next(new HttpError("Unauthorized", 401));
  }
}
