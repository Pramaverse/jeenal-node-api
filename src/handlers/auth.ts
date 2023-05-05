import { Response, Request } from "express";
import { IUser, UserModel } from "../models/user";
import * as bcrypt from "bcrypt";
import { createToken } from "../jwt";

export const signupHandler = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email and password are required" });
    return;
  }

  if (await UserModel.exists({ email })) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const user = await new UserModel({ name, email, password });
  await user.save();

  const token = createToken({ id: user._id, role: user.role });
  res.status(201).json({ token: token });
};

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user: IUser = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    res.status(400).json({ message: "Invalid email and password!" });
    return;
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    res.status(400).json({ message: "Invalid email and password!" });
    return;
  }
  const token = createToken({ id: user._id, role: user.role });
  res.status(200).json({ token });
};
