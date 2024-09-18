import { NextFunction, Request, Response } from "express";
import { HttpException } from "@/shared/common/exceptions/http-exception";
import { ApiResponse } from "./shared/common/response/api";

export const ErrorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || "Something went wrong";

    res.status(status).json(new ApiResponse(status, message, null));
  } catch (error) {
    next(error);
  }
};
