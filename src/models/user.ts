import mongoose, { Schema } from "mongoose";
import validator from "validator";
import { addressSchema, IAddress } from "./address";
import * as bcrypt from "bcrypt";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  role: "user" | "admin";
  photo: string;
  password: string;
  address: IAddress[];
  createdAt: Date;
}
const userSchema: Schema<IUser> = new mongoose.Schema<IUser>({
  name: { type: String, required: [true, "Please tell us your name"] },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, "Please provide a valid email"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  __v: { type: Number, select: false },
  address: {
    type: [addressSchema],
    required: true,
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});
userSchema.pre<IUser>("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

export const UserModel = mongoose.model<IUser>("User", userSchema);
