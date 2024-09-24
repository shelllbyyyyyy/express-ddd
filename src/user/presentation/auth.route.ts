import { Router } from "express";
import passport from "passport";

import { Routes } from "@/shared/common/interface/route.interface";

import { AuthController } from "./auth.controller";

const router: Router = Router();

export class AuthRoute implements Routes {
  private authController = new AuthController();
  public path = "/auth";
  public router = router;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/register`, this.authController.register);
    this.router.post(
      `${this.path}/login`,
      passport.authenticate("local"),
      this.authController.login
    );
    this.router.post(
      `${this.path}/logout`,
      passport.authenticate("jwt"),
      this.authController.logout
    );
  }
}
