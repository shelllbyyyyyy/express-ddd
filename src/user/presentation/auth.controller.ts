import { NextFunction, Request, Response } from "express";

import { HttpStatus } from "@/shared/common/enum/http-status";
import { ApiResponse } from "@/shared/common/response/api";
import { UserSchema } from "@/shared/dto/user/user.dto";
import { BcryptService } from "@/shared/libs/bcrypt";
import { TokenService } from "@/shared/libs/token";
import { NODE_ENV } from "@/shared/common/config";
import { LoginSchema } from "@/shared/dto/user/login.dto";

import { UserService } from "../domain/services/user.service";
import { AuthServiceImpl } from "../application/auth.service.impl";

const userService = new UserService();
const bcryptService = new BcryptService();
const tokenService = new TokenService();
const authServiceImpl = new AuthServiceImpl(
  userService,
  bcryptService,
  tokenService
);

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    const { email, password, username } = req.body as UserSchema;

    try {
      const user = await authServiceImpl.register({
        email,
        password,
        username,
      });

      res
        .status(HttpStatus.CREATED)
        .json(
          new ApiResponse(HttpStatus.CREATED, "Register user successfull", user)
        );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body as LoginSchema;

    try {
      const token = await authServiceImpl.login({ email, password });

      res.cookie("access_token", token.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
        path: "/",
      });

      res
        .status(HttpStatus.OK)
        .json(new ApiResponse(HttpStatus.OK, "Login successfully", null));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authServiceImpl.logOut((req as any).user.sub);

      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      res
        .status(HttpStatus.OK)
        .json(new ApiResponse(HttpStatus.OK, "You have been logout!", null));
    } catch (error) {
      next(error);
    }
  }
}
