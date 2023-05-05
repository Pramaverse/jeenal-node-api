import * as request from "supertest";
import { setupApi } from "../app";
import { createMockAdminUser, createMockUser } from "../utils/mocks";
import { UserModel } from "../models/user";
import { Application } from "express";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

describe("User API Endpoints", () => {
  let app: Application;
  let userData: Awaited<ReturnType<typeof createMockUser>>;
  let userToken: string;
  let userAdminData: Awaited<ReturnType<typeof createMockAdminUser>>;
  let adminToken: string;
  beforeAll(async () => {
    app = await setupApi();
    userAdminData = await createMockAdminUser();
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userAdminData.email, password: userAdminData.password })
      .expect(200);
    adminToken = response.body.token;
    userData = await createMockUser();
    const userResponse = await request(app)
      .post("/auth/login")
      .send({ email: userData.email, password: userData.password })
      .expect(200);
    userToken = userResponse.body.token;
  });
  afterAll(async () => {
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("User Accessible Endpoints", () => {
    describe("GET /users/me", () => {
      it("should respond 200 with current user's detail", async () => {
        const response = await request(app)
          .get("/users/me")
          .set("Authorization", `Bearer ${userToken}`)
          .expect(200);
        expect(response.body.email).toBe(userData.email.toLowerCase());
      });
    });
  });

  describe("Admin Accessible Endpoints", () => {
    describe("GET /admin/users", () => {
      it("should respond 200 with current user's detail", async () => {
        const response = await request(app)
          .get("/users/me")
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(200);
        expect(response.body.email).toBe(userAdminData.email.toLowerCase());
      });
    });

    describe("GET /admin/users", () => {
      it("should respond with 404 if user is not admin", async () => {
        await request(app)
          .get("/admin/users")
          .set("Authorization", `Bearer ${userToken}`)
          .expect(404);
      });
      it("should respond 200 with array of users", async () => {
        const response = await request(app)
          .get("/admin/users")
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(200);
        expect(response.body.length).toEqual(2);
      });
    });

    describe("GET /admin/users/:id", () => {
      it("should respond with 404 if user is not admin", async () => {
        await request(app)
          .get(`/admin/users/${userData.id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .expect(404);
      });

      it("should respond 200 with user detail by providing user id", async () => {
        await request(app)
          .get(`/admin/users/${userAdminData.id}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(200);
      });
      it("should respond 400 with error message by providing invalid user id", async () => {
        const response = await request(app)
          .get(`/admin/users/{userAdminData.id}123`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(400);
        expect(response.body.message).toBe("invalid input");
      });
    });

    describe("PUT /admin/users/:id", () => {
      it("should respond with 404 if user is not admin", async () => {
        await request(app)
          .put(`/admin/users/${userData.id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({})
          .expect(404);
      });
      it("should respond 200 with updated user message", async () => {
        const response = await request(app)
          .put(`/admin/users/${userAdminData.id}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ userId: userAdminData.id, name: "test" })
          .expect(200);
        expect(response.body.message).toBe("User updated successfully");
      });
      it("should respond 400 with error message when updating user with invalid user id", async () => {
        const response = await request(app)
          .put(`/admin/users/${userAdminData.id}123`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ userId: userAdminData.id })
          .expect(400);
        expect(response.body.message).toBe("invalid input");
      });
      it("should respond 400 with error message when updating user with no user id", async () => {
        const response = await request(app)
          .put(`/admin/users/null`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ userId: userAdminData.id })
          .expect(400);
        expect(response.body.message).toBe("invalid input");
      });
    });

    describe("DELETE /admin/users/:id", () => {
      it("should respond with 404 if user is not admin", async () => {
        await request(app)
          .delete(`/admin/users/${userData.id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .expect(404);
      });

      it("should respond 200 if admin try to delete another admin", async () => {
        const newAdmin=await createMockAdminUser();
        const response = await request(app)
          .delete(`/admin/users/${newAdmin.id}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(200);
      });
      it("should respond 400 if admin try to delete self", async () => {
        const response = await request(app)
            .delete(`/admin/users/${userAdminData.id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(400);
        expect(response.body.message).toBe("Admin cannot be deleted");
      });
      it("should respond 200 and delete the user", async () => {
        const user = await createMockUser();
        await request(app)
          .delete(`/admin/users/${user.id}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(200);
      });
      it("should respond 400 with error message when deleting user with no user id", async () => {
        await request(app)
          .delete(`/admin/users/null`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(400);
      });
    });
  });
});
