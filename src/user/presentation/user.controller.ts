import { NextFunction, Request, Response } from "express";

import { HttpStatus } from "@/shared/common/enum/http-status";
import { ApiResponse } from "@/shared/common/response/api";
import { BcryptService } from "@/shared/libs/bcrypt";
import { UpdatePasswordSchema } from "@/shared/dto/user/update-password.dto";

import { UserServiceImpl } from "../application/user.service.impl";
import { UserService } from "../domain/services/user.service";

const userService = new UserService();
const bcryptService = new BcryptService();
const userServiceImpl = new UserServiceImpl(userService, bcryptService);

export class UserController {
  async findUser(req: Request, res: Response, next: NextFunction) {
    const { email } = req.params;

    try {
      const user = await userServiceImpl.findUser(email);

      res
        .status(HttpStatus.OK)
        .json(new ApiResponse(HttpStatus.OK, "User found", user));
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    const { email } = req.params;
    const { oldPassword, newPassword } = req.body as UpdatePasswordSchema;

    try {
      const user = await userServiceImpl.updateUser(
        email,
        oldPassword,
        newPassword
      );

      res
        .status(HttpStatus.OK)
        .json(new ApiResponse(HttpStatus.OK, "Password updated", user));
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { email } = req.params;

    try {
      const user = await userServiceImpl.deleteUser(email);

      res
        .status(HttpStatus.NO_CONTENT)
        .json(new ApiResponse(HttpStatus.NO_CONTENT, "User deleted", user));
    } catch (error) {
      next(error);
    }
  }
}
