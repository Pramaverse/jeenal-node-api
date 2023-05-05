import { Document, Schema, Model, model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  unit: string;
  createdAt: Date;
}

export const productSchema: Schema<IProduct> = new Schema<IProduct>({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  __v: { type: Number, select: false },
});

export const ProductModel: Model<IProduct> = model<IProduct>(
  "Product",
  productSchema
);
