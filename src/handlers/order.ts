import { Request, Response } from "express";
import { OrderModel } from "../models/order";
import { UserModel } from "../models/user";
import { HttpError } from "../errors/error";
import { CartModel } from "../models/cart";
export async function createOrderHandler(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const { addressId } = req.body;
  const products = await CartModel.find({ userId }).populate("productId");
  if (products?.length == 0) {
    throw new HttpError("There are no products in cart", 400);
  }
  const amount = products.reduce((acc, product) => {
    acc += product.quantity * (product.productId as any).price;
    return acc;
  }, 0);
  const user = await UserModel.findOne({ _id: userId });
  const address = user?.address.find((address) => address._id == addressId);
  const order = await new OrderModel({
    userId,
    address,
    products: products.map((product) => product.toJSON()),
    amount,
  });
  await order.save();
  await CartModel.deleteMany({ userId });
  res.status(200).json({ message: "Order created successfully" });
}
export async function getOrdersOfUserHandler(req: Request, res: Response) {
  const userId = req.user?.id as string;

  const orders = await OrderModel.find({ userId });
  res.status(200).json(orders);
}
export async function changeOrderStatusHandler(req: Request, res: Response) {
  const orderId = req.params.orderId;
  const status = req.body.status;
  const orderObj = await OrderModel.findOne({ _id: orderId });

  await OrderModel.updateOne(
    { _id: orderId },
    { $set: { state: status } },
    { new: true, runValidators: true }
  );

  res.status(200).json({ message: "Order status updated successfully" });
}

export async function getAllOrdersHandler(req: Request, res: Response) {
  const orders = await OrderModel.find();
  res.status(200).json(orders);
}
