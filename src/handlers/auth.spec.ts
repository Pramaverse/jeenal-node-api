import { setupApi } from "../app";
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
import { UserModel } from "../models/user";
import { Application } from "express";
import mongoose from "mongoose";
import {faker} from "@faker-js/faker";

describe("POST /signup", () => {
  let app: Application;
  let userData: any;

  beforeAll(async () => {
    app = await setupApi();
  });

  beforeEach(async () => {
    userData = {
        name: faker.name.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
    };
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await UserModel.deleteMany({ email: userData.email });
  });

  it("should create a new user and return a 201 response with a token", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send(userData)
      .expect(201);
    expect(response.body.token).toBeDefined();
  });
  it("should return a 400 response if name/password/email is missing", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send({ name: userData.name, email: userData.email })
      .expect(400);
    expect(response.body.message).toBe("Name, email and password are required");
  });
  it("should return a 400 response if user already exists", async () => {
    await UserModel.create(userData);
    const response = await request(app)
      .post("/auth/signup")
      .send(userData)
      .expect(400);
    expect(response.body.message).toBe("User already exists");
  });
});

describe("POST /login", () => {
  let app: any;
  let userData: any;
  beforeEach(async () => {
    app = await setupApi();
    userData = {
      name: "Test User234",
      email: "testuser234@example.com",
      password: "test234password",
    };
    await UserModel.create(userData);
  });
  afterEach(async () => {
    await UserModel.deleteMany({ email: userData.email });
  });
  it("should return a 200 response with a token", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password })
      .expect(200);
    expect(response.body.token).toBeDefined();
  });
  it("should return a 400 response if email/password is missing", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userData.email })
      .expect(400);
    expect(response.body.message).toBe("Email and password are required");
  });
  it("should return a 400 response if user does not exist", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "abc@gmail.com", password: "test234password" })
      .expect(400);

    expect(response.body.message).toBe("Invalid email and password!");
  });
});
