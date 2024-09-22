import { Router } from "express";

import { AuthMiddleware } from "@/middleware";
import { Routes } from "@/shared/common/interface/route.interface";

import { UserController } from "./user.controller";
import passport from "passport";

export class UserRoute implements Routes {
  private userController = new UserController();
  public path = "/users";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/:email`,
      AuthMiddleware,
      passport.authenticate("jwt", { session: false }),
      this.userController.findUser
    );
    this.router.delete(
      `${this.path}/:email`,
      AuthMiddleware,
      passport.authenticate("jwt"),
      this.userController.deleteUser
    );
    this.router.patch(
      `${this.path}/:email`,
      AuthMiddleware,
      passport.authenticate("jwt"),
      this.userController.updatePassword
    );
  }
}
