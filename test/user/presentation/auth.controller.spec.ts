import supertest from "supertest";
import dotenv from "dotenv";

import { pool } from "@/shared/libs/pg/pg-module";
import { HttpStatus } from "@/shared/common/enum/http-status";
import { STATUS } from "@/shared/common/response/api";
import { AuthRoute } from "@/user/presentation/auth.route";
import { App } from "@/main";
import { redis } from "@/shared/libs/redis";

dotenv.config();

describe("TEST API /auth", () => {
  let middleware: any;
  let server;
  let token: string;

  const email = "test@gmail.com";
  const username = "newuser";
  const password = "password123";

  const userData = {
    email,
    username,
    password,
  };

  const loginData = {
    email,
    password,
  };

  const wrongEmail = {
    email: "arif123@gmail.com",
    password,
  };

  const wrongPassword = {
    email,
    password: "09983407634",
  };

  beforeAll(() => {
    const appInstance = new App([new AuthRoute()]);
    server = appInstance.listen();
    middleware = appInstance;
  });

  afterAll(async () => {
    await middleware.closeWebpackMiddleware();
    await redis.quit();
    await pool.end();
    await server.close();
  });

  describe("POST /auth/register", () => {
    it("should return 201 register succesfully when register a user", async () => {
      const response = await supertest(server)
        .post("/auth/register")
        .send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Register user successfull"
      );
      expect(response.body).toHaveProperty("code", 201);
      expect(response.body).toHaveProperty("status", STATUS.CREATED);
      expect(response.body).toHaveProperty("data", response.body.data);
    });

    it("should return 409 if email already exists", async () => {
      const response = await supertest(server)
        .post("/auth/register")
        .send(userData);

      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
      expect(response.body).toHaveProperty(
        "message",
        `This email ${userData.email} already exists`
      );
    });
  });

  describe("POST /auth/login", () => {
    it("should return 200 login successfully", async () => {
      const response = await supertest(server)
        .post("/auth/login")
        .send(loginData);

      const result = response.header["set-cookie"];

      const access_token = result[0].split(";");

      token = access_token[0];

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("message", "Login successfully");
      expect(response.body).toHaveProperty("code", HttpStatus.OK);
      expect(response.body).toHaveProperty("status", STATUS.OK);
      expect(response.body).toHaveProperty("data", response.body.data);
    });

    it("should return 404 Email not registered", async () => {
      const response = await supertest(server)
        .post("/auth/login")
        .send(wrongEmail);

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toHaveProperty("message", "Email not registered");
      expect(response.body).toHaveProperty("code", HttpStatus.NOT_FOUND);
      expect(response.body).toHaveProperty("status", STATUS.NOT_FOUND);
      expect(response.body).toHaveProperty("data", response.body.data);
    });

    it("should return 401 Wrong password", async () => {
      const response = await supertest(server)
        .post("/auth/login")
        .send(wrongPassword);

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body).toHaveProperty("message", "Wrong password");
      expect(response.body).toHaveProperty("code", HttpStatus.UNAUTHORIZED);
      expect(response.body).toHaveProperty("status", STATUS.UNAUTHORIZED);
      expect(response.body).toHaveProperty("data", response.body.data);
    });
  });

  describe("POST /auth/logout", () => {
    it("should return 200 logout successfully", async () => {
      const response = await supertest(server)
        .post("/auth/logout")
        .set("Cookie", [token]);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("message", "You have been logout!");
      expect(response.body).toHaveProperty("code", HttpStatus.OK);
      expect(response.body).toHaveProperty("status", STATUS.OK);
      expect(response.body).toHaveProperty("data", response.body.data);
    });
  });
});
