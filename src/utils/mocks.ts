import { UserModel } from "../models/user";
import { ProductModel } from "../models/product";
import { faker } from "@faker-js/faker";

export async function createMockAdminUser() {
  const userData = {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: "admin",
  };
  const userAddress = {
    street: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.stateAbbr(),
    zip: faker.address.zipCode(),
  };
  let user = await UserModel.create(userData);
  user = await UserModel.findOneAndUpdate(
    { _id: user._id },
    { $push: { address: userAddress } },
    { new: true }
  );
  return {
    email: userData.email,
    password: userData.password,
    id: user._id,
    address: user.address,
  };
}
export async function createMockUser() {
  const userData = {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
  const user = await UserModel.create(userData);
  return {
    email: userData.email,
    password: userData.password,
    id: user._id,
  };
}

export function getMockProductData() {
  return {
    name: faker.commerce.productName(),
    price: Number(faker.commerce.price()),
    unit: faker.helpers.arrayElement([
      "kg",
      "g",
      "l",
      "ml",
      "unit",
      "pack",
      "lb",
      "oz",
    ]),
  };
}

export async function createMockProduct() {
  const productData = getMockProductData();
  return await ProductModel.create(productData);
}
export async function createMockUserWithAddress() {
  const userAddress = {
    street: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.stateAbbr(),
    zip: faker.address.zipCode(),
  };
  const newUser = {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
  let user = await UserModel.create(newUser);

  // add address to user
  user = await UserModel.findOneAndUpdate(
    { _id: user._id },
    { $push: { address: userAddress } },
    { new: true }
  );

  return {
    id: user._id,
    email: newUser.email,
    password: newUser.password,
    address: user.address,
  };
}
export function getMockAddressData() {
  return {
    street: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.stateAbbr(),
    zip: faker.address.zipCode(),
  };
}
