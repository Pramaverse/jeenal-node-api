import { setupApi } from "../app";
import {
  createMockAdminUser,
  createMockProduct,
  createMockUserWithAddress,
} from "../utils/mocks";
import * as request from "supertest";
import { UserModel } from "../models/user";
import { Application } from "express";
import mongoose from "mongoose";
import { IProduct, ProductModel } from "../models/product";
import { CartModel } from "../models/cart";
import { OrderModel } from "../models/order";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from "@jest/globals";

describe("Orders API Endpoints", () => {
  let app: Application;
  let userData: any;
  let token: string;
  let product: IProduct;
  beforeAll(async () => {
    app = await setupApi();
    userData = await createMockUserWithAddress();
    product = await createMockProduct();
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password });
    token = response.body.token;
  });
  afterAll(async () => {
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await OrderModel.deleteMany({});
    await CartModel.deleteMany({});
  });

  describe("User Endpoints", () => {
    describe("POST /orders", () => {
      it("should respond with 201 when order is successfully created", async () => {
        // add product to cart
        await CartModel.create({
          userId: userData.id,
          productId: product._id,
          quantity: 1,
        });
        // create order
        await request(app)
          .post("/orders")
          .set("Authorization", `Bearer ${token}`)
          .send({ addressId: userData.address[0]._id })
          .expect(200);
        expect(await CartModel.find({ userId: userData.id })).toEqual([]);
      });

      it("should respond with 400 when there are no products in cart", async () => {
        await request(app)
          .post("/orders")
          .set("Authorization", `Bearer ${token}`)
          .send({ addressId: userData.address[0]._id })
          .expect(400);
        expect(await CartModel.find({ userId: userData.id })).toEqual([]);
      });

      it("should respond with 400 when addressId is not provided", async () => {
        await request(app)
          .post("/orders")
          .set("Authorization", `Bearer ${token}`)
          .send({})
          .expect(400);
        expect(await CartModel.find({ userId: userData.id })).toEqual([]);
      });
    });

    describe("GET /orders", () => {
      it("should respond with 200 when orders are fetched successfully", async () => {
        await OrderModel.create({
          userId: userData.id,
          address: userData.address[0],
          products: [product],
          amount: product.price,
        });

        const response = await request(app)
          .get("/orders")
          .set("Authorization", `Bearer ${token}`)
          .expect(200);

        expect(response.body.length).toBe(1);
      });
    });

    describe("PUT /orders/:orderId", () => {
      it("should respond with 200 when order status is updated successfully", async () => {
        const order = await OrderModel.create({
          userId: userData.id,
          address: userData.address[0],
          products: [product],
          amount: product.price,
        });

        await request(app)
          .put(`/orders/${order._id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ status: "completed" })
          .expect(200);

        expect((await OrderModel.findById(order._id)).state).toBe("completed");
      });

      it("should respond with 400 when order id is not provided", async () => {
        await request(app)
          .put(`/orders/null`)
          .set("Authorization", `Bearer ${token}`)
          .send({ status: "completed" })
          .expect(400);
      });
    });
  });

  describe("Admin Endpoints", () => {
    describe("GET /admin/orders", () => {
      it("should respond with 404 when user is not admin", async () => {
        await request(app)
          .get("/admin/orders")
          .set("Authorization", `Bearer ${token}`)
          .expect(404);
      });

      it("should respond with 200 when orders are fetched successfully", async () => {
        // create order
        await OrderModel.create({
          userId: userData.id,
          address: userData.address[0],
          products: [product],
          amount: product.price,
        });

        // create an admin user
        const adminUser = await createMockAdminUser();
        // get token for admin user
        const response = await request(app)
          .post("/auth/login")
          .send({ email: adminUser.email, password: adminUser.password })
          .expect(200);

        const adminToken = response.body.token;
        const adminResponse = await request(app)
          .get("/admin/orders")
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(200);

        expect(adminResponse.body.length).toBe(1);
      });
    });
  });
});
