import * as request from "supertest";
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
import { UserModel } from "../models/user";
import { ProductModel } from "../models/product";
import {
  createMockAdminUser,
  createMockUser,
  getMockProductData,
} from "../utils/mocks";
import { CartModel } from "../models/cart";
import { Application } from "express";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

describe("Product API Endpoints", () => {
  let app: Application;
  let userData: Awaited<ReturnType<typeof createMockUser>>;
  let token: string;
  // set type of product to be the return type of getMockProductData function
  let product: ReturnType<typeof getMockProductData>;

  beforeAll(async () => {
    app = await setupApi();
    userData = await createMockUser();
    const response = await request(app).post("/auth/login").send({
      email: userData.email,
      password: userData.password,
    });
    token = response.body.token;
  });

  beforeEach(async () => {
    product = getMockProductData();
  });

  afterEach(async () => {
    await ProductModel.deleteMany({});
  });

  afterAll(async () => {
    await UserModel.findOneAndDelete({ email: userData.email });
    await CartModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("User Accessible Endpoints", () => {
    describe("GET /products", () => {
      it("should respond with an array of products", async () => {
        await ProductModel.create(product);
        await request(app)
          .get("/products")
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
          .then((response) => {
            expect(response.body.length).toBeGreaterThan(0);
          });
      });
    });

    describe("GET /products/:id", () => {
      it("should respond with 200 and product data if the product exists", async () => {
        const productData = await ProductModel.create(product);
        await request(app)
          .get(`/products/${productData.id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toBe(product.name);
          });
      });

      it("should respond with 404 if the product does not exist", async () => {
        const objectId = new mongoose.Types.ObjectId();
        await request(app)
          .get(`/products/${objectId}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(404);
      });
    });
  });

  describe("Admin Accessible Endpoints", () => {
    let adminUser: Awaited<ReturnType<typeof createMockAdminUser>>;
    let adminToken: string;
    beforeAll(async () => {
      adminUser = await createMockAdminUser();
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: adminUser.email,
          password: adminUser.password,
        })
        .expect(200);

      adminToken = response.body.token;
    });

    describe("POST /admin/products", () => {
      it("should respond with 404 if user is not admin", async () => {
        await request(app)
          .post("/admin/products")
          .set("Authorization", `Bearer ${token}`)
          .send(product)
          .expect(404);
      });
      it("should respond 201 after creating product", async () => {
        const response = await request(app)
          .post("/admin/products")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(product)
          .expect(201);

        expect(response.body.message).toBe("Product created successfully");
      });
      it("should respond 400 if name|price|unit is missing", async () => {
        const response = await request(app)
          .post("/admin/products")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            name: product.name,
            price: product.price,
          })
          .expect(400);
        expect(response.body.message).toBe("Name, price and unit are required");
      });
      it("should respond 400 if product is already exists", async () => {
        await ProductModel.create(product);
        const response = await request(app)
          .post("/admin/products")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(product)
          .expect(400);
        expect(response.body.message).toBe("Product already exists");
      });
    });

    describe("PUT /admin/products/:id", () => {
      it("should respond with 404 if user is not admin", async () => {
        await request(app)
          .put("/admin/products")
          .set("Authorization", `Bearer ${token}`)
          .send(product)
          .expect(404);
      });
      it("should respond 200 after updating product", async () => {
        const newProduct = await ProductModel.create(product);
        await request(app)
          .put(`/admin/products/${newProduct._id}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ price: 200 })
          .expect(200);
      });
      it("should respond with 200 even if the product does not exist", async () => {
        const objectId = new mongoose.Types.ObjectId();
        await request(app)
          .put(`/admin/products/${objectId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ price: 200 })
          .expect(200);
      });
      it("should respond 400 If you provide wrong productId", async () => {
        await request(app)
          .put(`/admin/products/${faker.datatype.uuid()}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ price: 200 })
          .expect(400);
      });
    });

    describe("DELETE /admin/products/:id", () => {
      it("should respond with 404 if user is not admin", async () => {
        await request(app)
          .delete("/admin/products")
          .set("Authorization", `Bearer ${token}`)
          .send(product)
          .expect(404);
      });

      it("should respond with 200 even if the product does not exist", async () => {
        const objectId = new mongoose.Types.ObjectId();
        await request(app)
          .delete(`/admin/products/${objectId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(200);
      });

      it("should respond with 200 after deleting product", async () => {
        const newProduct = await ProductModel.create(product);
        await CartModel.create({
          userId: userData.id,
          productId: newProduct._id,
          quantity: 1,
        });

        const response = await request(app)
          .delete(`/admin/products/${newProduct._id}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.message).toBe("Product deleted successfully");

        expect(
          await CartModel.findOne({
            userId: userData.id,
            productId: newProduct._id,
          })
        ).toBe(null);
      });
    });
  });
});
