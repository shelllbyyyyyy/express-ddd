import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {
  ExtractJwt,
  StrategyOptions,
  Strategy as JwtStrategy,
} from "passport-jwt";

import { AuthServiceImpl } from "@/user/application/auth.service.impl";
import { UserService } from "@/user/domain/services/user.service";
import { ACCESS_TOKEN_SECRET } from "@/shared/common/config";

import { BcryptService } from "../bcrypt";
import { TokenService } from "../token";

const userService = new UserService();
const bcryptService = new BcryptService();
const tokenService = new TokenService();
const authServiceImpl = new AuthServiceImpl(
  userService,
  bcryptService,
  tokenService
);

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req: any) => {
      return req.cookies?.access_token;
    },
  ]),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
  "jwt",
  new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      const user = await userService.findUser(jwtPayload.email);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        if (!email) {
          done(null, false);
        }

        const user = await authServiceImpl.validateCredentialsUser({
          email,
          password,
        });

        if (user.Email == email) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (e) {
        done(e);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  if (!user.id) {
    return done(new Error("Invalid user object"));
  }

  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userService.findUserById(id);

    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
