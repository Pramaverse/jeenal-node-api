import { Request, Response } from "express";
import { CartModel } from "../models/cart";
import { ProductModel } from "../models/product";
export const getProductsInCartHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const cart = await CartModel.find({ userId }).populate("productId");
  res.status(200).json(cart);
};
export const addProductToCart = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { productId } = req.params;
  const { quantity } = req.body;
  await ProductModel.findById(productId);

  await CartModel.findOneAndUpdate(
    { userId, productId },
    { $inc: { quantity } },
    { upsert: true, new: true }
  );

  res.status(201).json({ message: "Product added to cart successfully" });
};

export const updateCartHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { productId } = req.params;

  const { quantity } = req.body;
  await CartModel.findOneAndUpdate(
    { userId, productId },
    { $set: { quantity } }
  );

  res.status(200).json({ message: "Cart updated successfully" });
};

export const deleteFromCartHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { productId } = req.params;
  await CartModel.findOneAndDelete({ userId, productId });

  res.status(200).json({ message: "Product deleted from cart successfully" });
};
