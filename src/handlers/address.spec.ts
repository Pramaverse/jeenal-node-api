import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { Application } from "express";
import { setupApi } from "../app";
import { UserModel } from "../models/user";
import mongoose from "mongoose";
import * as request from "supertest";
import { createMockUser, getMockAddressData } from "../utils/mocks";
import { faker } from "@faker-js/faker";

describe("User Address Endpoints", () => {
  let app: Application;
  let userData: any;
  let token: string;

  beforeEach(async () => {
    app = await setupApi();
    userData = await createMockUser();
    const response2 = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password });
    token = response2.body.token;
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /users/me/address", () => {
    it("should return 400 response if any of the required fields are missing", async () => {
      await request(app)
        .post("/users/me/address")
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .expect(400);
    });

    it("should return 201 response if address is successfully created", async () => {
      const address = getMockAddressData();

      await request(app)
        .post("/users/me/address")
        .set("Authorization", `Bearer ${token}`)
        .send(address)
        .expect(200);
    });
  });

  describe("GET /users/me/address", () => {
    it("should return 200 response if address is successfully retrieved", async () => {
      // initially the list of addresses should be empty
      await request(app)
        .get("/users/me/address")
        .set("Authorization", `Bearer ${token}`)
        .expect(200, []);
      const address = getMockAddressData();
      // add address to user
      await UserModel.findOneAndUpdate(
        { _id: userData.id },
        { $push: { address } },
        { new: true }
      );
      const response = await request(app)
        .get("/users/me/address")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.length).toEqual(1);
    });
  });

  describe("DELETE /users/me/address/:id", () => {
    it("should return 200 response if address is successfully deleted", async () => {
      const address = getMockAddressData();
      // add address to user
      const user = await UserModel.findOneAndUpdate(
        { _id: userData.id },
        { $push: { address } },
        { new: true }
      );

      await request(app)
        .delete(`/users/me/address/${user.address[0]._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });

    it("should return 200 even if the address id does not exist", async () => {
      const objectId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/users/me/address/${objectId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });

    it("should return 400 if address id is not a valid object id", async () => {
      await request(app)
        .delete(`/users/me/address/${faker.datatype.uuid()}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });
  });
});
