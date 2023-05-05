import { Request, Response } from "express";
import { UserModel } from "../models/user";
import { HttpError } from "../errors/error";

export const getAllUsersHandler = async (req: Request, res: Response) => {
  const users = await UserModel.find();
  res.status(200).json(users);
};
export const getUserByIdHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await UserModel.findById(userId);

  res.status(200).json(user);
};
export const getCurrentUserHandler = async (req: Request, res: Response) => {
  res.status(200).json(req.user);
};
export const updateUserByIdHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const data = req.body;

  await UserModel.updateOne(
    {
      _id: userId,
    },
    data
  );
  res.status(200).json({ message: "User updated successfully" });
};
export const deleteUserByIdHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await UserModel.findOne({ _id: userId });
  if (user.role === "admin") {
    throw new HttpError("Admin cannot be deleted", 400);
  }
  await UserModel.deleteOne({ _id: userId });
  res.status(200).json({ message: "User deleted successfully" });
};
