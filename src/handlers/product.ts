import { NextFunction, Request, Response } from "express";
import { ProductModel } from "../models/product";
import { HttpError } from "../errors/error";
import { CartModel } from "../models/cart";
import { Query } from "./query";
export const cheapProductsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.query.sort = "price";
  req.query.limit = "5";
  next();
};
export const createProductHandler = async (req: Request, res: Response) => {
  const { name, price, unit } = req.body;
  if (!name || !price || !unit) {
    throw new HttpError("Name, price and unit are required", 400);
  }
  if (await ProductModel.exists({ name })) {
    throw new HttpError("Product already exists", 400);
  }
  const newProduct = await new ProductModel({ name, price, unit });
  await newProduct.save();
  res.status(201).json({ message: "Product created successfully" });
};
export const updateProductHandler = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  await ProductModel.findByIdAndUpdate(
      productId,
      req.body,
      { new: true }
  );
  res.status(200).json({ message: "Product updated successfully" });
};
export const getAllProductsHandler = async (req: Request, res: Response) => {
  //Filtering
  const productQuery = await (
    await (
      await (await new Query(ProductModel.find(), req.query).filter()).sort()
    ).limitFields()
  ).paginate();

  res.status(200).json(await productQuery.data);
};
export const getProductHandler = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new HttpError("Product not found", 404);
  }
  res.status(200).json(product);
};
export const deleteProductHandler = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  await CartModel.deleteMany({ productId });
  await ProductModel.deleteOne({ _id: productId });

  res.status(200).json({ message: "Product deleted successfully" });
};
