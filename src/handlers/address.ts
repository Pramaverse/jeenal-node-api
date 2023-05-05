import { Request, Response } from "express";
import { UserModel } from "../models/user";

export async function AddAddressToUserHandler(req: Request, res: Response) {
  const userId = req.user?.id as string;

  const { street, city, state, zip } = req.body;
  await UserModel.findOneAndUpdate(
    { _id: userId },
    { $push: { address: { street, city, state, zip } } },
    { new: true, runValidators: true }
  );

  res.status(200).json({ message: "Address added successfully" });
}
export async function getAddressesOfUserHandler(req: Request, res: Response) {
  const userId = req.user?.id as string;

  const user = await UserModel.findOne({ _id: userId });
  res.status(200).json(user.address);
}
export async function deleteAddressOfUserHandler(req: Request, res: Response) {
  const userId = req.user?.id as string;

  const { addressId } = req.params;
  await UserModel.updateOne(
    {
      _id: userId,
    },
    { $pull: { address: { _id: addressId } } }
  );

  res.status(200).json({ message: "Address deleted successfully" });
}
export async function updateAddressOfUserHandler(req: Request, res: Response) {
  const userId = req.user?.id as string;

  const { addressId } = req.params;
  const { street, city, state, zip } = req.body;
  await UserModel.findOneAndUpdate(
    { _id: userId, "address._id": addressId },
    { $set: { "address.$": { street, city, state, zip } } },
    { new: true, runValidators: true }
  );

  res.status(200).json({ message: "Address updated successfully" });
}
