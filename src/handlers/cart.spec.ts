import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { setupApi } from "../app";
import * as request from "supertest";
import { UserModel } from "../models/user";
import { createMockProduct, createMockUser } from "../utils/mocks";
import { ProductModel } from "../models/product";
import { CartModel } from "../models/cart";
import { Application } from "express";
import mongoose from "mongoose";

describe("Cart API Endpoints", () => {
  let app: Application;
  let userData: any;
  let token: string;
  let product: any;
  beforeAll(async () => {
    app = await setupApi();
    userData = await createMockUser();
    const response2 = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password });
    token = response2.body.token;
  });
  beforeEach(async () => {
    product = await createMockProduct();
  });
  afterEach(async () => {
    await ProductModel.deleteMany({});
  });
  afterAll(async () => {
    await UserModel.deleteMany({ email: userData.email });
    await CartModel.deleteMany({});
    await mongoose.connection.close();
  });
  describe("User Accessible Endpoints", () => {
    describe("GET /cart/products", () => {

      it("should respond with an array of products in cart", async () => {
        await CartModel.create({productId: product.id, userId: userData.id, quantity: 1});
        await request(app)
            .get("/cart/products")
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .then((response) => {
              expect(response.body.length).toBeGreaterThan(0);
            });
      });
    });
    describe("POST /cart/products/:productId", () => {
      it("should respond 201 after adding product to cart", async () => {
        const response = await request(app)
            .post(`/cart/products/${product.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ productId: product.id, quantity: 1 })
            .expect(201);
        expect(response.body.message).toBe("Product added to cart successfully");
      });
      it("should respond 400 if we miss to pass productId|quantity", async () => {
        const response = await request(app)
            .post(`/cart/products/${product.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(400);
        expect(response.body.message).toBe("invalid input");
      });
    });
    describe("PUT /cart/products/:productId", () => {
      it("should respond 200 once we update the quantity of product in cart", async () => {
        const response = await request(app)
            .put(`/cart/products/${product.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ productId: product.id, quantity: 2 })
            .expect(200);
        expect(response.body.message).toBe("Cart updated successfully");
      });
      it("should respond 400 if we provide wrong productId", async () => {
        const response = await request(app)
            .put(`/cart/products/${product.id}123`)
            .set("Authorization", `Bearer ${token}`)
            .send({ quantity: 2 })
            .expect(400);
        expect(response.body.message).toBe("invalid input");
      });
    });
    describe("DELETE /cart/products/:productId", () => {
      it("should respond 200 once we delete the product from cart", async () => {
        const response = await request(app)
            .delete(`/cart/products/${product.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ productId: product.id })
            .expect(200);
        expect(response.body.message).toBe(
            "Product deleted from cart successfully"
        );
      });
    });
  });

});
