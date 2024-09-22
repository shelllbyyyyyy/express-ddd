import supertest from "supertest";
import dotenv from "dotenv";

import { HttpStatus } from "@/shared/common/enum/http-status";
import { STATUS } from "@/shared/common/response/api";
import { UserRoute } from "@/user/presentation/user.route";
import { App } from "@/main";
import { redis } from "@/shared/libs/redis";
import { AuthRoute } from "@/user/presentation/auth.route";
import { pool } from "@/shared/libs/pg/pg-module";

dotenv.config();

describe("TEST API /users", () => {
  let middleware: any;
  let server: any;
  let token: string;

  const email = "test@gmail.com";
  const password = "password123";
  const newPassword = "password1234";

  const updatePassword = {
    oldPassword: password,
    newPassword: newPassword,
  };

  const updatePasswordNotMatch = {
    oldPassword: password,
    newPassword: password,
  };

  const newPasswordMatchWithOldPassword = {
    oldPassword: newPassword,
    newPassword: newPassword,
  };

  beforeAll(async () => {
    const appInstance = new App([new UserRoute(), new AuthRoute()]);
    server = appInstance.listen();
    middleware = appInstance;

    const response = await supertest(server)
      .post(`/auth/login`)
      .send({ email, password });

    const result = response.header["set-cookie"];
    const access_token = result[0].split(";")[0];

    token = access_token;
  });

  afterAll(async () => {
    await redis.quit();
    await middleware.closeWebpackMiddleware();
    await pool.end();
    await server.close();
  });

  describe("GET /users/:email", () => {
    it("should return 200 user found", async () => {
      const response = await supertest(server)
        .get(`/users/${email}`)
        .set("Cookie", [token]);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("code", HttpStatus.OK);
      expect(response.body).toHaveProperty("status", STATUS.OK);
      expect(response.body).toHaveProperty("message", `User found`);
      expect(response.body).toHaveProperty("data", response.body.data);
    });

    it("should return 404 user not found", async () => {
      const email = "test123@gmail.com";
      const response = await supertest(server)
        .get(`/users/${email}`)
        .set("Cookie", [token]);

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toHaveProperty("code", HttpStatus.NOT_FOUND);
      expect(response.body).toHaveProperty("status", STATUS.NOT_FOUND);
      expect(response.body).toHaveProperty("message", `User not found`);
    });
  });

  describe("PATCH /users/:email", () => {
    it("should return 200 password updated", async () => {
      const response = await supertest(server)
        .patch(`/users/${email}`)
        .send(updatePassword)
        .set("Cookie", [token]);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("code", HttpStatus.OK);
      expect(response.body).toHaveProperty("status", STATUS.OK);
      expect(response.body).toHaveProperty("message", `Password updated`);
      expect(response.body).toHaveProperty("data", response.body.data);
    });

    it("should return 404 user not found", async () => {
      const email = "test12@gmail.com";

      const response = await supertest(server)
        .patch(`/users/${email}`)
        .send(updatePassword)
        .set("Cookie", [token]);

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toHaveProperty("code", HttpStatus.NOT_FOUND);
      expect(response.body).toHaveProperty("status", STATUS.NOT_FOUND);
      expect(response.body).toHaveProperty("message", `User not found`);
    });

    it("should return 401 password not match", async () => {
      const response = await supertest(server)
        .patch(`/users/${email}`)
        .send(updatePasswordNotMatch)
        .set("Cookie", [token]);

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body).toHaveProperty("code", HttpStatus.UNAUTHORIZED);
      expect(response.body).toHaveProperty("status", STATUS.UNAUTHORIZED);
      expect(response.body).toHaveProperty("message", `Password not match`);
    });

    it("should return 400 new password have to be different with old password", async () => {
      const response = await supertest(server)
        .patch(`/users/${email}`)
        .send(newPasswordMatchWithOldPassword)
        .set("Cookie", [token]);

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toHaveProperty("code", HttpStatus.BAD_REQUEST);
      expect(response.body).toHaveProperty("status", STATUS.BAD_REQUEST);
      expect(response.body).toHaveProperty(
        "message",
        `New Password have to be different with old password`
      );
    });
  });

  describe("DELETE /users/:email", () => {
    it("should return 404 user not found", async () => {
      const email = "test123456@gmail.com";

      const response = await supertest(server)
        .delete(`/users/${email}`)
        .set("Cookie", [token]);

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toHaveProperty("code", HttpStatus.NOT_FOUND);
      expect(response.body).toHaveProperty("status", STATUS.NOT_FOUND);
      expect(response.body).toHaveProperty("message", `User not found`);
    });

    it("should return 204 delete user", async () => {
      const email = "test@gmail.com";

      const response = await supertest(server)
        .delete(`/users/${email}`)
        .set("Cookie", [token]);

      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    });
  });
});
