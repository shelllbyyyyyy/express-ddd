import { NextFunction, Request, Response } from "express";

import { HttpException } from "@/shared/common/exceptions/http-exception";
import { ApiResponse } from "@/shared/common/response/api";
import { logger } from "@/shared/common/logger";
import { AuthServiceImpl } from "@/user/application/auth.service.impl";
import { TokenService } from "@/shared/libs/token";
import { BcryptService } from "@/shared/libs/bcrypt";
import { UserService } from "@/user/domain/services/user.service";
import { HttpStatus } from "@/shared/common/enum/http-status";
import { redis } from "@/shared/libs/redis";

const userService = new UserService();
const bcryptService = new BcryptService();
const tokenService = new TokenService();
const authServiceImpl = new AuthServiceImpl(
  userService,
  bcryptService,
  tokenService
);

export const ErrorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || "Something went wrong";

    logger.error(message);
    res.status(status).json(new ApiResponse(status, message, null));
  } catch (error) {
    next(error);
  }
};

export const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const access_token = req.cookies?.access_token;

  try {
    if (!access_token) {
      const id = req.sessionStore.get(req.sessionID, (err, data) => {
        if (err || !data) {
          throw new ApiResponse(
            HttpStatus.UNAUTHORIZED,
            "Token has expired",
            {}
          );
        }
      });

      const chache = `userRefreshToken: ${id}`;

      redis.get(chache, async (err, data) => {
        if (err || !data) {
          throw new ApiResponse(
            HttpStatus.UNAUTHORIZED,
            "Token has expired",
            {}
          );
        }

        const { access_token } = await authServiceImpl.refresh(data);

        req.cookies.access_token = access_token;
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
