import mongoose, { Schema } from "mongoose";

export interface ICart extends mongoose.Document {
  userId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  quantity: number;
}

export const cartSchema = new mongoose.Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  __v: { type: Number, select: false },
});
export const CartModel = mongoose.model<ICart>("Cart", cartSchema);
