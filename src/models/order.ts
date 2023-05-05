import { addressSchema, IAddress } from "./address";
import { Model, Schema, Document, model } from "mongoose";

export interface IOrder extends Document {
  userId: Schema.Types.ObjectId;
  address: IAddress;
  createdAt: Date;
  amount: number;
  products: any[];
  state: "processing" | "completed" | "cancelled";
}

export const orderSchema: Schema<IOrder> = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  address: {
    type: addressSchema,
    required: true,
  },
  amount: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
  products: [{ type: Object, required: true }],
  state: {
    type: String,
    enum: ["processing", "completed", "cancelled"],
    required: true,
    default: "processing",
  },
  __v: { type: Number, select: false },
});

export const OrderModel: Model<IOrder> = model<IOrder>("Order", orderSchema);
